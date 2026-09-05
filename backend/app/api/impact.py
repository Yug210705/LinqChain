"""Impact Engine API — supply-chain topology, network vulnerabilities and the
disruption lifecycle (simulate → list → detail → resolve → reset)."""
import asyncio

from fastapi import APIRouter, Depends, HTTPException, WebSocket
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.runtime import cache_drop as _cache_drop
from app.core.runtime import cached as _cached
from app.core.runtime import _graph_payload
from app.schemas import DisruptionRequest, DisruptionResponse, MultiDisruptionRequest
from app.services.impact_service import (
    analyze_vulnerabilities,
    get_graph as get_engine_graph,
    run_chaos_monkey,
    simulate_disruption,
    simulate_multi_disruption,
)

router = APIRouter(tags=["Impact Engine"])


@router.post("/api/disruptions/simulate", response_model=DisruptionResponse, summary="Simulate Supply Chain Disruption (Deterministic)")
def simulate(req: DisruptionRequest, db: Session = Depends(get_db)):
    try:
        result = simulate_disruption(db, req)
        _cache_drop("disruptions_list")
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/api/disruptions", summary="List all disruption runs (active + history)")
def list_disruptions(db: Session = Depends(get_db)):
    def _load():
        from app.models import Disruption
        rows = db.query(Disruption).order_by(Disruption.created_at.desc()).all()
        items = []
        for r in rows:
            items.append({
                "simulation_id": r.simulation_id,
                "disruption_type": r.disruption_type,
                "affected_entity_id": r.affected_entity_id,
                "severity": r.severity,
                "duration_days": r.duration_days,
                "status": r.status,
                "created_at": r.created_at.isoformat() if r.created_at else None,
                "resolved_at": r.resolved_at.isoformat() if r.resolved_at else None,
                "summary": r.summary or {},
            })
        return {
            "active": [i for i in items if i["status"] == "ACTIVE"],
            "history": [i for i in items if i["status"] != "ACTIVE"],
        }
    return _cached("disruptions_list", 30, _load)


@router.post("/api/disruptions/reset", summary="Reset all simulated disruptions (active + history)")
def reset_disruptions(db: Session = Depends(get_db)):
    from app.models import Disruption
    deleted = db.query(Disruption).delete()
    db.commit()
    _cache_drop("disruptions_list")
    return {"deleted": deleted}


@router.get("/api/disruptions/{simulation_id}", summary="Get full disruption snapshot")
def get_disruption(simulation_id: str, db: Session = Depends(get_db)):
    from app.models import Disruption
    row = db.query(Disruption).filter_by(simulation_id=simulation_id).first()
    if not row:
        raise HTTPException(status_code=404, detail="Disruption not found")
    payload = dict(row.payload or {})
    payload["status"] = row.status
    payload["created_at"] = row.created_at.isoformat() if row.created_at else None
    payload["resolved_at"] = row.resolved_at.isoformat() if row.resolved_at else None
    return payload


@router.post("/api/disruptions/{simulation_id}/resolve", summary="Resolve a disruption run")
def resolve_disruption(simulation_id: str, db: Session = Depends(get_db)):
    from app.models import Disruption
    from datetime import datetime
    row = db.query(Disruption).filter_by(simulation_id=simulation_id).first()
    if not row:
        raise HTTPException(status_code=404, detail="Disruption not found")
    row.status = "RESOLVED"
    row.resolved_at = datetime.utcnow()
    db.commit()
    _cache_drop("disruptions_list")
    return {"simulation_id": row.simulation_id, "status": "RESOLVED"}


@router.get("/api/supply-chain/graph", summary="Export Full Supply Chain Topology")
def export_graph(db: Session = Depends(get_db)):
    return _cached("supply_graph", 300, lambda: _graph_payload(db))


@router.get("/api/supply-chain/vulnerabilities", summary="Run Graph Theory Bottleneck Analysis")
def get_vulnerabilities(db: Session = Depends(get_db)):
    return analyze_vulnerabilities(db)


@router.get("/api/supply-chain/geojson", summary="Export GeoJSON map for 3D Globe")
def get_geojson(db: Session = Depends(get_db)):
    from app.models import Plant, Port, Supplier
    features = []

    def add_feature(entity, type_name, color):
        if entity.lat is not None and entity.lng is not None:
            features.append({
                "type": "Feature",
                "geometry": {"type": "Point", "coordinates": [entity.lng, entity.lat]},
                "properties": {
                    "id": entity.id,
                    "name": entity.name,
                    "type": type_name,
                    "color": color,
                    "risk": getattr(entity, "risk_score", 0)
                }
            })

    for s in db.query(Supplier).all():
        add_feature(s, "supplier", "#ff9900")
    for p in db.query(Plant).all():
        add_feature(p, "plant", "#00ccff")
    for po in db.query(Port).all():
        add_feature(po, "port", "#ff00ff")

    return {"type": "FeatureCollection", "features": features}


@router.websocket("/ws/disruptions/stream")
async def stream_disruption(websocket: WebSocket, db: Session = Depends(get_db)):
    await websocket.accept()
    try:
        data = await websocket.receive_json()
        req = DisruptionRequest(**data)
        result = simulate_disruption(db, req)

        await websocket.send_json({"event": "INITIAL_SHOCK", "node": f"{req.disruption_type}:{req.affected_entity_id}"})
        await asyncio.sleep(1.0)

        for shortage in result["recovery_context"]["material_shortages"]:
            await websocket.send_json({
                "event": "MATERIAL_IMPACTED",
                "material": shortage["material_id"],
                "runway_days": shortage["shortage_start_day"]
            })
            await asyncio.sleep(0.5)

        for t in result["timeline"]:
            if t["status"] == "HALTED":
                await websocket.send_json({
                    "event": "PRODUCTION_HALTED",
                    "day": t["day"],
                    "material": t["material_id"]
                })
                await asyncio.sleep(0.3)

        for o in result["revenue_impact"]:
            await websocket.send_json({
                "event": "ORDER_AT_RISK",
                "order": o["order_id"],
                "value": o["revenue_at_risk"]
            })
            await asyncio.sleep(0.1)

        await websocket.send_json({"event": "SIMULATION_COMPLETE", "summary": result["summary"]})
    except Exception as e:
        await websocket.send_json({"error": str(e)})
    finally:
        await websocket.close()


@router.post("/api/war-room/simulate-multi", summary="Simulate Simultaneous Multi-Vector Disruptions")
def war_room_simulate(req: MultiDisruptionRequest, db: Session = Depends(get_db)):
    return simulate_multi_disruption(db, req.disruptions)


@router.post("/api/war-room/chaos-monkey", summary="Unleash the Supply Chain Chaos Monkey")
def unleash_chaos_monkey(db: Session = Depends(get_db)):
    """
    Uses Graph Theory (PageRank) to automatically identify the 3 most critical systemic
    vulnerabilities in the enterprise, and then simultaneously destroys them (Severity 1.0)
    to calculate the maximum potential Doomsday impact.
    """
    return run_chaos_monkey(db)