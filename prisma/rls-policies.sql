-- ============================================================
-- FIELD SERVICE ERP
-- PHASE 3: TENANT ROW-LEVEL SECURITY
-- ============================================================
--
-- Tenant context:
-- app.current_tenant_id
--
-- Application requirements:
-- 1. Connect using a dedicated NOBYPASSRLS application role.
-- 2. The application role must not own protected tables.
-- 3. Establish tenant context inside a database transaction.
-- 4. Authenticate the user and verify tenant membership.
-- 5. Never trust a tenant ID supplied by the browser alone.
--
-- Authentication/global tables require separate access rules.
-- ============================================================


-- ============================================================
-- REUSABLE POLICY PATTERN
-- ============================================================
--
-- USING:
-- Controls which existing rows can be accessed.
--
-- WITH CHECK:
-- Controls which rows can be inserted or updated.
--
-- NULLIF ensures a missing or empty tenant setting evaluates
-- to NULL instead of producing an invalid UUID conversion.
--
-- ============================================================


-- 1. MEMBERSHIPS
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberships FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS tenant_isolation_memberships
ON memberships;

CREATE POLICY tenant_isolation_memberships
ON memberships
FOR ALL
USING (
    tenant_id = NULLIF(
        current_setting('app.current_tenant_id', true),
        ''
    )::uuid
)
WITH CHECK (
    tenant_id = NULLIF(
        current_setting('app.current_tenant_id', true),
        ''
    )::uuid
);


-- 2. INVITATIONS
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS tenant_isolation_invitations
ON invitations;

CREATE POLICY tenant_isolation_invitations
ON invitations
FOR ALL
USING (
    tenant_id = NULLIF(
        current_setting('app.current_tenant_id', true),
        ''
    )::uuid
)
WITH CHECK (
    tenant_id = NULLIF(
        current_setting('app.current_tenant_id', true),
        ''
    )::uuid
);


-- 3. CUSTOMERS
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS tenant_isolation_customers
ON customers;

CREATE POLICY tenant_isolation_customers
ON customers
FOR ALL
USING (
    tenant_id = NULLIF(
        current_setting('app.current_tenant_id', true),
        ''
    )::uuid
)
WITH CHECK (
    tenant_id = NULLIF(
        current_setting('app.current_tenant_id', true),
        ''
    )::uuid
);


-- 4. JOBS
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS tenant_isolation_jobs
ON jobs;

CREATE POLICY tenant_isolation_jobs
ON jobs
FOR ALL
USING (
    tenant_id = NULLIF(
        current_setting('app.current_tenant_id', true),
        ''
    )::uuid
)
WITH CHECK (
    tenant_id = NULLIF(
        current_setting('app.current_tenant_id', true),
        ''
    )::uuid
);


-- 5. JOB PHOTOS
ALTER TABLE job_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_photos FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS tenant_isolation_job_photos
ON job_photos;

CREATE POLICY tenant_isolation_job_photos
ON job_photos
FOR ALL
USING (
    tenant_id = NULLIF(
        current_setting('app.current_tenant_id', true),
        ''
    )::uuid
)
WITH CHECK (
    tenant_id = NULLIF(
        current_setting('app.current_tenant_id', true),
        ''
    )::uuid
);


-- 6. INVOICES
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS tenant_isolation_invoices
ON invoices;

CREATE POLICY tenant_isolation_invoices
ON invoices
FOR ALL
USING (
    tenant_id = NULLIF(
        current_setting('app.current_tenant_id', true),
        ''
    )::uuid
)
WITH CHECK (
    tenant_id = NULLIF(
        current_setting('app.current_tenant_id', true),
        ''
    )::uuid
);


-- 7. INVOICE LINE ITEMS
ALTER TABLE invoice_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_line_items FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS tenant_isolation_invoice_line_items
ON invoice_line_items;

CREATE POLICY tenant_isolation_invoice_line_items
ON invoice_line_items
FOR ALL
USING (
    tenant_id = NULLIF(
        current_setting('app.current_tenant_id', true),
        ''
    )::uuid
)
WITH CHECK (
    tenant_id = NULLIF(
        current_setting('app.current_tenant_id', true),
        ''
    )::uuid
);


-- 8. PAYMENTS
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS tenant_isolation_payments
ON payments;

CREATE POLICY tenant_isolation_payments
ON payments
FOR ALL
USING (
    tenant_id = NULLIF(
        current_setting('app.current_tenant_id', true),
        ''
    )::uuid
)
WITH CHECK (
    tenant_id = NULLIF(
        current_setting('app.current_tenant_id', true),
        ''
    )::uuid
);


-- 9. OUTBOX EVENTS
ALTER TABLE outbox_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE outbox_events FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS tenant_isolation_outbox_events
ON outbox_events;

CREATE POLICY tenant_isolation_outbox_events
ON outbox_events
FOR ALL
USING (
    tenant_id = NULLIF(
        current_setting('app.current_tenant_id', true),
        ''
    )::uuid
)
WITH CHECK (
    tenant_id = NULLIF(
        current_setting('app.current_tenant_id', true),
        ''
    )::uuid
);


-- ============================================================
-- GLOBAL TABLES — SEPARATE ACCESS MODEL REQUIRED
-- ============================================================
--
-- tenants:
-- Global company records. Do not grant unrestricted access.
--
-- users:
-- Global authentication identities. Access must be restricted
-- according to the authentication design.
--
-- sessions, accounts, verifications:
-- Better Auth authentication records. These need a deliberate
-- authentication access model.
--
-- stripe_events:
-- Trusted webhook processing only.
--
-- These tables are intentionally not assigned the tenant
-- policies above.
--
-- ============================================================

-- END OF PHASE 3 TENANT RLS POLICIES