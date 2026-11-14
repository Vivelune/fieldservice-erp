import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";

import { prisma } from "@/lib/db/prisma";

const authSecret = process.env.BETTER_AUTH_SECRET;
const authUrl = process.env.BETTER_AUTH_URL;

if (!authSecret) {
  throw new Error("BETTER_AUTH_SECRET is missing.");
}

if (!authUrl) {
  throw new Error("BETTER_AUTH_URL is missing.");
}

export const auth = betterAuth({
  appName: "Field Service ERP",

  baseURL: authUrl,

  secret: authSecret,

  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },

  advanced: {
    database: {
      generateId: "uuid",
    },
  },

  trustedOrigins: [
    "http://localhost:3000",
    authUrl,
  ],
});