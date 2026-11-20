-- Initialize multiple PostgreSQL databases for LinqChain (main + admin)
SELECT 'CREATE DATABASE linqchain_admin'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'linqchain_admin')\gexec
GRANT ALL PRIVILEGES ON DATABASE linqchain_admin TO linqchain;
