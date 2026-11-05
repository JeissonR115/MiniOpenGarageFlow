# Proposal

## Why

OpenGarageFlow ya permite mantener clientes y vehículos, pero no restringe el acceso al taller ni permite hacer seguimiento de sus trabajos. Un inicio de sesión sencillo y un tablero de pedidos dan al personal un punto de entrada seguro y una vista diaria del trabajo pendiente.

## What Changes

- Agregar usuarios administradores almacenados con contraseña hasheada, inicio y cierre de sesión, sesión en cookie httpOnly firmada y protección de las rutas salvo `/login`.
- Configurar el administrador inicial exclusivamente desde `ADMIN_EMAIL`, `ADMIN_PASSWORD` y `AUTH_SECRET`, sin registro público ni credenciales reales en archivos versionados.
- Agregar pedidos de trabajo vinculados a vehículos, con descripción, fechas y los estados `pendiente`, `en_proceso` y `terminado`; permitir crear, consultar, actualizar y eliminar pedidos con validaciones Zod.
- Convertir Inicio en un dashboard con totales de pedidos pendientes, en proceso y terminados hoy, y un listado reciente de pedidos activos con vehículo y propietario.
- Extender el seed con un administrador configurado por entorno y pedidos sintéticos, manteniendo su repetibilidad y el orden correcto de limpieza de tablas.
- Añadir una migración compatible con SQLite; conservar la aplicación automática de migraciones al arranque del contenedor.

## Capabilities

### New Capabilities

- `user-auth`: acceso administrativo mediante credenciales, sesiones firmadas, cierre de sesión y protección de rutas.
- `work-orders-dashboard`: ciclo de vida de pedidos de trabajo y tablero de resumen para el taller.

### Modified Capabilities

- Ninguna. Los requisitos existentes de clientes y vehículos no cambian.

## Impact

- Prisma y SQLite: modelos de usuario y pedido, relaciones, migración y datos del seed.
- Next.js App Router: login, acciones de sesión, protección de rutas, CRUD de pedidos y dashboard.
- Dependencias de runtime para hash de contraseñas y firma/verificación de sesiones.
- `.env.example`, configuración local de entorno, Docker y pruebas de validación, autenticación, pedidos y dashboard.
- La migración nueva se aplicará con el `prisma migrate deploy` que ya ejecuta el entrypoint de Docker.
