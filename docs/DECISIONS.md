# Architecture Decisions

## 1. Money and Financial Calculations

### Decision

All monetary values in the Field Service ERP will be stored and calculated using integer cents. Floating-point numbers must never be used for financial calculations.

### Monetary Storage

- All monetary amounts will use `Int` or `BigInt` in the database, depending on the expected value range.
- For example, $125.50 will be stored as 12550 cents.
- Invoice totals, payments, labour charges, material costs, and tax amounts will be represented as integer cents.
- AI-generated financial values must also be validated and converted into integer cents before being accepted.
- JSON payloads must use integer monetary values, not floating-point amounts.

### Tax Calculation

Tax rates will be stored as basis points.

For example:
- 500 = 5%
- 825 = 8.25%
- 1000 = 10%

Tax amounts will be calculated using integer arithmetic.

**Rounding rule:** Tax will be calculated on the invoice subtotal and rounded half up once at the invoice level to the nearest cent.

### Labour Calculation

Labour time will be stored as integer minutes rather than fractional hours.

For example:
- 30 minutes = 30
- 60 minutes = 60
- 90 minutes = 90

Labour charges will be calculated using:

`Labour cost = (Total minutes × Hourly rate in cents) / 60`

The calculation will use exact integer or rational arithmetic, with half-up rounding to the nearest cent when producing the stored labour charge.

### Example Invoice

Assume:
- Labour time: 120 minutes
- Hourly rate: $50.00
- Materials: $25.00
- Tax rate: 8.25%

Calculation:

- Labour: 10000 cents ($100.00)
- Materials: 2500 cents ($25.00)
- Subtotal: 12500 cents ($125.00)
- Tax: 1031 cents ($10.31)
- Total: 13531 cents ($135.31)

### Reason for This Decision

Floating-point calculations can introduce precision errors when handling money.

Using integer cents provides predictable calculations, consistent invoice totals, and reliable payment processing.

## 2. Multi-Tenancy

Every tenant-owned database record must include a `tenant_id`.

Tenant isolation will be enforced through application authorization, database constraints, and PostgreSQL Row-Level Security (RLS).

## 3. Background Processing

BullMQ with Redis will handle asynchronous tasks such as invoice PDF generation and email notifications.

Business events will be written to an outbox table within the same database transaction as the operation that creates them.

## 4. Payment Processing

Stripe Checkout Sessions will handle payment collection.

Stripe webhook events must be processed idempotently using a unique Stripe event ID to prevent duplicate payment processing.

## Phase 3 — Multi-tenancy and PostgreSQL Row-Level Security

### 1. Database role separation

The application uses a dedicated PostgreSQL role named
`fieldservice_app`.

This role:

- Has LOGIN permission.
- Has NOBYPASSRLS.
- Is not a superuser.
- Does not own the application tables.
- Is not a member of the migration owner role.

The database owner/migration role is `neondb_owner`.

Prisma uses two separate environment variables:

- DATABASE_URL: application connection using fieldservice_app.
- DIRECT_URL: direct migration connection using neondb_owner.

The application must never use the migration owner connection
for normal business operations.

### 2. Row-Level Security

PostgreSQL Row-Level Security is enabled and forced on
the following tenant-owned tables:

- memberships
- invitations
- customers
- jobs
- job_photos
- invoices
- invoice_line_items
- payments
- outbox_events

Each table has a tenant isolation policy.

The policy checks the tenant context stored in:

app.current_tenant_id

The application sets this value inside a database transaction.

### 3. Transaction-local tenant context

The application uses set_config with its third argument
set to true.

This makes the tenant context transaction-local.

The purpose is to prevent tenant context from remaining
active when a pooled database connection is reused.

All tenant-scoped application queries must execute through
the withTenant helper or the authenticated tenant wrapper.

### 4. Authentication tables

The following tables are global identity/authentication tables:

- users
- accounts
- sessions
- verifications

They are not protected by tenant RLS because authentication
must identify a user before a tenant context is selected.

Memberships are different. They are tenant-scoped and
protected by RLS.

The application establishes the requested tenant context
before checking the user's membership in that tenant.

The tenants registry is also treated separately from
tenant-owned business records. Application permissions
on this table are restricted.

Stripe events are reserved for trusted webhook processing
and are not granted to the normal application role.

### 5. RLS versus application-layer filtering

Application-layer filtering restricts records through
conditions added by application queries, but an omitted
or incorrect filter can expose another tenant's data.

PostgreSQL Row-Level Security enforces access policies
at the database level, providing an additional isolation
boundary even when application queries omit tenant filters.

### 6. Security limitations

RLS is an additional database security boundary, not
a replacement for authentication and authorization.

The application must authenticate the user and verify
membership before selecting a tenant context.

The custom PostgreSQL setting app.current_tenant_id
is controlled by the application connection. A compromised
application role or arbitrary SQL execution could potentially
change that setting.

Therefore, parameterized queries, trusted server-side
tenant selection, and careful protection against SQL
injection remain necessary.

Superusers and roles with BYPASSRLS can bypass RLS.

### 7. Verification strategy

Phase 3 integration tests verify:

- Access to a tenant's own customer records.
- Rejection of cross-tenant customer reads.
- Rejection of cross-tenant inserts.
- No tenant records returned without tenant context.
- Transaction-local context isolation.

Tests run against the Neon development database.
Production data is not used for integration testing.