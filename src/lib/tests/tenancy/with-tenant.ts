
import "server-only";

import { prisma } from "@/lib/db/prisma";
import type { Prisma } from "@/generated/prisma/client";

/**
 * Transaction client passed to tenant-scoped database operations.
 */
export type TenantTransaction = Prisma.TransactionClient;

/**
 * Raised when a supplied user ID or tenant ID is invalid,
 * or when the user does not belong to the requested tenant.
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
 * Runs a database operation inside an authenticated tenant context.
 *
 * Security flow:
 * 1. Validate user and tenant IDs.
 * 2. Start a database transaction.
 * 3. Set the tenant context for this transaction only.
 * 4. Verify the user's membership in the requested tenant.
 * 5. Execute the supplied database operation.
 *
 * The callback must use the supplied transaction client (tx),
 * not the global Prisma client.
 */
export async function withTenant<T>(
  userId: string,
  tenantId: string,
  callback: (tx: TenantTransaction) => Promise<T>,
): Promise<T> {
  validateUuid(userId, "user ID");
  validateUuid(tenantId, "tenant ID");

  return prisma.$transaction(async (tx) => {
    // Set tenant context only for the lifetime of this transaction.
    await tx.$queryRaw`
      SELECT set_config(
        'app.current_tenant_id',
        ${tenantId},
        true
      )
    `;

    // Confirm that the authenticated user belongs to this tenant.
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

    // Execute the requested operation within the same transaction.
    return callback(tx);
  });
}
