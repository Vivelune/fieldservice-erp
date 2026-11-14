import { prisma } from "@/lib/db/prisma";
import type { Prisma } from "@/generated/prisma/client";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Runs database operations inside a transaction
 * with a PostgreSQL transaction-local tenant context.
 *
 * IMPORTANT:
 * tenantId must come from server-side authentication
 * and verified tenant membership.
 */
export async function withTenant<T>(
  tenantId: string,
  callback: (tx: Prisma.TransactionClient) => Promise<T>,
): Promise<T> {
  if (!UUID_REGEX.test(tenantId)) {
    throw new Error("A valid tenant UUID is required.");
  }

  return prisma.$transaction(async (tx) => {
    await tx.$queryRaw`
      SELECT set_config(
        'app.current_tenant_id',
        ${tenantId},
        true
      )
    `;

    return callback(tx);
  });
}