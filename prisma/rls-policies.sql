-- ============================================================
-- FIELD SERVICE ERP
-- PHASE 2: TENANT ROW-LEVEL SECURITY
-- ============================================================
--
-- Tenant context:
-- app.current_tenant_id
--
-- The application must establish this context inside a
-- database transaction after authenticating the user and
-- verifying their membership in the selected tenant.
--
-- This policy is an additional database isolation layer.
-- A custom PostgreSQL setting is not an authenticated identity:
-- the application must protect tenant-context establishment
-- and must never trust a tenant ID supplied by the browser.
--
-- IMPORTANT:
-- Do not execute until the Prisma migration has been applied
-- and database roles and grants have been reviewed.
-- ============================================================


-- ============================================================
-- 1. MEMBERSHIPS
-- ============================================================

ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberships FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS tenant_isolation_memberships
ON memberships;

CREATE POLICY tenant_isolation_memberships
ON memberships
FOR ALL
USING (
    tenant_id =
    NULLIF(
        current_setting('app.current_tenant_id', true),
        ''
    )::uuid
)
WITH CHECK (
    tenant_id =
    NULLIF(
        current_setting('app.current_tenant_id', true),
        ''
    )::uuid
);


-- ============================================================
-- 2. INVITATIONS
-- ============================================================

ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS tenant_isolation_invitations
ON invitations;

CREATE POLICY tenant_isolation_invitations
ON invitations
FOR ALL
USING (
    tenant_id =
    NULLIF(
        current_setting('app.current_tenant_id', true),
        ''
    )::uuid
)
WITH CHECK (
    tenant_id =
    NULLIF(
        current_setting('app.current_tenant_id', true),
        ''
    )::uuid
);


-- ============================================================
-- 3. CUSTOMERS
-- ============================================================

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS tenant_isolation_customers
ON customers;

CREATE POLICY tenant_isolation_customers
ON customers
FOR ALL
USING (
    tenant_id =
    NULLIF(
        current_setting('app.current_tenant_id', true),
        ''
    )::uuid
)
WITH CHECK (
    tenant_id =
    NULLIF(
        current_setting('app.current_tenant_id', true),
        ''
    )::uuid
);


-- ============================================================
-- 4. JOBS
-- ============================================================

ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS tenant_isolation_jobs
ON jobs;

CREATE POLICY tenant_isolation_jobs
ON jobs
FOR ALL
USING (
    tenant_id =
    NULLIF(
        current_setting('app.current_tenant_id', true),
        ''
    )::uuid
)
WITH CHECK (
    tenant_id =
    NULLIF(
        current_setting('app.current_tenant_id', true),
        ''
    )::uuid
);


-- ============================================================
-- 5. JOB PHOTOS
-- ============================================================

ALTER TABLE job_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_photos FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS tenant_isolation_job_photos
ON job_photos;

CREATE POLICY tenant_isolation_job_photos
ON job_photos
FOR ALL
USING (
    tenant_id =
    NULLIF(
        current_setting('app.current_tenant_id', true),
        ''
    )::uuid
)
WITH CHECK (
    tenant_id =
    NULLIF(
        current_setting('app.current_tenant_id', true),
        ''
    )::uuid
);


-- ============================================================
-- 6. INVOICES
-- ============================================================

ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS tenant_isolation_invoices
ON invoices;

CREATE POLICY tenant_isolation_invoices
ON invoices
FOR ALL
USING (
    tenant_id =
    NULLIF(
        current_setting('app.current_tenant_id', true),
        ''
    )::uuid
)
WITH CHECK (
    tenant_id =
    NULLIF(
        current_setting('app.current_tenant_id', true),
        ''
    )::uuid
);


-- ============================================================
-- 7. INVOICE LINE ITEMS
-- ============================================================

ALTER TABLE invoice_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_line_items FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS tenant_isolation_invoice_line_items
ON invoice_line_items;

CREATE POLICY tenant_isolation_invoice_line_items
ON invoice_line_items
FOR ALL
USING (
    tenant_id =
    NULLIF(
        current_setting('app.current_tenant_id', true),
        ''
    )::uuid
)
WITH CHECK (
    tenant_id =
    NULLIF(
        current_setting('app.current_tenant_id', true),
        ''
    )::uuid
);


-- ============================================================
-- 8. PAYMENTS
-- ============================================================

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS tenant_isolation_payments
ON payments;

CREATE POLICY tenant_isolation_payments
ON payments
FOR ALL
USING (
    tenant_id =
    NULLIF(
        current_setting('app.current_tenant_id', true),
        ''
    )::uuid
)
WITH CHECK (
    tenant_id =
    NULLIF(
        current_setting('app.current_tenant_id', true),
        ''
    )::uuid
);


-- ============================================================
-- 9. OUTBOX EVENTS
-- ============================================================

ALTER TABLE outbox_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE outbox_events FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS tenant_isolation_outbox_events
ON outbox_events;

CREATE POLICY tenant_isolation_outbox_events
ON outbox_events
FOR ALL
USING (
    tenant_id =
    NULLIF(
        current_setting('app.current_tenant_id', true),
        ''
    )::uuid
)
WITH CHECK (
    tenant_id =
    NULLIF(
        current_setting('app.current_tenant_id', true),
        ''
    )::uuid
);


-- ============================================================
-- END OF TENANT RLS POLICIES
-- ============================================================