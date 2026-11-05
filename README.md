# OpenGarageFlow

Aplicación para registrar clientes de un taller automotriz y los vehículos asociados a cada cliente.

## Requisitos

- Node.js 20.9 o posterior
- npm

## Desarrollo local

1. Instala las dependencias:

   ```bash
   npm install
   ```

2. Copia `.env.example` a `.env` y ajusta `DATABASE_URL` si necesitas otra ruta para SQLite.
3. Inicializa la base de datos:

   ```bash
   npx prisma migrate deploy
   ```

4. Inicia el servidor:

   ```bash
   npm run dev
   ```

Abre <http://localhost:3000>. Los comandos `npm run lint`, `npm test` y `npm run build` verifican el proyecto.

## Docker

Construye y ejecuta la imagen con una base persistente:

```bash
docker build -t opengarageflow .
docker run --rm -p 3000:3000 -v opengarageflow-data:/app/data opengarageflow
```

El contenedor ejecuta las migraciones Prisma al arrancar. La base predeterminada vive en `/app/data/opengarageflow.db`; para cambiarla, configura `DATABASE_URL` con una ruta SQLite persistida. `.env` no se copia en la imagen.
