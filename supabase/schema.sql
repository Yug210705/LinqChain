-- ==============================================================================
-- LINQCHAIN — ENTERPRISE SUPABASE DATABASE SCHEMA
-- Complete Data Architecture for PostgreSQL & Supabase Cloud
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 2. TENANCY, ROLES, RBAC & USERS
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    settings JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) UNIQUE NOT NULL,
    description VARCHAR(500),
    is_system BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resource VARCHAR(50) NOT NULL,
    action VARCHAR(50) NOT NULL,
    description VARCHAR(500),
    CONSTRAINT uq_permission_resource_action UNIQUE (resource, action)
);

CREATE TABLE IF NOT EXISTS public.role_permissions (
    role_id UUID REFERENCES public.roles(id) ON DELETE CASCADE,
    permission_id UUID REFERENCES public.permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

-- User Profiles (linked directly to Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    display_name VARCHAR(200),
    role_id UUID REFERENCES public.roles(id),
    org_id UUID REFERENCES public.organizations(id),
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    last_login TIMESTAMPTZ
);

-- Platform Policies & Guardrails
CREATE TABLE IF NOT EXISTS public.platform_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key VARCHAR(100) UNIQUE NOT NULL,
    value JSONB NOT NULL,
    description VARCHAR(500),
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_by VARCHAR(200)
);

-- Administrative & Operational Audit Logs
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id VARCHAR(100) NOT NULL,
    actor_email VARCHAR(200) NOT NULL,
    action VARCHAR(100) NOT NULL,
    resource VARCHAR(100),
    resource_id VARCHAR(100),
    details JSONB,
    ip_address VARCHAR(45),
    timestamp TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ==============================================================================
-- 3. SUPPLY CHAIN DIGITAL TWIN TOPOLOGY
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.ports (
    id VARCHAR(40) PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    country VARCHAR(120),
    region VARCHAR(120),
    lat DOUBLE PRECISION,
    lng DOUBLE PRECISION,
    risk_score DOUBLE PRECISION DEFAULT 10.0
);

CREATE TABLE IF NOT EXISTS public.suppliers (
    id VARCHAR(40) PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    country VARCHAR(120),
    region VARCHAR(120),
    lat DOUBLE PRECISION,
    lng DOUBLE PRECISION,
    risk_score DOUBLE PRECISION DEFAULT 20.0,
    reliability_score DOUBLE PRECISION DEFAULT 90.0,
    primary_port_id VARCHAR(40) REFERENCES public.ports(id),
    status VARCHAR(40) DEFAULT 'ACTIVE'
);

CREATE TABLE IF NOT EXISTS public.materials (
    id VARCHAR(40) PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    category VARCHAR(40) DEFAULT 'Component',
    criticality VARCHAR(40) DEFAULT 'HIGH',
    safety_stock INT DEFAULT 1000
);

CREATE TABLE IF NOT EXISTS public.supplier_materials (
    supplier_id VARCHAR(40) REFERENCES public.suppliers(id) ON DELETE CASCADE,
    material_id VARCHAR(40) REFERENCES public.materials(id) ON DELETE CASCADE,
    capacity_per_day INT DEFAULT 500,
    lead_time_days INT DEFAULT 5,
    unit_cost DOUBLE PRECISION DEFAULT 100.0,
    is_primary BOOLEAN DEFAULT FALSE,
    PRIMARY KEY (supplier_id, material_id)
);

CREATE TABLE IF NOT EXISTS public.plants (
    id VARCHAR(40) PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    city VARCHAR(120),
    country VARCHAR(120),
    lat DOUBLE PRECISION,
    lng DOUBLE PRECISION,
    daily_capacity INT DEFAULT 2000,
    status VARCHAR(40) DEFAULT 'ACTIVE'
);

CREATE TABLE IF NOT EXISTS public.products (
    id VARCHAR(40) PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    category VARCHAR(40) DEFAULT 'Finished Good',
    unit_price DOUBLE PRECISION DEFAULT 500.0,
    plant_id VARCHAR(40) REFERENCES public.plants(id),
    daily_production_capacity INT DEFAULT 300,
    criticality VARCHAR(40) DEFAULT 'HIGH'
);

CREATE TABLE IF NOT EXISTS public.product_materials (
    product_id VARCHAR(40) REFERENCES public.products(id) ON DELETE CASCADE,
    material_id VARCHAR(40) REFERENCES public.materials(id) ON DELETE CASCADE,
    quantity_required INT DEFAULT 1,
    PRIMARY KEY (product_id, material_id)
);

CREATE TABLE IF NOT EXISTS public.orders (
    id VARCHAR(40) PRIMARY KEY,
    customer_id VARCHAR(40) NOT NULL,
    product_id VARCHAR(40) REFERENCES public.products(id),
    quantity INT NOT NULL,
    unit_price DOUBLE PRECISION NOT NULL,
    order_value DOUBLE PRECISION NOT NULL,
    order_date VARCHAR(32) NOT NULL,
    required_delivery_date VARCHAR(32) NOT NULL,
    priority VARCHAR(40) DEFAULT 'HIGH',
    status VARCHAR(40) DEFAULT 'PENDING'
);

CREATE TABLE IF NOT EXISTS public.inventory (
    id VARCHAR(80) PRIMARY KEY,
    plant_id VARCHAR(40) REFERENCES public.plants(id),
    material_id VARCHAR(40) REFERENCES public.materials(id),
    on_hand_quantity INT DEFAULT 5000,
    reserved_quantity INT DEFAULT 0,
    safety_stock INT DEFAULT 1000
);

CREATE TABLE IF NOT EXISTS public.transport_routes (
    id VARCHAR(40) PRIMARY KEY,
    origin VARCHAR(40) NOT NULL,
    destination VARCHAR(40) NOT NULL,
    mode VARCHAR(40) DEFAULT 'SEA',
    transit_time_days INT DEFAULT 7,
    capacity_per_day INT DEFAULT 1000,
    risk_score DOUBLE PRECISION DEFAULT 15.0,
    status VARCHAR(40) DEFAULT 'ACTIVE'
);

-- ==============================================================================
-- 4. DISRUPTIONS, SCENARIOS & RECOVERY PLANS
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.disruptions (
    simulation_id VARCHAR(40) PRIMARY KEY,
    disruption_type VARCHAR(40) NOT NULL,
    affected_entity_id VARCHAR(40) NOT NULL,
    severity DOUBLE PRECISION NOT NULL,
    duration_days INT NOT NULL,
    status VARCHAR(40) DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    resolved_at TIMESTAMPTZ,
    summary JSONB,
    payload JSONB
);

CREATE TABLE IF NOT EXISTS public.scenarios (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    disruption_id VARCHAR(255) NOT NULL,
    strategy VARCHAR(255) NOT NULL,
    supplier_id VARCHAR(255) NOT NULL,
    total_cost DOUBLE PRECISION NOT NULL,
    max_delay_days DOUBLE PRECISION NOT NULL,
    blended_risk DOUBLE PRECISION NOT NULL,
    total_sla_exposure DOUBLE PRECISION NOT NULL,
    final_score DOUBLE PRECISION NOT NULL,
    status VARCHAR(255) DEFAULT 'READY' NOT NULL,
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.recovery_plans (
    id VARCHAR(255) PRIMARY KEY,
    disruption_id VARCHAR(255) NOT NULL,
    scenario_id VARCHAR(255),
    strategy VARCHAR(255) NOT NULL,
    supplier_id VARCHAR(255) NOT NULL,
    total_cost DOUBLE PRECISION NOT NULL,
    max_delay_days DOUBLE PRECISION NOT NULL,
    blended_risk DOUBLE PRECISION NOT NULL,
    total_sla_exposure DOUBLE PRECISION NOT NULL,
    final_score DOUBLE PRECISION NOT NULL,
    orders_recovered_pct DOUBLE PRECISION,
    status VARCHAR(255) DEFAULT 'PENDING_AUDIT' NOT NULL,
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- SAP Integration & Real-time Action Log
CREATE TABLE IF NOT EXISTS public.sap_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id VARCHAR(100) NOT NULL,
    disruption_id VARCHAR(100),
    recovery_plan_id VARCHAR(255),
    supplier_id VARCHAR(100),
    material_id VARCHAR(100),
    po_number VARCHAR(100),
    total_amount DOUBLE PRECISION,
    status VARCHAR(50) DEFAULT 'SUBMITTED',
    payload JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Dr. Supply AI Co-Pilot Sessions
CREATE TABLE IF NOT EXISTS public.copilot_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(200) DEFAULT 'Supply Chain Strategy Discussion',
    messages JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ==============================================================================
-- 5. SUPABASE AUTH SYNC TRIGGER
-- ==============================================================================

-- Automatically create user_profiles record when a user signs in via Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    default_role_id UUID;
    default_org_id UUID;
BEGIN
    SELECT id INTO default_role_id FROM public.roles WHERE name = 'OPERATOR' LIMIT 1;
    SELECT id INTO default_org_id FROM public.organizations LIMIT 1;

    INSERT INTO public.user_profiles (id, email, display_name, role_id, org_id, is_active, created_at)
    VALUES (
        new.id,
        new.email,
        COALESCE(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
        default_role_id,
        default_org_id,
        TRUE,
        NOW()
    )
    ON CONFLICT (id) DO UPDATE
    SET 
        email = EXCLUDED.email,
        last_login = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- 6. REALTIME ENABLEMENT (WebSockets for Live Updates)
-- ==============================================================================

DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.disruptions;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.recovery_plans;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.sap_actions;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.audit_logs;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- ==============================================================================
-- 7. SEED DATA (Default Enterprise Data & Initial State)
-- ==============================================================================

-- Organizations
INSERT INTO public.organizations (name, slug, is_active)
VALUES ('Global Enterprise - LinqChain Corp', 'global-enterprise', TRUE)
ON CONFLICT (slug) DO NOTHING;

-- Roles
INSERT INTO public.roles (name, description, is_system) VALUES
('OWNER', 'Full administrative authority and system configuration', TRUE),
('ADMIN', 'Enterprise admin with user management and policy controls', TRUE),
('OPERATOR', 'Supply chain operator with simulation and recovery powers', TRUE),
('VIEWER', 'Read-only access to topologies and analytics', TRUE)
ON CONFLICT (name) DO NOTHING;

-- Default Policies
INSERT INTO public.platform_policies (key, value, description) VALUES
('auto_recovery_threshold', '{"max_cost": 500000, "max_delay_days": 7, "min_score": 0.85}'::jsonb, 'Automatic autonomous execution thresholds for low-risk disruptions'),
('sap_sync_interval', '{"minutes": 5, "batch_size": 100}'::jsonb, 'SAP S/4HANA background delta polling interval'),
('risk_alert_thresholds', '{"critical": 75, "high": 50, "medium": 25}'::jsonb, 'Supplier risk rating warning boundaries')
ON CONFLICT (key) DO NOTHING;

-- Sample Ports
INSERT INTO public.ports (id, name, country, region, lat, lng, risk_score) VALUES
('PORT-001', 'Port of Singapore', 'Singapore', 'Southeast Asia', 1.290270, 103.851959, 12.5),
('PORT-002', 'Port of Rotterdam', 'Netherlands', 'Europe', 51.924420, 4.477733, 15.0),
('PORT-003', 'Port of Shanghai', 'China', 'East Asia', 31.230416, 121.473701, 18.2),
('PORT-004', 'Port of Los Angeles', 'USA', 'North America', 33.743184, -118.267254, 22.0)
ON CONFLICT (id) DO NOTHING;

-- Sample Plants
INSERT INTO public.plants (id, name, city, country, lat, lng, daily_capacity, status) VALUES
('PLANT-001', 'Stuttgart Assembly Center', 'Stuttgart', 'Germany', 48.775846, 9.182932, 3500, 'ACTIVE'),
('PLANT-002', 'Austin Gigafactory', 'Austin', 'USA', 30.267153, -97.743061, 4500, 'ACTIVE'),
('PLANT-003', 'Yokohama Advanced Plant', 'Yokohama', 'Japan', 35.443708, 139.638026, 2800, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;

-- Sample Materials
INSERT INTO public.materials (id, name, category, criticality, safety_stock) VALUES
('MAT-001', 'Semiconductor Microcontroller MCU-32', 'Electronics', 'CRITICAL', 2500),
('MAT-002', 'High-Density Lithium Polymer Cell', 'Energy', 'CRITICAL', 5000),
('MAT-003', 'Aircraft-Grade Titanium Alloy Rods', 'Raw Metals', 'HIGH', 1200),
('MAT-012', 'Industrial Power Converter Module', 'Power Electronics', 'HIGH', 1800)
ON CONFLICT (id) DO NOTHING;

-- Sample Suppliers
INSERT INTO public.suppliers (id, name, country, region, lat, lng, risk_score, reliability_score, primary_port_id, status) VALUES
('SUP-001', 'Apex Silicon Foundry Ltd.', 'Taiwan', 'East Asia', 25.0330, 121.5654, 18.0, 96.5, 'PORT-003', 'ACTIVE'),
('SUP-002', 'Nordic Composite Solutions', 'Sweden', 'Nordics', 59.3293, 18.0686, 12.0, 98.0, 'PORT-002', 'ACTIVE'),
('SUP-003', 'Shenzhen Precision Sensors Co.', 'China', 'East Asia', 22.5431, 114.0579, 32.0, 89.0, 'PORT-003', 'ACTIVE'),
('SUP-004', 'Bavaria Heavy Forgings GmbH', 'Germany', 'Europe', 48.1351, 11.5820, 14.0, 97.5, 'PORT-002', 'ACTIVE')
ON CONFLICT (id) DO NOTHING;

-- Sample Disruptions
INSERT INTO public.disruptions (simulation_id, disruption_type, affected_entity_id, severity, duration_days, status, summary) VALUES
('SIM-DISRUPT-001', 'PORT_CONGESTION', 'PORT-003', 0.85, 14, 'ACTIVE', '{"title": "Typhoon Malakas Port Shutdown", "est_loss": 3200000, "description": "Major bottleneck at Port of Shanghai delaying 45% of outbound raw materials."}'::jsonb),
('SIM-DISRUPT-002', 'SUPPLIER_INSOLVENCY', 'SUP-003', 0.65, 21, 'ACTIVE', '{"title": "Shenzhen Precision Raw Material Shortage", "est_loss": 1850000, "description": "Secondary tier supply constraint halts component deliveries to Plant 1."}'::jsonb)
ON CONFLICT (simulation_id) DO NOTHING;
