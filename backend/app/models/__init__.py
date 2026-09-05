from app.core.database import Base
from sqlalchemy import Column, String, Integer, Float, ForeignKey, Boolean, DateTime, JSON
from datetime import datetime
from sqlalchemy.orm import relationship

# Explicit String lengths so the schema compiles to correct types on SAP HANA
# (length-less String maps to NVARCHAR(1) there, which would truncate ids).

ID_LEN = 40
NAME_LEN = 200
PLACE_LEN = 120
CODE_LEN = 40
DATE_LEN = 32


class Supplier(Base):
    __tablename__ = 'suppliers'
    id = Column(String(ID_LEN), primary_key=True)
    name = Column(String(NAME_LEN))
    country = Column(String(PLACE_LEN))
    region = Column(String(PLACE_LEN))
    lat = Column(Float, nullable=True)
    lng = Column(Float, nullable=True)
    risk_score = Column(Float)
    reliability_score = Column(Float)
    primary_port_id = Column(String(ID_LEN), ForeignKey('ports.id'))
    status = Column(String(CODE_LEN))
    materials = relationship("SupplierMaterial", back_populates="supplier")


class Material(Base):
    __tablename__ = 'materials'
    id = Column(String(ID_LEN), primary_key=True)
    name = Column(String(NAME_LEN))
    category = Column(String(CODE_LEN))
    criticality = Column(String(CODE_LEN))
    safety_stock = Column(Integer)
    suppliers = relationship("SupplierMaterial", back_populates="material")


class SupplierMaterial(Base):
    __tablename__ = 'supplier_materials'
    supplier_id = Column(String(ID_LEN), ForeignKey('suppliers.id'), primary_key=True)
    material_id = Column(String(ID_LEN), ForeignKey('materials.id'), primary_key=True)
    capacity_per_day = Column(Integer)
    lead_time_days = Column(Integer)
    unit_cost = Column(Float)
    is_primary = Column(Boolean)
    supplier = relationship("Supplier", back_populates="materials")
    material = relationship("Material", back_populates="suppliers")


class Plant(Base):
    __tablename__ = 'plants'
    id = Column(String(ID_LEN), primary_key=True)
    name = Column(String(NAME_LEN))
    city = Column(String(PLACE_LEN))
    country = Column(String(PLACE_LEN))
    lat = Column(Float, nullable=True)
    lng = Column(Float, nullable=True)
    daily_capacity = Column(Integer)
    status = Column(String(CODE_LEN))


class Product(Base):
    __tablename__ = 'products'
    id = Column(String(ID_LEN), primary_key=True)
    name = Column(String(NAME_LEN))
    category = Column(String(CODE_LEN))
    unit_price = Column(Float)
    plant_id = Column(String(ID_LEN), ForeignKey('plants.id'))
    daily_production_capacity = Column(Integer)
    criticality = Column(String(CODE_LEN))
    plant = relationship("Plant")
    materials = relationship("ProductMaterial", back_populates="product")


class ProductMaterial(Base):
    __tablename__ = 'product_materials'
    product_id = Column(String(ID_LEN), ForeignKey('products.id'), primary_key=True)
    material_id = Column(String(ID_LEN), ForeignKey('materials.id'), primary_key=True)
    quantity_required = Column(Integer)
    product = relationship("Product", back_populates="materials")
    material = relationship("Material")


class Order(Base):
    __tablename__ = 'orders'
    id = Column(String(ID_LEN), primary_key=True)
    customer_id = Column(String(ID_LEN))
    product_id = Column(String(ID_LEN), ForeignKey('products.id'))
    quantity = Column(Integer)
    unit_price = Column(Float)
    order_value = Column(Float)
    order_date = Column(String(DATE_LEN))
    required_delivery_date = Column(String(DATE_LEN))
    priority = Column(String(CODE_LEN))
    status = Column(String(CODE_LEN))
    product = relationship("Product")


class Inventory(Base):
    __tablename__ = 'inventory'
    id = Column(String(ID_LEN), primary_key=True)
    plant_id = Column(String(ID_LEN), ForeignKey('plants.id'))
    material_id = Column(String(ID_LEN), ForeignKey('materials.id'))
    on_hand_quantity = Column(Integer)
    reserved_quantity = Column(Integer)
    safety_stock = Column(Integer)


class Port(Base):
    __tablename__ = 'ports'
    id = Column(String(ID_LEN), primary_key=True)
    name = Column(String(NAME_LEN))
    country = Column(String(PLACE_LEN))
    region = Column(String(PLACE_LEN))
    lat = Column(Float, nullable=True)
    lng = Column(Float, nullable=True)
    risk_score = Column(Float)


class TransportRoute(Base):
    __tablename__ = 'transport_routes'
    id = Column(String(ID_LEN), primary_key=True)
    origin = Column(String(ID_LEN))
    destination = Column(String(ID_LEN))
    mode = Column(String(CODE_LEN))
    transit_time_days = Column(Integer)
    capacity_per_day = Column(Integer)
    risk_score = Column(Float)
    status = Column(String(CODE_LEN))


class Disruption(Base):
    __tablename__ = 'disruptions'
    simulation_id = Column(String(ID_LEN), primary_key=True)
    disruption_type = Column(String(CODE_LEN))
    affected_entity_id = Column(String(ID_LEN))
    severity = Column(Float)
    duration_days = Column(Integer)
    status = Column(String(CODE_LEN), default='ACTIVE')  # ACTIVE | RESOLVED
    created_at = Column(DateTime, default=datetime.utcnow)
    resolved_at = Column(DateTime, nullable=True)
    summary = Column(JSON)
    payload = Column(JSON)

# Register the workflow tables (recovery_plans, scenarios) on the shared Base
from app.models.db_models import RecoveryPlanRecord, ScenarioRecord  # noqa: F401,E402
