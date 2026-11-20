# Tasks

## 1. Iconografía de la aplicación

- [x] 1.1 Extender el uso de Lucide a las acciones visibles de acceso, clientes, vehículos, pedidos, servicios y usuarios, conservando etiquetas, permisos, estados y nombres accesibles; comprobar la cobertura en las pantallas de esos flujos.
- [x] 1.2 Añadir iconos a Aplicar, Limpiar y Exportar CSV en Clientes y Vehículos, sin alterar sus URLs ni resultados; ampliar Playwright para verificar etiquetas, iconos, restablecimiento de filtros y enlaces CSV.

## 2. Presentación clásica y atemporal

- [x] 2.1 Refinar proporciones, alineación, espaciado, bordes, radios y sombras de botones, formularios, paneles, tarjetas, tablas y navegación en `src/app/globals.css`, manteniendo sin cambios las familias tipográficas y los valores de color actuales; verificar los estilos calculados de los controles principales.
- [x] 2.2 Revisar la interfaz en escritorio y móvil, incluidos navegación, paneles y formularios; comprobar en Playwright que no se pierden etiquetas, foco de teclado, estados ni acciones y que no aparece desbordamiento horizontal.

## 3. Verificación integrada

- [x] 3.1 Ejecutar `npm run verify`, `npm run e2e` y `npm run build`; confirmar que los flujos existentes, permisos por rol, filtros y exportaciones siguen funcionando.
