# Proposal

## Why

El taller necesita reemplazar sus listas en papel con una aplicación sencilla que permita mantener los datos de clientes y vehículos de forma confiable. La relación entre cada vehículo y su propietario, junto con validaciones y una base reproducible para desarrollo y despliegue, reduce errores de registro y deja lista la primera versión para ejecutarse en local o mediante Docker.

## What Changes

- Incorporar una aplicación monolítica Next.js (App Router y TypeScript) con persistencia SQLite mediante Prisma.
- Permitir registrar, consultar, actualizar y eliminar clientes y vehículos; cada vehículo pertenece a un cliente existente y se presenta con el nombre de su propietario.
- Validar los datos de entrada con Zod, incluidos campos obligatorios, correo opcional, año válido y placa única.
- Añadir configuración de entorno con `.env.example`, mantener `.env` fuera del control de versiones y documentar la configuración local necesaria.
- Preparar una imagen Docker multi-stage y workflows de GitHub Actions para lint/build y construcción de imagen.

## Capabilities

### New Capabilities

- `customer-vehicle-management`: Gestión CRUD de clientes y vehículos, relación de propiedad y validación de sus datos.

### Modified Capabilities

- Ninguna.

## Impact

- Aplicación y persistencia: Next.js, TypeScript, SQLite, Prisma y Zod.
- Configuración del repositorio: `.gitignore`, `.env.example` y `.env` local.
- Entrega: Dockerfile multi-stage y workflows `.github/workflows/ci.yml` y `.github/workflows/docker.yml`.
- El workspace inspeccionado contiene requisitos y contexto OpenSpec, pero no implementación ni manifiestos de dependencias; el diseño y las tareas deberán crear la base del proyecto sin asumir código existente.
