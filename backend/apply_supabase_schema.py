import os
import psycopg2
from pathlib import Path
from dotenv import load_dotenv
from app.core.database import _normalize_db_url

load_dotenv()

# Use DIRECT_URL (port 5432 session mode) for DDL migrations, or fallback to DATABASE_URL
url = os.environ.get("DIRECT_URL") or os.environ.get("SUPABASE_DATABASE_URL") or os.environ.get("DATABASE_URL")
safe_url = _normalize_db_url(url).replace("postgresql+psycopg2://", "postgresql://")

schema_path = Path(__file__).resolve().parents[1] / "supabase" / "schema.sql"
print(f"Reading schema from: {schema_path}")

if not schema_path.exists():
    print(f"Error: {schema_path} does not exist.")
    exit(1)

with open(schema_path, "r", encoding="utf-8") as f:
    sql_script = f.read()

print(f"Connecting to Supabase PostgreSQL at {safe_url.split('@')[1]}...")
try:
    conn = psycopg2.connect(safe_url)
    conn.autocommit = True
    cur = conn.cursor()
    print("Executing schema.sql in Supabase Cloud...")
    cur.execute(sql_script)
    print("Schema applied successfully!")
    
    # Query all created tables
    cur.execute("SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name")
    tables = [r[0] for r in cur.fetchall()]
    print(f"\nSUCCESS! {len(tables)} tables now provisioned in Supabase public schema:")
    for t in tables:
        print(f"  ✓ {t}")
    
    # Check row counts for key tables
    for t in ["suppliers", "materials", "plants", "ports", "disruptions", "organizations", "roles"]:
        if t in tables:
            cur.execute(f"SELECT COUNT(*) FROM public.{t}")
            count = cur.fetchone()[0]
            print(f"  -> {t}: {count} records seeded")
            
    conn.close()
except Exception as e:
    print("Migration error:", e)
