import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

async function main() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is missing.");
  }

  const adapter = new PrismaPg({
    connectionString,
  });

  const prisma = new PrismaClient({
    adapter,
  });

  try {
    console.log("\n======================================");
    console.log("FIELD SERVICE ERP");
    console.log("APPLICATION DATABASE ROLE VERIFICATION");
    console.log("======================================\n");

    const role = await prisma.$queryRaw<
      {
        current_user: string;
        session_user: string;
        rolbypassrls: boolean;
        rolsuper: boolean;
        is_owner_member: boolean;
      }[]
    >`
      SELECT
        current_user,
        session_user,
        r.rolbypassrls,
        r.rolsuper,
        pg_has_role(
          current_user,
          'neondb_owner',
          'MEMBER'
        ) AS is_owner_member
      FROM pg_roles r
      WHERE r.rolname = current_user;
    `;

    console.log("1. APPLICATION DATABASE ROLE");
    console.table(role);

    const tables = await prisma.$queryRaw<
      {
        table_name: string;
        rls_enabled: boolean;
        rls_forced: boolean;
      }[]
    >`
      SELECT
        c.relname AS table_name,
        c.relrowsecurity AS rls_enabled,
        c.relforcerowsecurity AS rls_forced
      FROM pg_class c
      JOIN pg_namespace n
        ON n.oid = c.relnamespace
      WHERE n.nspname = 'public'
        AND c.relkind = 'r'
        AND c.relname IN (
          'memberships',
          'invitations',
          'customers',
          'jobs',
          'job_photos',
          'invoices',
          'invoice_line_items',
          'payments',
          'outbox_events'
        )
      ORDER BY c.relname;
    `;

    console.log("\n2. ROW LEVEL SECURITY STATUS");
    console.table(tables);

    const validRole =
      role.length === 1 &&
      role[0].current_user === "fieldservice_app" &&
      role[0].rolbypassrls === false &&
      role[0].rolsuper === false &&
      role[0].is_owner_member === false;

    const validRls =
      tables.length === 9 &&
      tables.every(
        (table) =>
          table.rls_enabled === true &&
          table.rls_forced === true,
      );

    console.log("\n3. VERIFICATION SUMMARY");

    console.log(
      "Application role:",
      validRole ? "PASS" : "FAIL",
    );

    console.log(
      "RLS configuration:",
      validRls ? "PASS" : "FAIL",
    );

    if (!validRole || !validRls) {
      throw new Error(
        "Database role or RLS verification failed.",
      );
    }

    console.log("\nALL CHECKS PASSED.");
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error("\nVERIFICATION FAILED:");
  console.error(error);
  process.exitCode = 1;
});