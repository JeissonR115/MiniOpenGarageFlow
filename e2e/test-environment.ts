export const testEnvironment = {
  DATABASE_URL: "file:./e2e-test.db",
  ADMIN_EMAIL: "e2e-admin@opengarageflow.local",
  ADMIN_PASSWORD: "e2e-admin-password",
  AUTH_SECRET: "e2e-only-secret-not-for-production-0123456789",
  NODE_ENV: "development",
} as const;
