# Mini proyecto: OpenGarageFlow

## Idea principal

Crear una aplicación sencilla para ayudar a un taller automotriz a organizar la información de sus clientes y los vehículos que recibe. El personal del taller podrá registrar, consultar, actualizar y eliminar esos datos sin depender de listas en papel.

En esta primera versión, cada cliente puede tener uno o varios vehículos, y cada vehículo pertenece a un solo cliente.

## Tabla `clientes`

| Campo | Tipo | Reglas | Ejemplo |
|---|---|---|---|
| `id` | Entero | PK; obligatorio; único | `1` |
| `nombre` | Texto | Obligatorio | `María` |
| `apellido` | Texto | Obligatorio | `López` |
| `telefono` | Texto | Obligatorio | `+57 300 123 4567` |
| `correo` | Texto | Opcional; formato de correo | `maria@example.com` |
| `fecha_registro` | Fecha | Obligatorio; automática | Día de creación |

## Tabla `vehiculos`

| Campo | Tipo | Reglas | Ejemplo |
|---|---|---|---|
| `id` | Entero | PK; obligatorio; único | `1` |
| `cliente_id` | Entero | Obligatorio; FK de `clientes.id` | `1` |
| `placa` | Texto | Obligatorio; única | `ABC123` |
| `marca` | Texto | Obligatorio | `Toyota` |
| `modelo` | Texto | Obligatorio | `Corolla` |
| `anio` | Entero | Opcional; año válido | `2020` |
| `color` | Texto | Opcional | `Blanco` |

## Relación

- Un cliente puede tener varios vehículos.
- Cada vehículo pertenece a un solo cliente.
- No se puede registrar un vehículo si el cliente no existe.

## Instrucciones

1. CRUD de clientes.
2. CRUD de vehículos.
3. Al registrar un vehículo, seleccionar un cliente existente.
4. Mostrar los vehículos junto con el nombre de su propietario.
5. Validar campos obligatorios y placa no repetida.
6. Probar con varios clientes y vehículos, incluyendo un cliente con más de un vehículo.

## Requisitos técnicos

- Next.js como monolito (App Router, TypeScript).
- Base de datos SQL (SQLite con Prisma).
- Crear .env.example y .env, con .env en .gitignore.
- Dockerfile para ejecutar la app.
- GitHub Actions básico (lint, build, imagen Docker).
- Commits con Conventional Commits.
