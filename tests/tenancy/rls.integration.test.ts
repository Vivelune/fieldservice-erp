import { randomUUID } from "node:crypto";

import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
} from "vitest";

import { prisma } from "@/lib/db/prisma";

import {
  withTenant,
} from "@/lib/tenancy/with-tenant";

// --------------------------------------------------
// SEEDED TENANT DATA
// These IDs come from prisma/seed.ts.
// --------------------------------------------------

const TENANT_A_ID =
  "a1000000-0000-4000-8000-000000000001";

const TENANT_A_OWNER_ID =
  "a2000000-0000-4000-8000-000000000001";

const TENANT_A_CUSTOMER_ID =
  "a3000000-0000-4000-8000-000000000001";

const TENANT_B_ID =
  "b1000000-0000-4000-8000-000000000001";

const TENANT_B_OWNER_ID =
  "b2000000-0000-4000-8000-000000000001";

const TENANT_B_CUSTOMER_ID =
  "b3000000-0000-4000-8000-000000000001";

// --------------------------------------------------
// DATABASE SAFETY
// Never run these tests against production.
// --------------------------------------------------

beforeAll(async () => {
  if (process.env.RLS_TEST_DATABASE !== "dev") {
    throw new Error(
      "RLS integration tests are restricted to the Neon dev database. Set RLS_TEST_DATABASE=dev.",
    );
  }

  const role = await prisma.$queryRaw<
    {
      current_user: string;
      rolbypassrls: boolean;
      rolsuper: boolean;
    }[]
  >`
    SELECT
      current_user,
      rolbypassrls,
      rolsuper
    FROM pg_roles
    WHERE rolname = current_user;
  `;

  expect(role).toHaveLength(1);

  expect(role[0].current_user).toBe("fieldservice_app");

  expect(role[0].rolbypassrls).toBe(false);

  expect(role[0].rolsuper).toBe(false);

  // Confirm Tenant A's seeded membership and customer.
  const tenantACustomer = await withTenant(
    TENANT_A_OWNER_ID,
    TENANT_A_ID,
    async (tx) => {
      return tx.customer.findUnique({
        where: {
          id: TENANT_A_CUSTOMER_ID,
        },
      });
    },
  );

  expect(tenantACustomer).not.toBeNull();

  // Confirm Tenant B's seeded membership and customer.
  const tenantBCustomer = await withTenant(
    TENANT_B_OWNER_ID,
    TENANT_B_ID,
    async (tx) => {
      return tx.customer.findUnique({
        where: {
          id: TENANT_B_CUSTOMER_ID,
        },
      });
    },
  );

  expect(tenantBCustomer).not.toBeNull();
});

// --------------------------------------------------
// CLEANUP
// --------------------------------------------------

afterAll(async () => {
  await prisma.$disconnect();
});

// --------------------------------------------------
// TENANT ISOLATION TESTS
// --------------------------------------------------

describe("PostgreSQL Row-Level Security", () => {
  it("allows Tenant A to access its own customer", async () => {
    const customer = await withTenant(
      TENANT_A_OWNER_ID,
      TENANT_A_ID,
      async (tx) => {
        return tx.customer.findUnique({
          where: {
            id: TENANT_A_CUSTOMER_ID,
          },
        });
      },
    );

    expect(customer).not.toBeNull();

    expect(customer?.tenantId).toBe(TENANT_A_ID);

    expect(customer?.name).toBe(
      "Northstar Property Group",
    );
  });

  it("prevents Tenant A from reading Tenant B's customer by exact ID", async () => {
    const customers = await withTenant(
      TENANT_A_OWNER_ID,
      TENANT_A_ID,
      async (tx) => {
        return tx.customer.findMany({
          where: {
            id: TENANT_B_CUSTOMER_ID,
          },
        });
      },
    );

    expect(customers).toHaveLength(0);
  });

  it("allows Tenant B to access its own customer", async () => {
    const customer = await withTenant(
      TENANT_B_OWNER_ID,
      TENANT_B_ID,
      async (tx) => {
        return tx.customer.findUnique({
          where: {
            id: TENANT_B_CUSTOMER_ID,
          },
        });
      },
    );

    expect(customer).not.toBeNull();

    expect(customer?.tenantId).toBe(TENANT_B_ID);

    expect(customer?.name).toBe(
      "Westside Business Center",
    );
  });

  it("rejects an insert using another tenant's ID", async () => {
    await expect(
      withTenant(
        TENANT_A_OWNER_ID,
        TENANT_A_ID,
        async (tx) => {
          return tx.customer.create({
            data: {
              id: randomUUID(),

              tenantId: TENANT_B_ID,

              name: "Unauthorized Cross-Tenant Customer",

              street: "999 Security Test Road",

              city: "Test City",

              country: "United States",
            },
          });
        },
      ),
    ).rejects.toThrow();
  });

  it("returns no tenant records when no tenant context is set", async () => {
    const customers = await prisma.customer.findMany();

    expect(customers).toHaveLength(0);
  });

  it("does not retain tenant context after a transaction finishes", async () => {
    const customer = await withTenant(
      TENANT_A_OWNER_ID,
      TENANT_A_ID,
      async (tx) => {
        return tx.customer.findUnique({
          where: {
            id: TENANT_A_CUSTOMER_ID,
          },
        });
      },
    );

    expect(customer).not.toBeNull();

    // This query runs outside the completed tenant transaction.
    const customersAfterTransaction =
      await prisma.customer.findMany();

    expect(customersAfterTransaction).toHaveLength(0);
  });
});