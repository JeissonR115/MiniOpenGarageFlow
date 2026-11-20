# Design

## Context

See `proposal.md` for motivation and user-visible scope. The current application is a Next.js monolith backed by Prisma and SQLite. `Usuario` has no role, session tokens identify a user, and the existing login proxy protects internal routes; customer and vehicle actions do not yet apply role checks. `Pedido` represents work orders and has a restrictive vehicle relation, but it does not store service cost. The dashboard currently summarizes orders. The Docker image is already multi-stage, runs as `nextjs`, persists SQLite under `/app/data`, and applies migrations in `docker-entrypoint.sh`. Existing GitHub Actions validate and build but do not publish or scan images.

## Goals / Non-Goals

**Goals:**

- Add the pending Proposal2 behaviors while preserving current customer, vehicle, authentication, order, and dashboard behavior.
- Keep authorization effective for direct server requests, preserve existing users during the role migration, and maintain SQLite data across container replacement.
- Define verifiable checks for application behavior, migrations, CI, and Docker delivery.

**Non-Goals:**

- Replace work orders with service history or change the existing order lifecycle.
- Move away from SQLite/Prisma or split the Next.js monolith.
- Implement deployment to a remote host or change GitHub repository settings that cannot be represented in the repository.

## Decisions

1. **Keep `Servicio` separate from `Pedido`.** Add a service record associated with a vehicle and retain work orders as their existing workflow. Use a restrictive vehicle relationship so deleting a vehicle cannot silently erase its service history. This follows the proposal's distinct service-history table and avoids changing order semantics.

2. **Persist roles and check them at the server boundary.** Add a role to each user and migrate existing users as Administrador to avoid locking out the current administrator. Keep the existing session authentication flow, but resolve the current user's role when processing protected operations rather than trusting UI visibility or a stale role embedded in a token. Centralize permission checks and apply them to both page access and every server action. Administrators create Recepción accounts; public registration remains unavailable.

3. **Filter before pagination and export the complete matching set.** Reuse the same validated search/filter criteria for displayed results and CSV generation. Apply a stable sort before slicing pages, so records do not move unpredictably between pages. Escape CSV fields according to their contents.

4. **Use Colombia's calendar for dashboard grouping.** Group customer registrations by calendar month in `America/Bogota`, consistent with the existing order dashboard's timezone behavior and the project's `es-CO` presentation.

5. **Add health reporting without adding a runtime utility package.** Expose `/api/health` without login redirection and have it check database availability. Add Docker's `HEALTHCHECK` in the runner using Node's built-in `fetch`; this keeps the production image small and avoids relying on `curl` being installed. Compose mounts the existing `/app/data` directory and supplies secrets through the runtime environment.

6. **Extend, rather than replace, the delivery workflows.** Add local hooks and the missing CI stages around the current lint, test, build, and Docker build workflows. Publish and scan only on the intended `main` path; document that required pull requests and status checks must also be enabled in GitHub repository settings.

7. **Persist vehicle registration time for dashboard metrics.** Add `Vehiculo.fechaRegistro` with a database default for new records. The additive SQLite migration assigns its application timestamp to existing vehicles, since the current schema has no historical creation date to recover. The dashboard can then compare customer and vehicle registration dates without estimating them from IDs or unrelated timestamps.

## Risks / Trade-offs

- [Existing user records may not have roles] → Make the schema migration additive with an Administrador default, then verify both existing administrator login and authorization before deployment.
- [A role check only in navigation can be bypassed] → Enforce authorization in every server action and test direct invocations as Recepción.
- [SQLite migrations can fail against a persistent database] → Keep migrations additive, back up the volume before deployment, and verify migration success before the application starts.
- [A health endpoint that only checks HTTP can report a broken instance as healthy] → Include a database availability check and exercise both success and failure responses.
- [CSV values can contain separators or line breaks] → Quote and escape fields consistently and test special characters in exported customer and vehicle data.
- [Publishing credentials or branch settings are external to source control] → Use GitHub Actions secrets and document the repository settings required for protected `main`; never bake credentials into the image.

## Migration Plan

1. Back up the SQLite volume and deploy the additive schema migration, preserving existing accounts and records.
2. Deploy role-aware authorization with existing users assigned Administrador; create Recepción accounts through the administrator-only flow.
3. Deploy service-history schema and application changes, then verify a service can be recorded and retrieved without changing existing orders.
4. Build and start the updated image with the persistent volume; confirm migrations finish, `/api/health` becomes healthy, and data remains after container recreation.
5. Enable the expanded CI/release workflows and configure required branch protections in GitHub.

Rollback requires restoring the pre-deployment database backup if the new migration or application version cannot be used. Do not remove service or role data by attempting a destructive schema rollback.
