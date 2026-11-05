# Spec Delta

## Purpose

Permite al administrador del taller acceder a OpenGarageFlow de forma autenticada, manteniendo las credenciales protegidas y restringiendo las funciones internas a una sesión válida.

## ADDED Requirements

### Requirement: Mantener usuarios administradores sin registro público
El sistema SHALL almacenar usuarios con nombre, correo único, hash de contraseña y fecha de registro, y SHALL permitir crear o actualizar el administrador inicial mediante variables de entorno sin ofrecer registro público.

#### Scenario: Crear o actualizar el administrador configurado
- **WHEN** se ejecuta el seed con `ADMIN_EMAIL` y `ADMIN_PASSWORD` configurados
- **THEN** el sistema crea o actualiza ese usuario, guarda únicamente el hash de la contraseña y conserva el correo único

#### Scenario: Configuración de administrador incompleta
- **WHEN** falta el correo o la contraseña requeridos para el seed
- **THEN** el seed termina con un error explícito y no crea un usuario con credenciales predeterminadas

#### Scenario: No hay registro público
- **WHEN** una persona no autenticada intenta registrarse como usuario
- **THEN** el sistema no ofrece una ruta pública para crear una cuenta

### Requirement: Iniciar sesión con credenciales válidas
El sistema SHALL autenticar por correo y contraseña, y SHALL crear una sesión firmada en una cookie protegida únicamente cuando las credenciales coincidan.

#### Scenario: Inicio de sesión válido
- **WHEN** el usuario envía el correo y la contraseña de una cuenta válida
- **THEN** el sistema crea una cookie de sesión firmada, httpOnly, SameSite=Lax y con Secure en producción, y redirige al dashboard

#### Scenario: Credenciales inválidas
- **WHEN** el usuario envía un correo inexistente o una contraseña incorrecta
- **THEN** el sistema rechaza el acceso con un mensaje genérico y no crea una sesión

#### Scenario: Datos de inicio de sesión inválidos
- **WHEN** el correo o la contraseña no cumplen la validación requerida
- **THEN** el sistema rechaza la solicitud sin iniciar sesión

### Requirement: Proteger las rutas internas con la sesión
El sistema SHALL requerir una sesión vigente para acceder a las rutas de la aplicación distintas de `/login`.

#### Scenario: Acceso a una ruta interna sin sesión
- **WHEN** un visitante sin una sesión válida solicita una ruta interna
- **THEN** el sistema lo redirige a `/login`

#### Scenario: Acceso a una ruta interna con sesión válida
- **WHEN** un usuario autenticado solicita una ruta interna
- **THEN** el sistema permite la solicitud y muestra la página solicitada

#### Scenario: Sesión ausente, inválida o vencida
- **WHEN** el visitante presenta una cookie de sesión inválida o vencida
- **THEN** el sistema no concede acceso y lo redirige a `/login`

### Requirement: Cerrar la sesión autenticada
El sistema SHALL permitir que el usuario cierre su sesión y eliminar la cookie de sesión al hacerlo.

#### Scenario: Cierre de sesión
- **WHEN** un usuario autenticado activa la opción de cerrar sesión
- **THEN** el sistema elimina la cookie y lo redirige a `/login`

#### Scenario: Solicitud posterior al cierre de sesión
- **WHEN** el usuario solicita una ruta interna después de cerrar sesión
- **THEN** el sistema lo redirige a `/login`
