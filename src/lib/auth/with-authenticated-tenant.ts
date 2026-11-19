import "server-only";

import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";

import {
  TenantAccessDeniedError,
  withTenant,
  type TenantTransaction,
} from "@/lib/tenancy/with-tenant";

/**
 * Raised when a request does not have a valid
 * authenticated Better Auth session.
 */
export class AuthenticationRequiredError extends Error {
  constructor(message = "You must be signed in to continue.") {
    super(message);
    this.name = "AuthenticationRequiredError";
  }
}

/**
 * Runs a database operation for an authenticated user
 * within a tenant they belong to.
 *
 * The user ID comes directly from the server-side
 * Better Auth session.
 *
 * The browser cannot supply or override the user ID.
 */
export async function withAuthenticatedTenant<T>(
  tenantId: string,
  callback: (tx: TenantTransaction) => Promise<T>,
): Promise<T> {
  // Retrieve the authenticated user's server-side session.
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new AuthenticationRequiredError();
  }

  const userId = session.user.id;

  if (!userId) {
    throw new TenantAccessDeniedError();
  }

  // Verify membership and execute within tenant context.
  return withTenant(userId, tenantId, callback);
}