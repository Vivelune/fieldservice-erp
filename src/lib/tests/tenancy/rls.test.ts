
import { randomUUID } from "node:crypto";
// @ts-expect-error Vitest is supplied by the test environment but its types are not resolved here.
import { afterAll, describe, expect, it } from "vitest";

import { prisma } from "../../db/prisma";
import { withTenant } from "../../../server/tenancy/with-tenant";

const TENANT_A = "a1000000-0000-4000-8000-000000000001";
const TENANT_B = "b1000000-0000-4000-8000-000000000001";

const TENANT_A_CUSTOMER = "a3000000-0000-4000-8000-000000000001";
const TENANT_B_CUSTOMER = "b3000000-0000-4000-8000-000000000001";

const TENANT_B_JOB = "b6000000-0000-4000-8000-000000000001";

const TENANT_A_INVOICE = "a8000000-0000-4000-8000-000000000001";
const TENANT_B_INVOICE = "b8000000-0000-4000-8000-000000000001";

const integrationEnabled = process.env.RUN_RLS_INTEGRATION === "true";

describe.skipIf(!integrationEnabled)(
  "PostgreSQL row-level security: tenant isolation",
  () => {
    it("uses a database role that does not bypass RLS or own tenant tables", async () => {
      const result = await withTenant(TENANT_A, async (tx) => {
        return tx.$queryRaw<
          Array<{
            current_role: string;
            bypass_rls: boolean;
            customers_owner: string;
          }>
        >`
          SELECT
            current_user AS current_role,
            role.rolbypassrls AS bypass_rls,
            pg_get_userbyid(table_info.relowner) AS customers_owner
          FROM pg_roles AS role
          CROSS JOIN pg_class AS table_info
          WHERE role.rolname = current_user
            AND table_info.relname = 'customers'
            AND table_info.relnamespace = 'public'::regnamespace
        `;
      });

      expect(result).toHaveLength(1);
      expect(result[0].bypass_rls).toBe(false);
      expect(result[0].current_role).not.toBe(result[0].customers_owner);
    });

    it("allows Tenant A to read its own customers, jobs, and invoices", async () => {
      const result = await withTenant(TENANT_A, async (tx) => {
        const [customers, jobs, invoices] = await Promise.all([
          tx.customer.count(),
          tx.job.count(),
          tx.invoice.count(),
        ]);
        const ownInvoice = await tx.invoice.findUnique({
          where: { id: TENANT_A_INVOICE },
        });

        return { customers, jobs, invoices, ownInvoice };
      });

      expect(result).toEqual({
        customers: 2,
        jobs: 2,
        invoices: 1,
        ownInvoice: expect.objectContaining({ id: TENANT_A_INVOICE }),
      });
    });

    it("prevents Tenant A from reading Tenant B records by ID", async () => {
      const result = await withTenant(TENANT_A, async (tx) => {
        const [customer, job, invoice] = await Promise.all([
          tx.customer.findUnique({
            where: { id: TENANT_B_CUSTOMER },
          }),
          tx.job.findUnique({
            where: { id: TENANT_B_JOB },
          }),
          tx.invoice.findUnique({
            where: { id: TENANT_B_INVOICE },
          }),
        ]);

        return { customer, job, invoice };
      });

      expect(result.customer).toBeNull();
      expect(result.job).toBeNull();
      expect(result.invoice).toBeNull();
    });

    it("prevents Tenant A from inserting a customer into Tenant B", async () => {
      await expect(
        withTenant(TENANT_A, async (tx) => {
          return tx.customer.create({
            data: {
              id: randomUUID(),
              tenantId: TENANT_B,
              name: "Unauthorized cross-tenant customer",
              street: "1 Test Street",
              city: "Test City",
              country: "United States",
            },
          });
        }),
      ).rejects.toThrow();
    });

    it("does not expose tenant records when no tenant context is set", async () => {
      const result = await prisma.$transaction(async (tx) => {
        return tx.customer.findMany({
          where: {
            id: TENANT_A_CUSTOMER,
          },
        });
      });

      expect(result).toHaveLength(0);
    });
  },
);

afterAll(async () => {
  await prisma.$disconnect();
});
