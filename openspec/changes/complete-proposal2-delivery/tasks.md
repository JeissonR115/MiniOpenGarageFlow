# Tasks

## 1. Datos y autorización por roles

- [x] 1.1 Añadir los roles Administrador y Recepción y el modelo Prisma de servicios con relación restrictiva a vehículos; crear una migración aditiva y probarla sobre una base existente para confirmar que conserva usuarios, clientes, vehículos y pedidos.
- [x] 1.2 Implementar creación administrativa de cuentas de Recepción con contraseña hasheada, correo único y validación; probar alta, rechazo de duplicados y rechazo de solicitudes de usuarios no administradores.
- [x] 1.3 Centralizar la autorización por rol en páginas y acciones del servidor; probar que Recepción puede crear y consultar, no puede editar ni eliminar y que el Administrador conserva acceso total.
- [x] 1.4 Actualizar documentación de configuración y acceso para describir roles, alta administrativa y ausencia de registro público; verificar que README y `.env.example` no exponen secretos reales.

## 2. Consulta y exportación de clientes y vehículos

- [x] 2.1 Añadir búsqueda, filtros, orden estable y paginación en las consultas de clientes y vehículos; probar criterios combinados, resultados vacíos y persistencia de filtros al cambiar de página.
- [x] 2.2 Actualizar las páginas de clientes y vehículos con búsqueda, filtros, orden y navegación; añadir detalle de cliente y formulario de vehículo con propietario preseleccionado, y probar ambos flujos.
- [x] 2.3 Implementar exportaciones CSV que respeten los filtros pero incluyan todas las páginas; probar comas, comillas, saltos de línea y datos del propietario.
- [x] 2.4 Documentar búsqueda, filtros, detalle y exportación; añadir una prueba e2e para crear un cliente y vehículo e intentar registrar una placa duplicada, y verificarla con el comando documentado.

## 3. Historial de servicios

- [x] 3.1 Implementar validación y operaciones de servicios con fecha, descripción, costo no negativo e historial ordenado; probar datos inválidos, actualización, eliminación y rechazo al borrar vehículos con servicios asociados.
- [x] 3.2 Añadir la interfaz de historial y formularios según los permisos de cada rol; probar registro y consulta para Recepción, y edición y eliminación solo para Administrador.
- [x] 3.3 Actualizar la documentación del modelo de datos y el uso del historial; verificar el diagrama entidad-relación y las instrucciones con datos semilla repetibles.

## 4. Dashboard del taller

- [x] 4.1 Añadir fecha de registro de vehículos con migración aditiva, y consultas de total de clientes, total de vehículos, último registro, vehículos por marca y clientes por mes en `America/Bogota`; probar conteos, agrupación mensual y estados sin datos.
- [x] 4.2 Ampliar Inicio con métricas y gráficos manteniendo el resumen actual de pedidos; probar dashboard con datos y vacío, accesible tanto para Administrador como para Recepción.
- [x] 4.3 Actualizar los diagramas de arquitectura y pipeline, y documentar las métricas y visualizaciones en README; verificar que los diagramas coinciden con la aplicación.

## 5. Contenedor y persistencia

- [x] 5.1 Implementar `GET /api/health` accesible sin login y con verificación de SQLite; probar respuestas saludables y no saludables y confirmar que las rutas internas siguen protegidas.
- [x] 5.2 Actualizar explícitamente `Dockerfile` con `HEALTHCHECK` y añadir Docker Compose con variables de entorno y volumen SQLite; conservar build multi-etapa, usuario no privilegiado y migraciones de arranque, y verificar la configuración con `docker compose config`.
- [x] 5.3 Documentar inicio, salud, migraciones y persistencia; construir y ejecutar la imagen con una base nueva y una existente, comprobar que pasa a saludable y que los datos sobreviven a la recreación del contenedor.

## 6. Calidad local y CI/CD

- [x] 6.1 Añadir scripts de verificación y hooks Husky/lint-staged, Prettier, commitlint y pre-push; probar que los controles aceptan cambios válidos y rechazan errores de lint, tipos, pruebas y formato de commit.
- [x] 6.2 Completar GitHub Actions con lint, tipos, Vitest, Playwright, build, Docker y Trivy; publicar en GHCR solo desde `main`, añadir Dependabot y release-please, y comprobar condiciones y permisos de los workflows.
- [x] 6.3 Actualizar `docs/devops.md` y README con comandos locales, stages del pipeline, secretos requeridos y configuración externa de protección de `main`; verificar que cada comando documentado coincide con los workflows.

## 7. Verificación integrada

- [ ] 7.1 Ejecutar lint, typecheck, Vitest, build y pruebas e2e desde una instalación limpia; corregir regresiones y confirmar que clientes, vehículos, autenticación, pedidos y dashboard existente siguen funcionando.
- [ ] 7.2 Ejecutar el flujo completo de Compose con volumen persistente, revisar logs de migración y el estado de salud, y verificar el inicio de sesión con ambos roles y sus permisos.
