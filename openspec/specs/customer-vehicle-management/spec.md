# customer-vehicle-management Specification

## Purpose

Permite al personal del taller mantener información confiable de clientes y vehículos, conservando la relación de propiedad y validando los datos antes de guardarlos.

## Requirements

### Requirement: Registrar clientes con datos válidos
El sistema SHALL registrar un cliente con nombre, apellido y teléfono obligatorios, correo opcional con formato válido cuando se proporciona, y fecha de registro asignada automáticamente.

#### Scenario: Registro de cliente válido
- **WHEN** el personal envía nombre, apellido y teléfono válidos, con o sin correo válido
- **THEN** el sistema crea el cliente y asigna la fecha de registro automáticamente

#### Scenario: Falta un campo obligatorio o el correo tiene formato inválido
- **WHEN** el personal intenta registrar un cliente sin nombre, apellido o teléfono, o proporciona un correo mal formado
- **THEN** el sistema rechaza el registro e informa los campos inválidos

### Requirement: Consultar y actualizar clientes
El sistema SHALL permitir consultar los clientes registrados y actualizar sus datos manteniendo las mismas reglas de validación del registro.

#### Scenario: Consultar clientes registrados
- **WHEN** el personal solicita la lista de clientes
- **THEN** el sistema devuelve los clientes registrados con sus datos

#### Scenario: Actualización con datos inválidos
- **WHEN** el personal actualiza un cliente y omite un campo obligatorio o proporciona un correo mal formado
- **THEN** el sistema rechaza el cambio e informa los campos inválidos sin guardar la actualización

### Requirement: Eliminar clientes sin vehículos asociados
El sistema SHALL permitir eliminar clientes que no tengan vehículos asociados y SHALL impedir eliminar un cliente que todavía tenga vehículos.

#### Scenario: Eliminar cliente sin vehículos
- **WHEN** el personal elimina un cliente que no tiene vehículos asociados
- **THEN** el sistema elimina el cliente

#### Scenario: Eliminar cliente con vehículos asociados
- **WHEN** el personal intenta eliminar un cliente que tiene uno o más vehículos asociados
- **THEN** el sistema impide la eliminación y conserva el cliente y sus vehículos

### Requirement: Registrar vehículos de un cliente existente
El sistema SHALL registrar vehículos con placa, marca y modelo obligatorios, asociados a un cliente existente, y SHALL rechazar placas duplicadas.

#### Scenario: Registro de vehículo con propietario existente
- **WHEN** el personal envía placa, marca, modelo y el identificador de un cliente existente, con los campos opcionales válidos si se proporcionan
- **THEN** el sistema crea el vehículo asociado a ese cliente

#### Scenario: Cliente inexistente o placa repetida
- **WHEN** el personal intenta registrar un vehículo para un cliente inexistente o con una placa ya registrada
- **THEN** el sistema rechaza el registro e informa el conflicto correspondiente

#### Scenario: Falta un campo obligatorio o el año no es válido
- **WHEN** el personal registra un vehículo sin placa, marca o modelo, o proporciona un año fuera del rango válido
- **THEN** el sistema rechaza el registro e informa los campos inválidos

### Requirement: Consultar y actualizar vehículos
El sistema SHALL permitir consultar vehículos mostrando los datos del vehículo y el nombre de su propietario, y actualizar sus datos sin permitir placas duplicadas ni asociaciones con clientes inexistentes.

#### Scenario: Consultar vehículos con propietario
- **WHEN** el personal solicita los vehículos registrados
- **THEN** el sistema devuelve cada vehículo junto con el nombre de su propietario

#### Scenario: Actualizar vehículo manteniendo una placa única
- **WHEN** el personal actualiza un vehículo con datos válidos y una placa no usada por otro vehículo
- **THEN** el sistema guarda la actualización y mantiene la asociación con un cliente existente

#### Scenario: Actualización en conflicto
- **WHEN** el personal actualiza un vehículo con una placa perteneciente a otro vehículo, un cliente inexistente o datos inválidos
- **THEN** el sistema rechaza el cambio e informa el conflicto o los campos inválidos sin guardar la actualización

### Requirement: Eliminar vehículos
El sistema SHALL permitir eliminar un vehículo registrado sin eliminar a su cliente propietario.

#### Scenario: Eliminar vehículo
- **WHEN** el personal elimina un vehículo registrado
- **THEN** el sistema elimina el vehículo y conserva su cliente propietario
