# Spec Delta

## Purpose

Define una presentación coherente, accesible y clásica para todas las pantallas de OpenGarageFlow, sin alterar su paleta, tipografía ni comportamiento funcional.

## ADDED Requirements

### Requirement: Iconografía consistente para navegación y acciones

La interfaz SHALL acompañar la navegación y las acciones con iconos reconocibles y consistentes, incluidos Limpiar y Exportar CSV en las listas de Clientes y Vehículos. Los iconos SHALL complementar las etiquetas textuales; todo control sin etiqueta visible SHALL conservar un nombre accesible.

#### Scenario: Acciones de Clientes y Vehículos

- **WHEN** una persona consulta los filtros de Clientes o Vehículos
- **THEN** puede reconocer Limpiar y Exportar CSV por sus iconos y etiquetas, y ambas acciones conservan su funcionamiento actual

#### Scenario: Controles con icono sin texto visible

- **WHEN** un control presenta un icono sin etiqueta textual visible
- **THEN** el control expone un nombre accesible que identifica su propósito

### Requirement: Estética clásica con paleta y tipografía preservadas

La aplicación SHALL mantener su paleta de colores y familias tipográficas actuales mientras presenta botones, controles, paneles, tarjetas, tablas y navegación con proporciones, alineación y detalles visuales coherentes con una estética clásica y atemporal.

#### Scenario: Presentación coherente en las pantallas

- **WHEN** una persona navega por Inicio, Clientes, Vehículos, Pedidos, Servicios, Usuarios o Acceso
- **THEN** encuentra una composición visual coherente, sin cambios en los colores ni en las fuentes de la aplicación

### Requirement: Consistencia sin regresiones de uso

Los cambios visuales SHALL conservar la adaptación a pantallas pequeñas, la legibilidad de las etiquetas y el acceso por teclado a las acciones existentes, sin alterar permisos ni resultados funcionales.

#### Scenario: Uso de acciones en móvil y teclado

- **WHEN** una persona navega en una pantalla pequeña o accede a las acciones mediante el teclado
- **THEN** los controles permanecen utilizables y mantienen las mismas etiquetas, permisos y resultados que antes del cambio
