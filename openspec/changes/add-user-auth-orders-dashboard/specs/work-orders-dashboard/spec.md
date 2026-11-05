# Spec Delta

## Purpose

Permite al personal del taller registrar y seguir pedidos de trabajo asociados a vehículos, y consultar en Inicio un resumen oportuno de la carga del taller.

## ADDED Requirements

### Requirement: Crear pedidos válidos para vehículos existentes
El sistema SHALL crear un pedido con una descripción no vacía, un vehículo existente y uno de los estados permitidos, asignando automáticamente su fecha de creación.

#### Scenario: Crear pedido válido
- **WHEN** el usuario autenticado envía una descripción válida, un vehículo existente y un estado permitido
- **THEN** el sistema crea el pedido con su fecha de creación y relación al vehículo

#### Scenario: Pedido con descripción o vehículo inválido
- **WHEN** el usuario envía una descripción vacía o selecciona un vehículo inexistente
- **THEN** el sistema rechaza el pedido, informa el error y no guarda datos

### Requirement: Consultar pedidos con vehículo y propietario
El sistema SHALL listar pedidos con sus datos de vehículo y propietario, ordenados por fecha de creación descendente.

#### Scenario: Consultar pedidos existentes
- **WHEN** el usuario solicita el listado de pedidos
- **THEN** el sistema muestra cada pedido con la placa, marca, modelo y propietario de su vehículo

#### Scenario: Listado sin pedidos
- **WHEN** no existen pedidos registrados
- **THEN** el sistema informa que aún no hay pedidos

### Requirement: Actualizar pedidos con datos válidos
El sistema SHALL permitir actualizar la descripción, el vehículo asociado y el estado de un pedido, validando la entrada y preservando sus relaciones y fecha de finalización.

#### Scenario: Actualización válida
- **WHEN** el usuario modifica un pedido con descripción no vacía, vehículo existente y estado permitido
- **THEN** el sistema guarda los cambios y conserva el pedido

#### Scenario: Actualización inválida
- **WHEN** el usuario envía una descripción vacía, un vehículo inexistente o un estado no permitido
- **THEN** el sistema rechaza el cambio e informa el error sin modificar el pedido

### Requirement: Eliminar pedidos
El sistema SHALL permitir eliminar un pedido sin eliminar su vehículo ni su propietario.

#### Scenario: Eliminar pedido existente
- **WHEN** el usuario elimina un pedido registrado
- **THEN** el sistema elimina únicamente el pedido

### Requirement: Preservar pedidos al eliminar un vehículo
El sistema SHALL impedir eliminar un vehículo que tenga pedidos asociados y SHALL conservar el vehículo y sus pedidos.

#### Scenario: Intentar eliminar vehículo con pedidos
- **WHEN** el usuario intenta eliminar un vehículo referenciado por uno o más pedidos
- **THEN** el sistema rechaza la eliminación e informa que primero deben eliminarse o reasignarse los pedidos

### Requirement: Mostrar el dashboard de pedidos
El sistema SHALL mostrar en Inicio los totales de pedidos pendientes, en proceso y terminados hoy, junto con los pedidos pendientes o en proceso más recientes.

#### Scenario: Resumen y pedidos activos
- **WHEN** el usuario autenticado abre Inicio
- **THEN** el sistema muestra los tres totales y una tabla de pedidos activos con cliente, placa, descripción, estado y fecha, ordenada del más reciente al más antiguo

#### Scenario: Contar pedidos terminados hoy
- **WHEN** el dashboard calcula los pedidos terminados hoy
- **THEN** cuenta los pedidos con fecha de finalización dentro del día calendario de Colombia (`America/Bogota`)

#### Scenario: No hay pedidos activos
- **WHEN** no existen pedidos pendientes ni en proceso
- **THEN** el dashboard conserva los totales y muestra un estado vacío en la tabla de pedidos activos

### Requirement: Mantener pedidos sintéticos en el seed repetible
El sistema SHALL incluir pedidos de prueba vinculados a vehículos existentes al ejecutar el seed, y SHALL eliminar primero los pedidos antes de limpiar sus vehículos.

#### Scenario: Reejecutar el seed
- **WHEN** se ejecuta el seed más de una vez
- **THEN** se reemplazan los pedidos, vehículos y clientes de prueba en orden seguro y quedan pedidos válidos asociados a los vehículos creados

### Requirement: Registrar la fecha en que se termina un pedido
El sistema SHALL registrar la fecha y hora de finalización al crear un pedido terminado o cambiar un pedido a terminado, y SHALL borrar esa fecha si el pedido deja de estar terminado.

#### Scenario: Crear un pedido terminado
- **WHEN** el usuario crea un pedido con estado `terminado`
- **THEN** el sistema asigna automáticamente su fecha de finalización

#### Scenario: Cambiar un pedido a terminado
- **WHEN** el usuario cambia un pedido de otro estado a `terminado`
- **THEN** el sistema registra la fecha y hora actuales como fecha de finalización

#### Scenario: Reactivar un pedido terminado
- **WHEN** el usuario cambia un pedido terminado a `pendiente` o `en_proceso`
- **THEN** el sistema borra su fecha de finalización
