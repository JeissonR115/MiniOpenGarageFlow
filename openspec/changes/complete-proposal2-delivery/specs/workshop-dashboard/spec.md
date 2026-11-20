# Spec Delta

## Purpose

Ofrece una vista del estado general del taller mediante indicadores y gráficos de clientes y vehículos, complementando el resumen de pedidos existente.

## ADDED Requirements

### Requirement: Registrar la fecha de alta de vehículos

El sistema SHALL conservar la fecha de registro de cada vehículo para determinar el registro más reciente del taller. La migración SHALL asignar su fecha de aplicación a los vehículos existentes cuya fecha histórica no está disponible.

#### Scenario: Registrar un vehículo nuevo

- **WHEN** se crea un vehículo
- **THEN** el sistema guarda automáticamente su fecha de registro

#### Scenario: Migrar vehículos existentes

- **WHEN** se aplica la migración a una base que ya contiene vehículos
- **THEN** cada vehículo conserva sus datos y recibe la fecha de aplicación de la migración como fecha de registro

### Requirement: Mostrar métricas de clientes y vehículos

El sistema SHALL mostrar el total de clientes, el total de vehículos y la fecha y tipo del último registro de cliente o vehículo.

#### Scenario: Dashboard con registros

- **WHEN** el usuario autenticado abre el dashboard con clientes o vehículos registrados
- **THEN** el sistema muestra ambos totales y el tipo y fecha del registro más reciente

#### Scenario: Dashboard sin registros

- **WHEN** el usuario autenticado abre el dashboard sin clientes ni vehículos
- **THEN** el sistema muestra totales en cero y un estado vacío para el último registro

### Requirement: Mostrar vehículos agrupados por marca

El sistema SHALL mostrar un gráfico con la cantidad de vehículos registrados para cada marca.

#### Scenario: Distribución de vehículos por marca

- **WHEN** el dashboard incluye vehículos de una o más marcas
- **THEN** el gráfico muestra una categoría por marca con su cantidad de vehículos

#### Scenario: No hay vehículos para graficar

- **WHEN** no hay vehículos registrados
- **THEN** el dashboard presenta un estado vacío en el gráfico de marcas

### Requirement: Mostrar clientes registrados por mes

El sistema SHALL mostrar un gráfico de la cantidad de clientes registrados por mes calendario.

#### Scenario: Actividad mensual de clientes

- **WHEN** existen clientes con fechas de registro en distintos meses
- **THEN** el gráfico muestra el conteo correspondiente a cada mes calendario

#### Scenario: No hay clientes para graficar

- **WHEN** no hay clientes registrados
- **THEN** el dashboard presenta un estado vacío en el gráfico mensual
