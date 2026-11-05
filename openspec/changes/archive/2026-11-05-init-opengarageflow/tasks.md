# Tasks

## 1. Fundamentos del proyecto

- [ ] 1.1 Crear la aplicación Next.js con App Router, TypeScript, ESLint y scripts de desarrollo/build; verificar `npm run lint` y `npm run build` en el scaffold. Commit: `chore: scaffold Next.js TypeScript app`
- [ ] 1.2 Añadir `.gitignore`, `.env.example` y `.env` local con `DATABASE_URL` sin credenciales; documentar instalación y ejecución local en el README. Verificar que `.env` coincide con la regla de exclusión y que la plantilla permite configurar la aplicación desde cero. Commit: `chore: configure local environment files`
- [ ] 1.3 Definir modelos Prisma `Cliente` y `Vehiculo`, relación obligatoria, unicidad de placa y migración inicial SQLite. Verificar con `npx prisma validate` y aplicar la migración en una base local vacía. Commit: `feat(db): add client and vehicle models`

## 2. Gestión de clientes

- [ ] 2.1 Crear esquemas Zod de cliente para creación y actualización, con nombre, apellido y teléfono obligatorios y correo opcional válido; añadir pruebas de casos válidos e inválidos y verificar con el comando de pruebas. Commit: `feat(validation): validate customer input with zod`
- [ ] 2.2 Implementar alta, consulta, actualización y eliminación de clientes mediante páginas/formularios y acciones de servidor; impedir borrar clientes con vehículos y mostrar errores de validación. Verificar el flujo CRUD y el rechazo de eliminación con vehículo asociado mediante pruebas. Commit: `feat(customers): implement customer CRUD`

## 3. Gestión de vehículos

- [ ] 3.1 Crear esquemas Zod de vehículo y pruebas para campos obligatorios, año entre 1886 y el año actual más uno, placa normalizada y cliente requerido; verificar con el comando de pruebas. Commit: `feat(validation): validate vehicle input with zod`
- [ ] 3.2 Implementar alta, consulta, actualización y eliminación de vehículos asociados a clientes existentes; normalizar la placa, manejar duplicados y mostrar el nombre del propietario. Verificar varios clientes, más de un vehículo para un mismo cliente, asociaciones inválidas y placa repetida con pruebas. Commit: `feat(vehicles): implement vehicle CRUD`

## 4. Contenedorización y automatización

- [ ] 4.1 Crear un Dockerfile multi-stage para instalar dependencias, generar Prisma, compilar y ejecutar Next.js; documentar la ruta y el volumen persistente de SQLite. Verificar con `docker build` y una ejecución local usando un volumen. Commit: `build: add multi-stage Dockerfile`
- [ ] 4.2 Crear `.github/workflows/ci.yml` para instalar dependencias reproduciblemente y ejecutar lint y build en cambios relevantes. Verificar que el workflow contiene ambos pasos y que los comandos pasan localmente. Commit: `ci: add lint and build workflow`
- [ ] 4.3 Crear `.github/workflows/docker.yml` para construir la imagen en eventos de integración definidos, sin publicar en un registry. Verificar la configuración del workflow y que su comando de build genera la imagen correctamente. Commit: `ci: add Docker image build workflow`

## 5. Verificación integrada

- [ ] 5.1 Ejecutar el flujo integrado de clientes y vehículos con varios registros, comprobar validaciones, relación y restricción de borrado; ejecutar lint, pruebas, build y build de Docker, y corregir cualquier regresión. Commit: `test: verify customer and vehicle workflows`
