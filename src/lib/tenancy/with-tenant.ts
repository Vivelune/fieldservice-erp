import "server-only";

import { prisma } from "@/lib/db/prisma";
import type { Prisma } from "@/generated/prisma/client";

/**
 * Transaction client used by tenant-scoped operations.
 */
export type TenantTransaction = Prisma.TransactionClient;

/**
 * Raised when a user or tenant cannot be accessed.
 */
export class TenantAccessDeniedError extends Error {
  constructor(message = "You do not have access to this tenant.") {
    super(message);
    this.name = "TenantAccessDeniedError";
  }
}

/**
 * UUID validation.
 */
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function validateUuid(value: string, field: string): void {
  if (!UUID_REGEX.test(value)) {
    throw new TenantAccessDeniedError(`Invalid ${field}.`);
  }
}

/**
 * Executes database operations inside an authenticated
 * tenant-specific transaction.
 *
 * Security sequence:
 *
 * 1. Validate the user and tenant UUIDs.
 * 2. Start a database transaction.
 * 3. Set transaction-local tenant context.
 * 4. Verify user membership.
 * 5. Execute the callback using the same transaction.
 *
 * IMPORTANT:
 * All tenant-owned queries inside the callback must use tx.
 * Never use the global prisma client inside the callback.
 */
export async function withTenant<T>(
  userId: string,
  tenantId: string,
  callback: (tx: TenantTransaction) => Promise<T>,
): Promise<T> {
  validateUuid(userId, "user ID");
  validateUuid(tenantId, "tenant ID");

  return prisma.$transaction(async (tx) => {
    // Establish tenant context for this transaction only.
    await tx.$queryRaw`
      SELECT set_config(
        'app.current_tenant_id',
        ${tenantId},
        true
      )
    `;

    // Verify the authenticated user's tenant membership.
    const membership = await tx.membership.findFirst({
      where: {
        tenantId,
        userId,
      },
      select: {
        id: true,
        role: true,
      },
    });

    if (!membership) {
      throw new TenantAccessDeniedError();
    }

    // All subsequent operations remain in this transaction.
    return callback(tx);
  });
}