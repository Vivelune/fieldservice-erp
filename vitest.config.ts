import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const srcPath = fileURLToPath(new URL("./src", import.meta.url));

const serverOnlyPath = fileURLToPath(
  new URL("./tests/server-only.ts", import.meta.url),
);

export default defineConfig({
  resolve: {
    alias: [
      {
        find: /^@\//,
        replacement: `${srcPath}/`,
      },
      {
        find: "server-only",
        replacement: serverOnlyPath,
      },
    ],
  },

  test: {
    include: ["tests/**/*.test.ts"],
    environment: "node",
    setupFiles: ["dotenv/config"],
    testTimeout: 30000,
    hookTimeout: 30000,
    fileParallelism: false,
  },
});