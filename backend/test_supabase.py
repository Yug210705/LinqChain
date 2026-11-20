import os
import psycopg2
from dotenv import load_dotenv
from app.core.database import _normalize_db_url

load_dotenv()
raw_url = os.environ.get("DATABASE_URL", "")
safe_url = _normalize_db_url(raw_url).replace("postgresql+psycopg2://", "postgresql://")

try:
    conn = psycopg2.connect(safe_url)
    cur = conn.cursor()
    cur.execute("SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name")
    tables = [r[0] for r in cur.fetchall()]
    print(f"Total Tables in Supabase: {len(tables)}")
    for t in tables:
        cur.execute(f'SELECT COUNT(*) FROM public."{t}"')
        cnt = cur.fetchone()[0]
        print(f"  * {t}: {cnt} rows")
    conn.close()
except Exception as e:
    print("Error:", e)
