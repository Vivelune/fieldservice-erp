## Database Roles and Permissions

### 1. Migration Owner

The migration owner is responsible for:

- Creating database tables.
- Applying Prisma migrations.
- Creating and modifying indexes.
- Applying RLS policies.
- Managing database schema changes.

This role must never be used by normal application requests.

### 2. Application Runtime Role

The application runtime role is used by the Next.js application.

Requirements:

- Must have LOGIN.
- Must have NOBYPASSRLS.
- Must not be a superuser.
- Must not own tenant-protected tables.
- Must not have permission to disable RLS.
- Must have only the database permissions required by application operations.

All tenant-owned database operations must execute inside transactions with a verified tenant context.

### 3. Stripe Webhook Processing

Stripe webhook processing must use a separately controlled database access path.

Requirements:

- Verify Stripe webhook signatures.
- Store Stripe event IDs with a unique constraint.
- Reject duplicate event processing.
- Restrict access to the global Stripe event inbox.
- Resolve the relevant tenant before performing tenant-scoped operations.
- Never trust a tenant ID supplied directly by an unverified request.

### 4. Background Workers

Background workers process queued tasks such as:

- Invoice PDF generation.
- Email notifications.
- AI document extraction.
- Outbox event delivery.

Workers must establish tenant context before accessing tenant-owned records.

### 5. Connection Pooling

Neon pooled connections are used for application runtime operations.

Tenant context must be transaction-local:

`set_config('app.current_tenant_id', tenant_id, true)`

The third argument must remain `true` so the setting is limited to the current transaction.

Session-level tenant settings must not be used with pooled connections.

### 6. Environment Separation

Development and production database credentials must remain separate.

- Local development uses Neon dev credentials.
- Production deployment uses production credentials.
- Migration credentials are kept separate from runtime credentials.
- Database passwords must never be committed to GitHub.

### 7. Security Verification

Before production deployment, verify:

1. Application role has NOBYPASSRLS.
2. Application role is not a superuser.
3. Application role does not own protected tables.
4. RLS is enabled on every tenant-owned table.
5. FORCE ROW LEVEL SECURITY is enabled where required.
6. Tenant A cannot read Tenant B records.
7. Tenant A cannot insert records for Tenant B.
8. Tenant A cannot update Tenant B records.
9. Requests without tenant context cannot access protected records.
10. Stripe webhook processing cannot bypass tenant authorization.

**Implementation status:** Architecture documented. Database role creation, grants and enforcement tests remain pending.

## Tenant Isolation Integration Tests

The integration tests are located at `tests/tenancy/rls.test.ts`.

They verify:

1. The runtime database role has `NOBYPASSRLS` and does not own tenant-protected tables.
2. A tenant can read its own demo customers, jobs, and invoices.
3. A tenant cannot read another tenant's records by guessing their IDs.
4. A tenant cannot insert records using another tenant's ID.
5. Queries without a tenant context do not expose tenant-owned customer records.

### Requirements before running

- Apply the initial Prisma migration to the development database.
- Apply the reviewed RLS policies.
- Configure the restricted application database role.
- Run the demo seed.
- Confirm the three demo tenants and their records exist.
- Set `RUN_RLS_INTEGRATION=true` for the integration-test process.

### Important

A passing test is evidence for the specific database role, policies, tables, and operations tested. It is not proof that every application route or every tenant-owned table is secure. Additional authorization and isolation tests are required as the application develops.

## Phase 3 Application Security Configuration

### Application database role

The normal application connects as `fieldservice_app`.

The role must satisfy:

- rolcanlogin = true
- rolsuper = false
- rolbypassrls = false
- is_owner_member = false

The migration owner must not be used by normal application
requests.

### RLS enforcement

All nine tenant-owned tables must have:

- relrowsecurity = true
- relforcerowsecurity = true
- Exactly one intended tenant isolation policy.

The policy must enforce both row visibility and row creation
using the tenant context.

### Tenant context

The application uses:

app.current_tenant_id

It is established using transaction-local set_config.

Tenant queries must run inside the same transaction
in which the context is established.

### Authentication and membership

Global identity records are accessed before selecting
a tenant.

Membership authorization is performed after setting
the requested tenant context.

A user without a valid membership must not access
tenant-owned records.

### Testing

The RLS integration suite runs against the Neon dev database.

It verifies cross-tenant reads, cross-tenant inserts,
unscoped queries, and transaction-local context behavior.