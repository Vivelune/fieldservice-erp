# Phase 3 Checklist — Multi-tenancy with RLS

## Database roles

- [x] Create migration/owner role.
- [x] Create restricted application role.
- [x] Verify NOBYPASSRLS.
- [x] Verify application role is not superuser.
- [x] Verify application role is not owner/member of owner role.
- [x] Configure application database permissions.

## PostgreSQL RLS

- [x] Enable RLS on nine tenant-owned tables.
- [x] Force RLS on nine tenant-owned tables.
- [x] Create tenant policies.
- [x] Verify RLS status through Prisma.

## Application integration

- [x] Configure DATABASE_URL for fieldservice_app.
- [x] Keep DIRECT_URL for migrations.
- [x] Implement withTenant.
- [x] Implement authenticated tenant wrapper.
- [x] Verify application database role.

## Isolation testing

- [ ] Tenant A can access its own customer.
- [ ] Tenant A cannot access Tenant B customer.
- [ ] Tenant A cannot insert a Tenant B record.
- [ ] Queries without tenant context return no tenant records.
- [ ] Tenant context does not leak after transaction.
- [ ] Tenant B can access its own customer.
- [ ] All Vitest integration tests pass.

## Continuous integration

- [ ] Add GitHub Actions CI workflow.
- [ ] Configure development database secret.
- [ ] Verify lint passes.
- [ ] Verify TypeScript typecheck passes.
- [ ] Verify Prisma validation passes.
- [ ] Verify integration tests pass in CI.

## Documentation

- [x] Document initial database role separation.
- [ ] Document final RLS behavior.
- [ ] Document authentication table strategy.
- [ ] Document RLS versus application filtering.
- [ ] Complete Phase 3 report.

## Delivery

- [ ] Complete all verification.
- [ ] Capture actual screenshots.
- [ ] Commit Phase 3 implementation.
- [ ] Push feature branch.
- [ ] Open pull request.
- [ ] Submit report to tutor.