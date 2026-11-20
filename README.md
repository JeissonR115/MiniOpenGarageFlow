# OpenGarageFlow

Aplicación para gestionar clientes, vehículos, pedidos de trabajo e historial de servicios de un taller automotriz.

## Requisitos

- Node.js 20.9 o posterior
- npm

## Desarrollo local

1. Instala las dependencias:

   ```bash
   npm install
   ```

2. Copia `.env.example` a `.env` y configura `DATABASE_URL`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` y `AUTH_SECRET`. Los valores de ejemplo son solo marcadores de desarrollo; usa una contraseña y un secreto aleatorios de al menos 32 caracteres, distintos en cada entorno. No compartas ni versionas `.env`.
3. Aplica las migraciones, crea o actualiza el administrador configurado y carga datos de prueba:

   ```bash
   npm run db:seed
   ```

   También puedes ejecutar `npx prisma db seed`; ambos comandos aplican primero las migraciones pendientes. El seed reemplaza los servicios, pedidos, vehículos y clientes de esa base con datos de demostración; ejecútalo solo sobre una base local que puedas reinicializar, nunca sobre datos de producción. En entornos distintos de producción se crean además dos cuentas de prueba: `admin@opengarageflow.local` con contraseña `admin` y `user1@opengarageflow.local` con contraseña `user1`. No uses estas cuentas fuera de desarrollo.

4. Inicia el servidor:

   ```bash
   npm run dev
   ```

Abre <http://localhost:3000> e inicia sesión con las credenciales de administrador definidas en `.env` o con una cuenta de prueba local. El seed falla si faltan las variables del administrador. Los comandos `npm run lint`, `npm run typecheck`, `npm test`, `npm run e2e`, `npm run build` y `npm run verify` verifican el proyecto.

El Administrador puede crear cuentas de Recepción desde **Usuarios**. No hay registro público. Recepción puede consultar y crear clientes, vehículos, servicios y pedidos, pero no editarlos ni eliminarlos; ambos roles pueden consultar el dashboard. Cada vehículo tiene un historial de servicios, separado de sus pedidos de trabajo. En datos de prueba, `admin@opengarageflow.local` tiene rol Administrador y `user1@opengarageflow.local` tiene rol Recepción.

## Dashboard

**Inicio** conserva los conteos de pedidos pendientes, en proceso y terminados hoy, y la lista de pedidos activos. También muestra los totales de clientes y vehículos, el tipo y fecha del registro más reciente, la distribución de vehículos por marca y los registros de clientes por mes calendario en `America/Bogota`. Los dos roles autenticados pueden consultar todas estas métricas; las visualizaciones presentan estados vacíos cuando no hay datos.

## Clientes y vehículos

En **Clientes** puedes buscar por nombre o teléfono, ordenar los resultados y abrir el detalle de cada cliente para consultar sus vehículos. En **Vehículos** puedes buscar por placa, marca, modelo o propietario, filtrar por marca y propietario, y ordenar por placa, marca, modelo o propietario. Ambas listas incluyen paginación y un enlace **Exportar CSV** que conserva los filtros y el orden seleccionados, e incluye todos los resultados, no solo la página visible. El CSV escapa comas, comillas y saltos de línea, e impide que valores de texto se interpreten como fórmulas de hoja de cálculo.

La prueba e2e automatizada crea un cliente, registra un vehículo e intenta registrar una segunda vez la misma placa. Instala Chromium y ejecútala con:

```bash
npx playwright install chromium
npm run e2e
```

La prueba prepara una base SQLite aislada (`e2e-test.db`) y la vuelve a sembrar en cada ejecución; no modifica la base de desarrollo configurada en `.env`.

## Docker

Configura `.env` con `ADMIN_EMAIL`, `ADMIN_PASSWORD` (mínimo 8 caracteres) y `AUTH_SECRET` (mínimo 32 bytes). Al iniciar, el contenedor aplica migraciones y crea el primer administrador con esas variables si todavía no existe ningún usuario; en reinicios posteriores no cambia la cuenta ni su contraseña. No se ejecuta el seed de datos de prueba ni se borran clientes, vehículos, pedidos o servicios.

```bash
cp .env.example .env
# Edita .env y reemplaza los valores de ejemplo por valores privados.
docker compose config
docker compose up --build -d
docker compose ps
curl http://localhost:3000/api/health
```

Compose publica el servicio en el puerto `3000` (se puede cambiar con `APP_PORT`) y conserva SQLite en el volumen `opengarageflow-data`, montado en `/app/data`. El `HEALTHCHECK` consulta `/api/health`, que solo responde saludable cuando SQLite está disponible. `docker compose down` conserva el volumen; `docker compose down -v` lo elimina junto con los datos. Define un `AUTH_SECRET` exclusivo y fuerte en cada entorno y no uses los valores locales de ejemplo. `.env` no se copia en la imagen.

## Documentación

- [Descripción del proyecto](docs/proyecto.md)
- [DevOps, GitHub Actions y Docker](docs/devops.md)
