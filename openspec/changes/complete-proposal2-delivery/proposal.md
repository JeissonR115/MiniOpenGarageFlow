# Proposal

## Why

OpenGarageFlow ya cuenta con CRUD básico de clientes y vehículos, autenticación, pedidos de trabajo, un dashboard de pedidos y migraciones Prisma al iniciar Docker. La propuesta `docs/Proposal2.md` plantea completar la experiencia operativa del taller y su entrega; este cambio incorpora esos requisitos pendientes sin repetir lo ya implementado.

## What Changes

- Mejorar la consulta de clientes y vehículos con búsqueda, filtros, paginación, ordenamiento y exportación CSV; agregar el detalle del cliente con sus vehículos y el formulario de vehículo preseleccionado.
- Incorporar el historial cronológico de servicios por vehículo con fecha, descripción y costo no negativo. Se modelará como `Servicio`, separado de `Pedido`, que ya representa órdenes de trabajo y no contiene el costo del servicio.
- Añadir autorización por roles en páginas y acciones del servidor, junto con un mecanismo administrativo para crear cuentas de Recepción sin registro público. Administrador conserva acceso total; Recepción puede crear y consultar clientes, vehículos y servicios, no puede editar ni eliminar, y puede ver el dashboard completo.
- Ampliar el dashboard existente con métricas de clientes y vehículos, último registro y gráficos de vehículos por marca y clientes por mes, conservando el resumen actual de pedidos.
- Completar la automatización local y CI/CD: hooks de calidad y Conventional Commits, pruebas e2e, escaneo de imagen, publicación en GHCR solo desde `main`, actualizaciones automatizadas de dependencias y generación de releases.
- Completar la entrega en contenedor con una ruta de salud y `HEALTHCHECK`, configuración Compose y persistencia SQLite. Actualizar explícitamente `Dockerfile`, manteniendo su construcción multi-etapa, usuario sin privilegios y migraciones al arranque.
- Actualizar README y documentación técnica con instrucciones de ejecución, variables de entorno, arquitectura, modelo de datos, pipeline, decisiones y limitaciones.

## Capabilities

### New Capabilities

- `service-history`: registrar y consultar el historial de servicios de un vehículo, separado de los pedidos de trabajo.
- `role-based-access`: autorizar las operaciones de clientes, vehículos y servicios según el rol del usuario autenticado.
- `workshop-dashboard`: presentar las métricas y visualizaciones de clientes y vehículos junto con el resumen de pedidos existente.
- `container-delivery`: comprobar la salud de la aplicación y ejecutarla mediante Docker Compose con persistencia de SQLite.

### Modified Capabilities

- `customer-vehicle-management`: ampliar la consulta de clientes y vehículos con búsqueda, filtros, paginación, ordenamiento, exportación y detalle del cliente.

## Impact

- Prisma/SQLite: modelo y migración de servicios; consultas de clientes, vehículos e indicadores.
- Next.js App Router: páginas y acciones existentes de clientes y vehículos, detalle de cliente, historial de servicios, autorización por rol, dashboard y ruta `/api/health`.
- Docker: actualización de `Dockerfile`, nuevo archivo Compose y validación de persistencia, salud y migraciones.
- Calidad y entrega: `package.json` y lockfile, configuración de hooks, workflows de GitHub Actions, Dependabot y releases; pruebas unitarias y e2e.
- Documentación: README y documentos técnicos del proyecto.
