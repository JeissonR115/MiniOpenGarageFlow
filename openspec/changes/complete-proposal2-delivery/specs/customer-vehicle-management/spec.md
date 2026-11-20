# Spec Delta

## ADDED Requirements

### Requirement: Buscar clientes y vehículos

El sistema SHALL permitir localizar clientes por nombre o teléfono y vehículos por placa, marca o cliente propietario.

#### Scenario: Buscar clientes

- **WHEN** el usuario ingresa un término de búsqueda en la lista de clientes
- **THEN** el sistema muestra los clientes cuyos nombres o teléfonos coinciden con el término

#### Scenario: Buscar vehículos

- **WHEN** el usuario ingresa un término de búsqueda en la lista de vehículos
- **THEN** el sistema muestra los vehículos cuya placa, marca o nombre del propietario coincide con el término

### Requirement: Filtrar vehículos por marca y propietario

El sistema SHALL permitir limitar la lista de vehículos a una marca y/o cliente seleccionados.

#### Scenario: Aplicar filtros de vehículos

- **WHEN** el usuario selecciona una marca, un cliente o ambos filtros
- **THEN** el sistema muestra únicamente los vehículos que cumplen todos los filtros activos

### Requirement: Paginar y ordenar las listas

El sistema SHALL permitir paginar y ordenar las listas de clientes y vehículos, conservando el criterio de búsqueda y los filtros activos al cambiar de página u orden.

#### Scenario: Cambiar de página u orden

- **WHEN** el usuario selecciona otra página o un criterio de ordenamiento
- **THEN** el sistema muestra el segmento correspondiente de resultados y mantiene la búsqueda y filtros aplicados

#### Scenario: Resultados vacíos

- **WHEN** la búsqueda o los filtros no encuentran coincidencias
- **THEN** el sistema informa que no hay resultados para los criterios seleccionados

### Requirement: Exportar clientes y vehículos a CSV

El sistema SHALL permitir descargar clientes o vehículos en CSV, incluyendo todos los resultados que coinciden con la búsqueda y filtros actuales, sin limitar la exportación a la página visible.

#### Scenario: Exportar clientes

- **WHEN** el usuario solicita exportar clientes
- **THEN** el sistema descarga un CSV con los clientes que coinciden con la búsqueda actual

#### Scenario: Exportar vehículos filtrados

- **WHEN** el usuario solicita exportar vehículos después de buscar o filtrar
- **THEN** el sistema descarga un CSV con todos los vehículos coincidentes, incluyendo los datos de su propietario

### Requirement: Consultar el detalle de un cliente y sus vehículos

El sistema SHALL ofrecer una vista de cliente que muestre sus datos y todos sus vehículos asociados, e incluya una acción para registrar un vehículo con ese cliente preseleccionado.

#### Scenario: Abrir el detalle del cliente

- **WHEN** el usuario solicita el detalle de un cliente existente
- **THEN** el sistema muestra los datos del cliente y sus vehículos asociados

#### Scenario: Iniciar el registro desde el detalle

- **WHEN** el usuario elige agregar un vehículo desde el detalle de un cliente
- **THEN** el formulario presenta a ese cliente como propietario preseleccionado
