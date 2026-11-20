# Spec Delta

## Purpose

Restringe las operaciones del taller según el rol autenticado y permite al administrador habilitar cuentas de Recepción sin ofrecer registro público.

## ADDED Requirements

### Requirement: Crear cuentas de Recepción de forma administrativa

El sistema SHALL permitir que un administrador cree una cuenta de Recepción con credenciales válidas y SHALL impedir el registro público de usuarios.

#### Scenario: Crear una cuenta de Recepción

- **WHEN** un administrador envía los datos válidos de una cuenta nueva
- **THEN** el sistema crea la cuenta con el rol Recepción y permite iniciar sesión con sus credenciales

#### Scenario: Rechazar creación no autorizada o duplicada

- **WHEN** una persona sin rol Administrador intenta crear una cuenta o se usa un correo ya registrado
- **THEN** el sistema rechaza la operación y no crea ni modifica cuentas

### Requirement: Aplicar permisos por rol a las operaciones del taller

El sistema SHALL permitir al Administrador todas las operaciones y a Recepción crear y consultar clientes, vehículos y servicios, sin editar ni eliminar registros.

#### Scenario: Recepción consulta y crea registros

- **WHEN** un usuario de Recepción consulta o crea un cliente, vehículo o servicio con datos válidos
- **THEN** el sistema permite la operación

#### Scenario: Recepción intenta editar o eliminar

- **WHEN** un usuario de Recepción intenta editar o eliminar un cliente, vehículo o servicio
- **THEN** el sistema rechaza la operación y conserva los datos

#### Scenario: Administrador realiza una operación completa

- **WHEN** un administrador crea, consulta, actualiza o elimina un registro permitido
- **THEN** el sistema permite la operación

### Requirement: Validar permisos al ejecutar cada operación protegida

El sistema SHALL verificar la sesión y el rol al procesar cada operación protegida, incluso si se invoca sin usar los controles visibles de la interfaz.

#### Scenario: Invocar directamente una operación restringida

- **WHEN** una persona de Recepción envía directamente una solicitud de edición o eliminación
- **THEN** el sistema la rechaza sin modificar datos

#### Scenario: Operar sin una sesión válida

- **WHEN** una persona no autenticada intenta acceder a una función interna
- **THEN** el sistema deniega el acceso y la dirige al inicio de sesión

### Requirement: Permitir a Recepción consultar el dashboard completo

El sistema SHALL permitir a los usuarios de Recepción autenticados consultar el dashboard completo del taller.

#### Scenario: Recepción abre el dashboard

- **WHEN** un usuario de Recepción autenticado solicita el dashboard
- **THEN** el sistema muestra las métricas y visualizaciones disponibles para el Administrador
