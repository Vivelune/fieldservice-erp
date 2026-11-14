import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is missing. Check your local .env file.");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const DEMO_DATE = new Date("2026-11-01T09:00:00.000Z");
const COMPLETED_DATE = new Date("2026-11-02T15:00:00.000Z");
const DUE_DATE = new Date("2026-11-30T23:59:59.000Z");

const demoTenants = [
  {
    id: "a1000000-0000-4000-8000-000000000001",
    name: "Demo Field Services A",
    slug: "demo-field-services-a",
    owner: {
      id: "a2000000-0000-4000-8000-000000000001",
      name: "Demo Owner A",
      email: "owner-a@fieldservice.local",
    },
    technician: {
      id: "a2000000-0000-4000-8000-000000000002",
      name: "Demo Technician A",
      email: "technician-a@fieldservice.local",
    },
    customers: [
      {
        id: "a3000000-0000-4000-8000-000000000001",
        name: "Northstar Property Group",
        email: "northstar@example.test",
        phone: "+12025550101",
        street: "100 Market Street",
        city: "Austin",
        state: "Texas",
        zipCode: "78701",
        country: "United States",
      },
      {
        id: "a3000000-0000-4000-8000-000000000002",
        name: "Greenfield Apartments",
        email: "greenfield@example.test",
        phone: "+12025550102",
        street: "200 Lake Avenue",
        city: "Austin",
        state: "Texas",
        zipCode: "78702",
        country: "United States",
      },
    ],
  },
  {
    id: "b1000000-0000-4000-8000-000000000001",
    name: "Demo Field Services B",
    slug: "demo-field-services-b",
    owner: {
      id: "b2000000-0000-4000-8000-000000000001",
      name: "Demo Owner B",
      email: "owner-b@fieldservice.local",
    },
    technician: {
      id: "b2000000-0000-4000-8000-000000000002",
      name: "Demo Technician B",
      email: "technician-b@fieldservice.local",
    },
    customers: [
      {
        id: "b3000000-0000-4000-8000-000000000001",
        name: "Westside Business Center",
        email: "westside@example.test",
        phone: "+12025550201",
        street: "300 Main Street",
        city: "Denver",
        state: "Colorado",
        zipCode: "80202",
        country: "United States",
      },
      {
        id: "b3000000-0000-4000-8000-000000000002",
        name: "Cedar Grove Homes",
        email: "cedar@example.test",
        phone: "+12025550202",
        street: "400 Pine Road",
        city: "Denver",
        state: "Colorado",
        zipCode: "80203",
        country: "United States",
      },
    ],
  },
  {
    id: "c1000000-0000-4000-8000-000000000001",
    name: "Demo Field Services C",
    slug: "demo-field-services-c",
    owner: {
      id: "c2000000-0000-4000-8000-000000000001",
      name: "Demo Owner C",
      email: "owner-c@fieldservice.local",
    },
    technician: {
      id: "c2000000-0000-4000-8000-000000000002",
      name: "Demo Technician C",
      email: "technician-c@fieldservice.local",
    },
    customers: [
      {
        id: "c3000000-0000-4000-8000-000000000001",
        name: "Riverside Commercial Ltd",
        email: "riverside@example.test",
        phone: "+12025550301",
        street: "500 River Road",
        city: "Seattle",
        state: "Washington",
        zipCode: "98101",
        country: "United States",
      },
      {
        id: "c3000000-0000-4000-8000-000000000002",
        name: "Summit View Residences",
        email: "summit@example.test",
        phone: "+12025550302",
        street: "600 Hill Street",
        city: "Seattle",
        state: "Washington",
        zipCode: "98102",
        country: "United States",
      },
    ],
  },
] as const;

async function seedTenant(data: (typeof demoTenants)[number]) {
  console.log(`Seeding ${data.name}...`);

  await prisma.$transaction(
    async (tx) => {
      // Set transaction-local tenant context for RLS enforcement
      await tx.$queryRaw`
        SELECT set_config(
          'app.current_tenant_id',
          ${data.id},
          true
        )
      `;

      await tx.tenant.upsert({
        where: { id: data.id },
        update: {
          name: data.name,
          slug: data.slug,
        },
        create: {
          id: data.id,
          name: data.name,
          slug: data.slug,
        },
      });

      for (const user of [data.owner, data.technician]) {
        await tx.user.upsert({
          where: { id: user.id },
          update: {
            name: user.name,
            email: user.email,
          },
          create: {
            id: user.id,
            name: user.name,
            email: user.email,
          },
        });
      }

      const ownerMembershipId = data.id.replace("1000", "4000");
      const technicianMembershipId = data.id.replace("1000", "5000");

      await tx.membership.upsert({
        where: { id: ownerMembershipId },
        update: {
          tenantId: data.id,
          userId: data.owner.id,
          role: "OWNER",
        },
        create: {
          id: ownerMembershipId,
          tenantId: data.id,
          userId: data.owner.id,
          role: "OWNER",
        },
      });

      await tx.membership.upsert({
        where: { id: technicianMembershipId },
        update: {
          tenantId: data.id,
          userId: data.technician.id,
          role: "TECHNICIAN",
        },
        create: {
          id: technicianMembershipId,
          tenantId: data.id,
          userId: data.technician.id,
          role: "TECHNICIAN",
        },
      });

      for (const customer of data.customers) {
        await tx.customer.upsert({
          where: { id: customer.id },
          update: {
            tenantId: data.id,
            name: customer.name,
            email: customer.email,
            phone: customer.phone,
            street: customer.street,
            city: customer.city,
            state: customer.state,
            zipCode: customer.zipCode,
            country: customer.country,
          },
          create: {
            tenantId: data.id,
            ...customer,
          },
        });
      }

      const completedJobId = data.id.replace("1000", "6000");
      const scheduledJobId = data.id.replace("1000", "7000");
      const invoiceId = data.id.replace("1000", "8000");

      const firstCustomer = data.customers[0];
      const secondCustomer = data.customers[1];

      await tx.job.upsert({
        where: { id: completedJobId },
        update: {
          tenantId: data.id,
          customerId: firstCustomer.id,
          assignedToId: technicianMembershipId,
          title: "Completed maintenance inspection",
          description:
            "Inspect equipment, identify faults, and complete routine maintenance.",
          completionNotes:
            "Inspection completed. Equipment tested and operating normally.",
          status: "COMPLETED",
          priority: "NORMAL",
          scheduledAt: DEMO_DATE,
          startedAt: DEMO_DATE,
          completedAt: COMPLETED_DATE,
        },
        create: {
          id: completedJobId,
          tenantId: data.id,
          customerId: firstCustomer.id,
          assignedToId: technicianMembershipId,
          title: "Completed maintenance inspection",
          description:
            "Inspect equipment, identify faults, and complete routine maintenance.",
          completionNotes:
            "Inspection completed. Equipment tested and operating normally.",
          status: "COMPLETED",
          priority: "NORMAL",
          scheduledAt: DEMO_DATE,
          startedAt: DEMO_DATE,
          completedAt: COMPLETED_DATE,
        },
      });

      await tx.job.upsert({
        where: { id: scheduledJobId },
        update: {
          tenantId: data.id,
          customerId: secondCustomer.id,
          assignedToId: technicianMembershipId,
          title: "Scheduled equipment servicing",
          description: "Routine servicing and performance checks.",
          completionNotes: null,
          status: "SCHEDULED",
          priority: "HIGH",
          scheduledAt: DUE_DATE,
          startedAt: null,
          completedAt: null,
          cancelledAt: null,
        },
        create: {
          id: scheduledJobId,
          tenantId: data.id,
          customerId: secondCustomer.id,
          assignedToId: technicianMembershipId,
          title: "Scheduled equipment servicing",
          description: "Routine servicing and performance checks.",
          status: "SCHEDULED",
          priority: "HIGH",
          scheduledAt: DUE_DATE,
        },
      });

      await tx.invoice.upsert({
        where: { id: invoiceId },
        update: {
          tenantId: data.id,
          customerId: firstCustomer.id,
          jobId: completedJobId,
          invoiceNumber: `DEMO-${data.slug.toUpperCase()}-001`,
          status: "SENT",
          currency: "USD",
          subtotalCents: BigInt(12500),
          taxRateBps: 825,
          taxCents: BigInt(1031),
          totalCents: BigInt(13531),
          issuedAt: COMPLETED_DATE,
          dueAt: DUE_DATE,
          paidAt: null,
          voidedAt: null,
        },
        create: {
          id: invoiceId,
          tenantId: data.id,
          customerId: firstCustomer.id,
          jobId: completedJobId,
          invoiceNumber: `DEMO-${data.slug.toUpperCase()}-001`,
          status: "SENT",
          currency: "USD",
          subtotalCents: BigInt(12500),
          taxRateBps: 825,
          taxCents: BigInt(1031),
          totalCents: BigInt(13531),
          issuedAt: COMPLETED_DATE,
          dueAt: DUE_DATE,
        },
      });

      // Recreate invoice lines consistently on every seed run.
      await tx.invoiceLineItem.deleteMany({
        where: {
          tenantId: data.id,
          invoiceId,
        },
      });

      await tx.invoiceLineItem.createMany({
        data: [
          {
            tenantId: data.id,
            invoiceId,
            type: "LABOR",
            description: "Two hours of maintenance labor",
            quantity: 1,
            laborMinutes: 120,
            hourlyRateCents: BigInt(5000),
          },
          {
            tenantId: data.id,
            invoiceId,
            type: "MATERIAL",
            description: "Replacement maintenance materials",
            quantity: 1,
            unitPriceCents: BigInt(2500),
          },
        ],
      });
    },
    {
      maxWait: 20000,
      timeout: 30000,
    }
  );

  console.log(`Finished ${data.name}.`);
}

async function main() {
  console.log("Starting Field Service ERP demo seed...");

  for (const tenant of demoTenants) {
    await seedTenant(tenant);
  }

  console.log("Demo seed completed.");
  console.log(
    "Created or updated 3 tenants, 6 users, 6 memberships, 6 customers, 6 jobs, and 3 invoices.",
  );
}

main()
  .catch((error) => {
    console.error("Demo seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });