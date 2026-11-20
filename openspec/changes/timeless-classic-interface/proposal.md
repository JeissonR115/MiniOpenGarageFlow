# Propuesta

## Motivo

La aplicación ya usa Lucide en la navegación, pero sus acciones y páginas no comparten todavía un lenguaje visual e iconográfico uniforme. Una presentación clásica y proporcionada, coherente en todas las pantallas, facilitará reconocer las acciones del taller sin cambiar la tipografía, los colores ni el comportamiento actual.

## Cambios

- Extender el uso de la dependencia `lucide-react` existente a la navegación y a las acciones de la aplicación, incluyendo explícitamente **Limpiar** y **Exportar CSV** en Clientes y Vehículos. Mantener etiquetas textuales y nombres accesibles.
- Refinar la disposición y proporciones de botones, controles, paneles, tarjetas, tablas y navegación para lograr una estética clásica y atemporal, conservando los colores y las fuentes actuales.
- Mantener intactos los flujos, permisos, filtros, exportaciones y comportamiento adaptable a pantallas pequeñas.

## Capacidades

### Capacidades nuevas

- `visual-consistency`: establecer un lenguaje visual e iconográfico coherente, accesible y clásico para toda la interfaz.

### Capacidades modificadas

- Ninguna. No se proponen cambios a los requisitos funcionales existentes.

## Impacto

- Interfaz compartida en `src/app/globals.css` y navegación en `src/app/app-sidebar.tsx`.
- Páginas y formularios de Inicio, Clientes, Vehículos, Pedidos, Servicios, Usuarios y acceso.
- Pruebas de interfaz y accesibilidad pertinentes. No se requiere añadir otra biblioteca de iconos: `lucide-react` ya está instalada y se usa en la barra lateral.
