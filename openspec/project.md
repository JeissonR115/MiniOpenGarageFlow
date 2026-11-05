# Project Context

## Purpose
OpenGarageFlow: gestión de clientes y vehículos de un taller automotriz.

## Tech Stack
- Next.js (App Router, TypeScript), monolito
- SQLite con Prisma
- zod para validación
- Docker (multi-stage)
- GitHub Actions

## Conventions
- Código simple, sin sobreingeniería.
- Variables de entorno en .env (ignorado por git) y plantilla en .env.example.
- Commits con Conventional Commits (feat, fix, chore, docs, ci).
- Un commit por tarea completada.
