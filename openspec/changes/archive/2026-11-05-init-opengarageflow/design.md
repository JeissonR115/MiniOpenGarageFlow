# Design

## Context

El workspace contiene los requisitos funcionales y las decisiones técnicas en `docs/requisitos.md` y `openspec/project.md`, pero no tiene código ni manifiestos de dependencias. La implementación debe establecer el proyecto completo sin depender de una estructura previa. El contrato funcional está en [specs/customer-vehicle-management/spec.md](./specs/customer-vehicle-management/spec.md).

## Goals / Non-Goals

**Goals:**
- Mantener una aplicación Next.js monolítica con persistencia relacional y una sola fuente de validación para operaciones de escritura.
- Hacer que la aplicación sea sencilla de ejecutar localmente y empaquetar en Docker.
- Ofrecer workflows reproducibles para comprobar lint/build y construir la imagen sin credenciales de publicación.

**Non-Goals:**
- Autenticación, roles, múltiples talleres o acceso remoto a datos.
- Publicar automáticamente la imagen en un registry.
- Añadir reportes, órdenes de reparación, pagos o historial de servicio.

## Decisions

- **Crear una aplicación Next.js App Router con TypeScript y una interfaz sencilla para el taller.** Las páginas presentan listas y formularios de clientes y vehículos; las operaciones de escritura usan Server Actions para mantener la aplicación como monolito y evitar una API separada. Se consideró una API REST con cliente frontend independiente, pero añade capas y complejidad que no requieren los flujos de esta primera versión.
- **Modelar `Cliente` y `Vehiculo` en Prisma sobre SQLite, con relación uno-a-muchos y restricción de integridad.** `Vehiculo.clienteId` será obligatorio y referenciará `Cliente.id`; las eliminaciones del cliente se restringirán mientras existan vehículos, de acuerdo con la decisión funcional, evitando borrados en cascada. Un vehículo se podrá eliminar sin eliminar al cliente.
- **Validar entradas con esquemas Zod en el servidor antes de persistirlas.** Se compartirán reglas entre creación y actualización; Prisma mantendrá además restricciones de base de datos para placas únicas y relaciones. Los errores de validación y conflictos de unicidad se presentarán como errores recuperables junto al formulario, sin guardar cambios parciales.
- **Normalizar placas antes de validar y persistirlas.** Se recortarán espacios externos y se convertirán a mayúsculas; la unicidad se aplicará a ese valor canónico para que diferencias de espacios o mayúsculas no creen duplicados.
- **Interpretar año válido como entero entre 1886 y el año calendario actual más uno.** El límite superior permite vehículos del próximo año-modelo; el campo seguirá siendo opcional. Esta regla hace verificable el requisito sin depender de una lista específica de fabricantes.
- **Configurar SQLite mediante `DATABASE_URL` y mantener `.env` ignorado.** `.env.example` documentará la ruta local de la base; `.env` contendrá solo configuración de desarrollo no sensible. Las migraciones Prisma serán la fuente versionada del esquema; la base de desarrollo no se incluirá en la imagen.
- **Construir una imagen Docker multi-stage con dependencias, build y runtime separados.** El runtime ejecutará la aplicación con el mínimo de archivos necesario y la base SQLite quedará en una ruta montable como volumen. La imagen no contendrá `.env` ni una base local.
- **Separar CI y build de Docker en workflows de GitHub Actions.** CI instalará dependencias de forma reproducible y ejecutará lint y build; el workflow Docker construirá la imagen en los eventos de integración definidos, sin push. Se consideró publicar en un registry, pero requiere decidir proveedor y secretos, fuera del alcance.

## Risks / Trade-offs

- **SQLite puede ser inadecuado para escrituras concurrentes a mayor escala** → mantener la capa de persistencia detrás de Prisma y documentar el volumen de Docker; cambiar a otro motor queda fuera de esta versión.
- **Una base SQLite dentro de un contenedor se pierde al reemplazarlo si no hay volumen** → fijar una ruta de datos explícita y documentar el montaje persistente para ejecución local.
- **Las restricciones de unicidad también pueden fallar bajo escrituras simultáneas después de validar** → convertir el error de Prisma en un mensaje de conflicto y conservar la restricción única en la base.
- **La imagen puede carecer de dependencias necesarias para generar Prisma o iniciar Next.js** → generar el cliente en una etapa de build y validar la construcción con el workflow Docker.

## Migration Plan

No hay datos ni aplicación existente que migrar. Crear la estructura Next.js, instalar dependencias, definir el esquema Prisma y su migración inicial, y después habilitar la aplicación y los workflows. Para volver atrás, retirar el despliegue; los datos persistidos permanecen en el volumen y pueden restaurarse al volver a desplegar una versión compatible. No se planea una migración automática de datos.
