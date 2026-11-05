# Tasks

## 1. Esquema y configuración

- [x] 1.1 Agregar `jose` y `bcryptjs` como dependencias de runtime y actualizar el lockfile; verificar con `npm ls jose bcryptjs`. Commit: `chore(auth): add lightweight auth dependencies`
- [x] 1.2 Añadir los modelos Prisma `Usuario` y `Pedido`, `fecha_terminacion` y estado como `String` validado con Zod, con relación restrictiva con `Vehiculo`; generar la migración y verificar con `npx prisma validate` y `npx prisma migrate dev` sobre una base de desarrollo. Commit: `feat(db): add user and work order models`
- [x] 1.3 Documentar `ADMIN_EMAIL`, `ADMIN_PASSWORD` y `AUTH_SECRET` en `.env.example`, añadir solo valores locales de desarrollo en `.env` ignorado y explicar su configuración en README; verificar que `.env.example` no contenga secretos de producción. Commit: `feat(config): document administrator environment`

## 2. Autenticación

- [x] 2.1 Implementar hash y comparación de contraseñas, emisión/verificación de sesión firmada y configuración de cookie protegida; validar variables faltantes y probar duración, firma y cookie con pruebas enfocadas. Commit: `feat(auth): add password and session utilities`
- [x] 2.2 Crear `/login`, validar correo y contraseña con Zod, implementar inicio/cierre de sesión y mostrar “Cerrar sesión” en la sidebar; verificar accesos correctos, errores genéricos y eliminación de cookie con pruebas enfocadas. Commit: `feat(auth): add login and logout flow`
- [x] 2.3 Proteger las rutas internas con `proxy.ts`, dejando accesibles `/login` y recursos estáticos; verificar redirección sin sesión, acceso con sesión y rechazo de sesiones inválidas o vencidas. Commit: `feat(auth): protect application routes`
- [x] 2.4 Extender el seed para crear o actualizar el administrador por correo usando `ADMIN_EMAIL` y `ADMIN_PASSWORD`, guardando solo el hash y fallando si faltan valores; verificar el upsert y la ausencia de contraseña en texto plano. Commit: `feat(auth): seed administrator from environment`

## 3. Pedidos de trabajo

- [x] 3.1 Implementar validaciones Zod y operaciones de crear, listar, actualizar y eliminar pedidos, incluyendo fecha de finalización al completar o reactivar, conflictos de vehículo y restricción de borrado; probar transiciones y datos inválidos. Commit: `feat(orders): add validated order data operations`
- [x] 3.2 Añadir el CRUD de pedidos en Next.js para seleccionar vehículos existentes y mostrar vehículo y propietario; verificar alta, edición, cambio de estado, eliminación y estado vacío sin alterar los CRUD existentes. Commit: `feat(orders): add work order management UI`
- [x] 3.3 Extender el seed con pedidos sintéticos, fecha de finalización y limpieza en orden pedidos, vehículos y clientes, conservando el administrador configurado; ejecutarlo dos veces y verificar que no duplica datos y que cada pedido referencia un vehículo válido. Commit: `feat(orders): seed repeatable work orders`

## 4. Dashboard

- [x] 4.1 Implementar consultas de totales y pedidos activos, contando `fecha_terminacion` dentro del día calendario `America/Bogota`; probar límites del día, conteos por estado y orden descendente. Commit: `feat(dashboard): add order summary queries`
- [x] 4.2 Reemplazar Inicio con tarjetas y tabla de pedidos activos usando el tema actual, mostrando el estado vacío; verificar cliente, placa, descripción, estado y fecha para datos reales del CRUD. Commit: `feat(dashboard): show work order dashboard`

## 5. Integración y despliegue

- [x] 5.1 Verificar la migración automática en una imagen Docker reconstruida con volumen SQLite nuevo y persistente; confirmar en logs que las migraciones se aplican antes de iniciar Next.js y que el segundo arranque no vuelve a aplicarlas. Commit: `test(docker): verify auth and orders migrations`
- [x] 5.2 Ejecutar `npm test`, `npm run lint` y `npm run build`, corregir cualquier regresión y documentar el comando para crear el administrador y acceder al sistema; confirmar que los CRUD previos siguen funcionando y que no se filtran rutas sin sesión. Commit: `test(app): verify authenticated order workflow`
