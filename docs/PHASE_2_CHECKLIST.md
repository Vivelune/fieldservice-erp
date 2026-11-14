
# Phase 2 — Domain Model and Database Foundation

**Project:** Field Service ERP  
**Phase:** 2  
**Status:** Prepared — database verification pending

## 1. Domain model

- [x] Identify core business entities.
- [x] Document tenant, user, membership, customer, job, invoice, and payment relationships.
- [x] Document job and invoice state machines.
- [x] Document integer-cent money rules.
- [x] Prepare the domain ER diagram.

## 2. Prisma and Neon

- [x] Configure Prisma 7.
- [x] Configure Neon development database connection.
- [x] Validate Prisma schema.
- [x] Generate Prisma Client.
- [x] Create initial migration in create-only mode.
- [ ] Review migration SQL.
- [ ] Apply migration to development database.
- [ ] Confirm migration status.

## 3. Tenant security

- [x] Document tenant isolation architecture.
- [x] Prepare PostgreSQL RLS policies.
- [x] Prepare transaction-local tenant context helper.
- [ ] Configure restricted NOBYPASSRLS application role.
- [ ] Apply RLS policies.
- [ ] Verify RLS on every tenant-owned table.
- [ ] Verify missing-tenant-context behavior.

## 4. Demo data

- [x] Prepare three-tenant seed data.
- [x] Prepare seed configuration.
- [ ] Verify seed script against final Prisma schema.
- [ ] Run seed against development database.
- [ ] Confirm three tenants, six customers, six jobs, and three invoices.

## 5. Automated security tests

- [x] Prepare RLS integration test.
- [ ] Verify runtime database role and table ownership.
- [ ] Verify own-tenant reads.
- [ ] Verify cross-tenant reads are blocked.
- [ ] Verify cross-tenant writes are blocked.
- [ ] Verify no tenant context exposes no tenant records.

## 6. Final verification

- [ ] Prisma validation passes.
- [ ] Prisma Client generation passes.
- [ ] TypeScript checks pass.
- [ ] ESLint passes.
- [ ] Production build passes.
- [ ] Integration tests pass.
- [ ] Migration and security documentation are accurate.
- [ ] Changes committed on the Phase 2 feature branch.
- [ ] Pull request submitted for review.

## Completion rule

Phase 2 is not complete until the development database migration, tenant isolation, seed data, and required verification tests have actually succeeded.
