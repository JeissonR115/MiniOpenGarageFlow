# OpenGarageFlow

Aplicación para gestionar clientes, vehículos y pedidos de trabajo de un taller automotriz.

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

   También puedes ejecutar `npx prisma db seed`; ambos comandos aplican primero las migraciones pendientes. En entornos distintos de producción se crean además dos cuentas de prueba: `admin@opengarageflow.local` con contraseña `admin` y `user1@opengarageflow.local` con contraseña `user1`. No uses estas cuentas fuera de desarrollo.

4. Inicia el servidor:

   ```bash
   npm run dev
   ```

Abre <http://localhost:3000> e inicia sesión con las credenciales de administrador definidas en `.env` o con una cuenta de prueba local. El seed falla si faltan las variables del administrador. Los comandos `npm run lint`, `npm test` y `npm run build` verifican el proyecto.

## Docker

Construye y ejecuta la imagen con una base persistente:

```bash
docker build -t opengarageflow .
docker run --rm -p 3000:3000 --env-file .env -e DATABASE_URL=file:/app/data/opengarageflow.db -v opengarageflow-data:/app/data opengarageflow
```

El contenedor ejecuta las migraciones Prisma al arrancar. La base predeterminada vive en `/app/data/opengarageflow.db`; configura `DATABASE_URL` con una ruta SQLite persistida. Define credenciales de administrador y un `AUTH_SECRET` exclusivo y fuerte en cada entorno, no uses los valores locales de ejemplo. `.env` no se copia en la imagen.
