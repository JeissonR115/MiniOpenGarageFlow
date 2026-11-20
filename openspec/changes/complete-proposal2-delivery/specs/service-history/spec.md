# Spec Delta

## Purpose

Permite registrar y consultar los servicios realizados a cada vehículo, conservando un historial cronológico con su fecha, descripción y costo.

## ADDED Requirements

### Requirement: Registrar servicios válidos para un vehículo

El sistema SHALL registrar un servicio asociado a un vehículo existente con fecha, descripción no vacía y costo igual o mayor que cero.

#### Scenario: Registrar un servicio válido

- **WHEN** se envían fecha, descripción, costo no negativo y un vehículo existente
- **THEN** el sistema guarda el servicio asociado al vehículo

#### Scenario: Rechazar datos inválidos

- **WHEN** falta la fecha o descripción, el costo es negativo o el vehículo no existe
- **THEN** el sistema informa el error y no guarda el servicio

### Requirement: Consultar el historial de un vehículo

El sistema SHALL mostrar los servicios de un vehículo en orden cronológico descendente, con fecha, descripción y costo.

#### Scenario: Consultar servicios registrados

- **WHEN** el usuario consulta el historial de un vehículo existente
- **THEN** el sistema muestra sus servicios del más reciente al más antiguo con sus datos completos

#### Scenario: Consultar un historial vacío

- **WHEN** el usuario consulta un vehículo sin servicios registrados
- **THEN** el sistema informa que aún no hay servicios para ese vehículo

### Requirement: Actualizar y eliminar servicios

El sistema SHALL permitir que un administrador actualice o elimine un servicio existente sin alterar el vehículo asociado.

#### Scenario: Actualizar un servicio

- **WHEN** un administrador guarda cambios con fecha, descripción no vacía y costo no negativo
- **THEN** el sistema actualiza el servicio y conserva su relación con el vehículo seleccionado

#### Scenario: Eliminar un servicio

- **WHEN** un administrador elimina un servicio existente
- **THEN** el sistema elimina solo el servicio y conserva el vehículo

### Requirement: Preservar vehículos con servicios asociados

El sistema SHALL impedir eliminar un vehículo que tenga servicios asociados y conservar el vehículo y su historial.

#### Scenario: Intentar eliminar un vehículo con historial

- **WHEN** se intenta eliminar un vehículo que tiene uno o más servicios
- **THEN** el sistema rechaza la operación e informa que primero deben eliminarse sus servicios
