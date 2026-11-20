import { spawnSync } from "node:child_process";
import { testEnvironment } from "./test-environment";

export default function globalSetup() {
  const result = spawnSync("npm", ["run", "db:seed"], {
    env: { ...process.env, ...testEnvironment },
    stdio: "inherit",
  });

  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(
      `E2E database setup failed with exit code ${result.status ?? "unknown"}.`,
    );
  }
}
