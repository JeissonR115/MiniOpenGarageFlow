# Spec Delta

## Purpose

Permite ejecutar OpenGarageFlow en contenedor con estado de salud verificable, migraciones automáticas y persistencia de la base SQLite.

## ADDED Requirements

### Requirement: Exponer el estado de salud de la aplicación

El sistema SHALL exponer `GET /api/health` sin requerir autenticación y responder con estado saludable solo cuando la aplicación y su base de datos estén disponibles.

#### Scenario: Aplicación y base de datos disponibles

- **WHEN** un contenedor consulta `/api/health` con la aplicación y la base de datos listas
- **THEN** el endpoint responde con éxito y señala que la instancia está saludable

#### Scenario: Base de datos no disponible

- **WHEN** un contenedor consulta `/api/health` y la base de datos no está disponible
- **THEN** el endpoint responde con estado no exitoso para que la instancia no se considere saludable

### Requirement: Ejecutar la aplicación mediante Docker Compose

El sistema SHALL permitir iniciar la aplicación con Docker Compose usando la configuración requerida y un volumen persistente para el archivo SQLite.

#### Scenario: Iniciar el servicio

- **WHEN** el usuario ejecuta `docker compose up` con las variables requeridas
- **THEN** Compose construye e inicia la aplicación y publica el servicio en el puerto documentado

#### Scenario: Conservar datos tras reiniciar

- **WHEN** el contenedor se reinicia o recrea usando el volumen configurado
- **THEN** los datos SQLite previamente guardados permanecen disponibles

### Requirement: Aplicar migraciones antes de servir solicitudes

El sistema SHALL aplicar las migraciones pendientes antes de iniciar la aplicación y SHALL exponer su salud como correcta solo después de que la aplicación y la base estén listas.

#### Scenario: Arranque con migraciones pendientes

- **WHEN** se inicia un contenedor con una base persistida que requiere migraciones
- **THEN** las migraciones se aplican antes de aceptar solicitudes y el contenedor pasa a saludable al completar el arranque

#### Scenario: Arranque con migraciones fallidas

- **WHEN** una migración no puede aplicarse
- **THEN** el contenedor no informa estado saludable ni inicia la aplicación como si el arranque hubiera sido exitoso
