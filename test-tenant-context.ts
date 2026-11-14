import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./src/generated/prisma/client";

const tenantId = "11111111-1111-4111-8111-111111111111";

async function main() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is missing.");
  }

  const adapter = new PrismaPg({ connectionString });
  const prisma = new PrismaClient({ adapter });

  try {
    console.log("Testing Neon database connection...");

    const connection = await prisma.$queryRaw<
      Array<{ database_name: string }>
    >`
      SELECT current_database() AS database_name
    `;

    console.log("Connected database:", connection[0].database_name);

    console.log("\nTesting transaction-local tenant context...");

    const insideTransaction = await prisma.$transaction(
      async (tx) => {
        await tx.$queryRaw`
          SELECT set_config(
            'app.current_tenant_id',
            ${tenantId},
            true
          )
        `;

        return tx.$queryRaw<
          Array<{ tenant_id: string | null }>
        >`
          SELECT current_setting(
            'app.current_tenant_id',
            true
          ) AS tenant_id
        `;
      },
      {
        maxWait: 15000,
        timeout: 30000,
      },
    );

    console.log("Inside transaction:", insideTransaction);

    const outsideTransaction = await prisma.$queryRaw<
      Array<{ tenant_id: string | null }>
    >`
      SELECT current_setting(
        'app.current_tenant_id',
        true
      ) AS tenant_id
    `;

    console.log("Outside transaction:", outsideTransaction);

    console.log("\nTenant context test completed.");
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error("Test failed:", error);
  process.exitCode = 1;
});