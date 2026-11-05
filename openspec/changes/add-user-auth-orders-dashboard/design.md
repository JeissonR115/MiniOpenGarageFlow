# Design

## Context

OpenGarageFlow es un monolito Next.js 16 App Router con Prisma 7, SQLite y Zod. Las acciones del CRUD se implementan como Server Actions y el contenedor ya ejecuta `prisma migrate deploy` antes de iniciar Next.js. El seed actual recrea clientes y vehículos; debe limpiar primero los pedidos nuevos y crear el administrador desde el entorno.

## Goals / Non-Goals

**Goals:**
- Integrar autenticación de un administrador sin añadir un framework de auth ni un flujo de registro.
- Añadir pedidos relacionados con los vehículos existentes y el resumen solicitado en Inicio.
- Mantener SQLite, los patrones sencillos existentes y el arranque Docker con migraciones automáticas.

**Non-Goals:**
- Roles, invitaciones, recuperación de contraseñas o administración de usuarios desde la interfaz.
- Múltiples talleres, pagos, inventario, asignación de mecánicos o historial/auditoría de cambios.
- Cambiar los flujos actuales de clientes y vehículos, excepto impedir que se elimine un vehículo usado en pedidos.

## Decisions

- **Sesión firmada con `jose` y cookie propia.** Emitir un JWT de duración limitada (8 horas) con identificador de usuario y vencimiento; validarlo con `jose` tanto en la protección de rutas como en el servidor. La cookie será `httpOnly`, `SameSite=Lax`, `Path=/`, con `Secure` en producción. `AUTH_SECRET` será obligatorio y se validará por longitud suficiente; no se incluirá un valor real en archivos versionados. Alternativas descartadas: sesiones persistidas en otra tabla o una librería completa de autenticación, que añaden estado y dependencias sin necesidad para un solo administrador.
- **Hash con `bcryptjs`.** Hashear y comparar contraseñas con una dependencia JavaScript, evitando módulos nativos adicionales en las imágenes Linux. El seed exige `ADMIN_EMAIL` y `ADMIN_PASSWORD`, crea o actualiza el administrador por correo y nunca guarda la contraseña en texto plano. `.env.example` contendrá solo valores de muestra; `.env` local usará credenciales claramente de desarrollo y un secreto local generado, no credenciales de producción.
- **Protección de rutas según Next.js 16.** Implementar el control de acceso en `proxy.ts`, el punto de entrada actual de Next para interceptar solicitudes (sucesor del middleware tradicional), verificando la cookie antes de permitir rutas internas y dejando pasar `/login` y recursos estáticos. Las Server Actions permanecen bajo las rutas protegidas. La sesión se emitirá y borrará desde acciones de servidor.
- **Modelos Prisma relacionales.** Agregar `Usuario` con correo único y `Pedido` con relación obligatoria a `Vehiculo`; almacenar el estado como `String` porque Prisma no admite enums en SQLite, y validar con Zod que solo se acepten `pendiente`, `en_proceso` o `terminado`. Registrar `fechaTerminacion` al terminar un pedido y limpiarla si se reactiva. Aplicar `onDelete: Restrict` a vehículo-pedido para no perder órdenes al borrar un vehículo. Manejar los conflictos de relación como errores visibles.
- **Dashboard consultado desde el servidor.** Consultar en Prisma los totales por estado y los pedidos activos con relaciones de vehículo y cliente, ordenados por fecha descendente. Para “terminados hoy”, contar `fechaTerminacion` dentro del intervalo del día en `America/Bogota`, evitando depender de la zona horaria del host o del contenedor.
- **Migración y seed repetible.** Crear y comprobar la migración localmente; el entrypoint Docker existente la aplicará con `prisma migrate deploy`. El seed elimina pedidos antes de vehículos y clientes, vuelve a generar los datos sintéticos y hace upsert del administrador configurado.

## Risks / Trade-offs

- [La clave de sesión o las credenciales de administrador pueden faltar en un despliegue] → Fallar explícitamente al iniciar sesión o ejecutar el seed; documentar las variables requeridas y nunca usar un secreto de respaldo.
- [Las contraseñas de seed podrían cambiar al reejecutarlo] → Definir y documentar que el upsert actualiza el hash con el valor vigente de `ADMIN_PASSWORD`; el usuario podrá volver a sembrar para aplicar una rotación.
- [Una sesión firmada no puede revocarse individualmente antes de vencer] → Mantener una duración limitada y hacer que cerrar sesión borre la cookie; no añadir almacenamiento de sesiones para esta escala.
- [La restricción de borrado de vehículos cambia ese caso del CRUD existente] → Presentar un error claro al usuario y permitir eliminar o reasignar primero el pedido.
- [El nuevo esquema requiere migración en cada base existente] → Mantener `migrate deploy` al arranque y verificar tanto una base vacía como una base persistente en la imagen Docker.

## Migration Plan

1. Añadir modelos y migración Prisma, variables de entorno y datos de seed; aplicar la migración en desarrollo y revisar que el seed sea repetible.
2. Desplegar la imagen nueva. El entrypoint existente aplicará la migración antes de servir solicitudes; configurar `DATABASE_URL`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` y un `AUTH_SECRET` fuerte por entorno.
3. Confirmar el acceso con el administrador sembrado y el funcionamiento del dashboard.
4. Para rollback de aplicación, volver a la imagen anterior conservando la base de datos. No revertir la migración automáticamente ni eliminar datos; si fuera imprescindible volver al esquema anterior, respaldar SQLite y planificar una restauración controlada.
