# DevOps de OpenGarageFlow

Este documento describe cómo se prepara, verifica y ejecuta OpenGarageFlow. La automatización actual valida el código y construye una imagen Docker; no publica imágenes en un registry ni despliega la aplicación a un servidor.

## Flujo general

1. Los cambios se versionan con Git.
2. Al abrir o actualizar un pull request, y al enviar cambios a `main`, GitHub Actions ejecuta los workflows de CI y Docker.
3. CI instala las dependencias, genera Prisma Client, ejecuta lint, pruebas y compilación.
4. El workflow de Docker construye la imagen para comprobar que el contenedor se puede empaquetar.
5. Una vez revisados e integrados los cambios, la imagen puede construirse y ejecutarse en el entorno de destino siguiendo las instrucciones de este documento.

Ambos workflows también se pueden iniciar manualmente desde GitHub Actions mediante `workflow_dispatch`.

## Git y colaboración

Git mantiene el historial del código y permite trabajar en ramas y revisar cambios antes de integrarlos en `main`. El flujo recomendado es crear una rama por cambio, hacer commits pequeños y descriptivos, abrir un pull request y verificar que las acciones finalicen correctamente antes de integrar.

El proyecto documenta la convención Conventional Commits (`feat`, `fix`, `chore`, `docs`, `ci`) en [openspec/project.md](../openspec/project.md). Esta es una convención de trabajo; los workflows actuales no tienen un paso que valide automáticamente el formato de los commits.

## Integración continua: GitHub Actions

Los archivos de automatización están en `.github/workflows/`:

- [ci.yml](../.github/workflows/ci.yml), workflow **CI**: se ejecuta en pull requests, pushes a `main` y ejecuciones manuales.
  - Usa Ubuntu y Node.js 24.
  - Instala dependencias reproducibles con `npm ci`.
  - Genera Prisma Client.
  - Ejecuta `npm run lint`, `npm test` y `npm run build`.
  - Define `DATABASE_URL=file:./dev.db` para la verificación.
- [docker.yml](../.github/workflows/docker.yml), workflow **Docker**: tiene los mismos eventos y construye `opengarageflow:ci` con `docker build`.
  - Comprueba la construcción de la imagen.
  - No la sube a Docker Hub, GitHub Container Registry ni otro registry.
  - No realiza un despliegue.
- [copilot-setup-steps.yml](../.github/workflows/copilot-setup-steps.yml): prepara el CLI de OpenSpec para el agente de Copilot cuando se modifica ese workflow, en pull requests que lo modifican o bajo ejecución manual.

Los comandos de verificación también se pueden ejecutar localmente:

```bash
npm run lint
npm test
npm run build
```

## Contenedor Docker

El [Dockerfile](../Dockerfile) utiliza varias etapas para separar la instalación de dependencias, la compilación y la imagen de ejecución. La etapa final ejecuta Next.js en modo producción con el usuario sin privilegios `nextjs`, expone el puerto `3000` y conserva los datos de SQLite en `/app/data`.

Al arrancar, [docker-entrypoint.sh](../docker-entrypoint.sh):

1. Crea el directorio de la base de datos configurada en `DATABASE_URL`.
2. Aplica las migraciones pendientes con `prisma migrate deploy`.
3. Ejecuta `prisma/bootstrap-admin.ts` para crear el primer administrador si aún no hay usuarios.
4. Inicia el servidor de Next.js.

El bootstrap requiere `ADMIN_EMAIL` válido, `ADMIN_PASSWORD` de al menos 8 caracteres y `AUTH_SECRET` de al menos 32 bytes. Si ya hay un usuario, no cambia su cuenta ni su contraseña. Para conservar la base de datos entre recreaciones del contenedor, se recomienda montar un volumen en `/app/data`.

### Construir y ejecutar localmente

Desde la raíz del repositorio:

```bash
cp .env.example .env
# Reemplaza los valores de ejemplo por valores privados y seguros.
docker build -t opengarageflow .
docker run -d --name opengarageflow \
  -p 3000:3000 \
  --env-file .env \
  -e DATABASE_URL=file:/app/data/opengarageflow.db \
  -v opengarageflow-data:/app/data \
  opengarageflow
```

La aplicación queda disponible en <http://localhost:3000>. Para una configuración con Compose, orquestación, publicación de imágenes o despliegue remoto se requiere agregar esa automatización: no está incluida actualmente.

## Configuración y datos

- [.env.example](../.env.example) contiene nombres de variables y valores ilustrativos.
- `.env` se excluye de Git mediante [.gitignore](../.gitignore); no se deben subir credenciales ni secretos.
- La imagen excluye archivos locales según [.dockerignore](../.dockerignore).
- Para despliegues, configura los secretos en el entorno de ejecución en lugar de incluirlos en el código o en la imagen. Usa un `AUTH_SECRET` aleatorio y exclusivo por entorno, y una ruta de SQLite persistida.
- El contenedor aplica migraciones, pero no carga datos de prueba. `npm run db:seed` es el comando de desarrollo para migraciones y datos iniciales.
