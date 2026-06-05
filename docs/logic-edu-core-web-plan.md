# LogicEdu Web — Plan Técnico / Spec

## 1. Objetivo

Construir el frontend de **LogicEdu** en **Angular 21** como una aplicación web modular, escalable y alineada con el backend existente en Spring Boot.

El frontend debe permitir:

- autenticación mediante JWT,
- navegación segura según roles y scopes,
- consumo ordenado de la API REST existente,
- visualización y operación sobre módulos académicos y administrativos,
- validación rápida del backend mediante flujos reales de usuario.

---

## 2. Alcance funcional inicial

### 2.1 Autenticación y sesión

- Login de usuario.
- Logout.
- Persistencia del JWT en el cliente.
- Rehidratación de sesión al refrescar la página.
- Protección de rutas privadas.
- Redirección por estado de autenticación.

### 2.2 Autorización visual

El frontend debe interpretar la información de `Membership + Role + Scope` para:

- mostrar u ocultar menús,
- habilitar o deshabilitar acciones,
- adaptar dashboards por perfil,
- filtrar rutas por permisos.

### 2.3 Módulos funcionales

Primeras áreas a contemplar:

- Auth
- Users
- Schools
- Branches
- Academic Structure
- Academic Levels
- Academic Periods
- Evaluation Periods
- Subjects
- Groups
- Enrollments
- Assessments
- Attendance
- Grades

El frontend no debe replicar reglas de negocio críticas; esas reglas viven en el backend.

---

## 3. Stack técnico

### 3.1 Framework base

- Angular 21
- TypeScript
- Standalone components
- Routing nativo de Angular
- Angular Signals cuando aporten claridad

### 3.2 Gestión de paquetes

- Preferencia: `bun`
- Compatible con Angular CLI

### 3.3 Estilos y UI

- CSS plano o SCSS, según decisión del equipo
- Angular Material o biblioteca equivalente si se requiere acelerar UI
- Componentes reutilizables en `shared/`

### 3.4 Consumo HTTP

- `HttpClient`
- Interceptor para JWT
- Manejo centralizado de errores

---

## 4. Arquitectura propuesta

El frontend no necesita una hexagonal completa, pero sí una organización clara por responsabilidad.

### 4.1 Estructura recomendada

```text
src/app/
├── core/
│   ├── auth/
│   ├── guards/
│   ├── interceptors/
│   ├── services/
│   └── models/
├── shared/
│   ├── components/
│   ├── directives/
│   ├── pipes/
│   └── models/
├── features/
│   ├── auth/
│   ├── users/
│   ├── schools/
│   ├── branches/
│   ├── academic/
│   ├── groups/
│   ├── enrollments/
│   ├── assessments/
│   ├── attendance/
│   └── grades/
├── app.routes.ts
├── app.config.ts
└── app.component.ts
```

### 4.2 Criterio de organización

- `core/` para piezas globales y únicas.
- `shared/` para componentes y utilidades reutilizables.
- `features/` para cada módulo funcional.

Cada feature debe contener al menos:

- `pages/` o `views/`
- `components/`
- `services/`
- `models/`
- `guards/` si aplica

---

## 5. Principios de diseño

1. **Feature-first**: organizar por funcionalidad, no por tipo de archivo.
2. **Standalones por defecto**: evitar NgModules salvo necesidad real.
3. **Consumo simple de API**: un servicio por feature o por agregado principal.
4. **Estado mínimo en cliente**: guardar solo lo necesario para UI y sesión.
5. **Seguridad real en backend**: el frontend solo refleja permisos; no los reemplaza.
6. **Escalabilidad por módulos**: permitir crecer sin que `app/` se vuelva caótico.

---

## 6. Flujo de autenticación

### 6.1 Login

- El usuario ingresa credenciales.
- El frontend llama `POST /auth/login`.
- El backend responde con JWT y datos de sesión.
- El frontend almacena el token.
- Se extraen memberships/roles/scopes para construir la vista.

### 6.2 Sesión activa

- El interceptor agrega `Authorization: Bearer <token>` a las peticiones.
- Un guard protege las rutas privadas.
- Un servicio de auth expone el usuario actual y sus permisos.

### 6.3 Logout

- Se elimina el token local.
- Se limpia el estado de sesión.
- Se redirige a `/auth/login`.

---

## 7. Autorización en frontend

El frontend debe usar la información de memberships para:

- decidir qué rutas mostrar,
- decidir qué acciones presentar,
- decidir qué panel cargar,
- adaptar componentes por rol.

Ejemplos de uso:

- `PLATFORM_ADMIN` ve administración global.
- `SCHOOL_ADMIN` ve operaciones de su institución.
- `TEACHER` ve grupos, asistencia y calificaciones.
- `STUDENT` ve su información académica.

La autorización real siempre se valida en backend con Spring Security.

---

## 8. Integración con el backend

### 8.1 Base URL

Configurar según entorno:

- local
- testing
- staging
- producción

### 8.2 Endpoints base esperados

- `/auth/login`
- `/auth/me` o equivalente
- `/api/v1/users`
- `/api/v1/schools`
- `/api/v1/branches`
- `/api/v1/academic/*`
- `/api/v1/groups`
- `/api/v1/enrollments`
- `/api/v1/assessments`
- `/api/v1/attendance`
- `/api/v1/grades`

### 8.3 Cliente HTTP

Se recomienda centralizar:

- manejo de headers,
- errores 401/403,
- refresh o relogin si aplica,
- normalización de respuestas.

---

## 9. Estado y datos

### 9.1 Estado global mínimo

Guardar solo:

- token JWT,
- usuario autenticado,
- memberships,
- roles/scopes activos,
- contexto seleccionado si existe.

### 9.2 Estado por feature

Cada módulo puede manejar su propio estado local en el servicio o mediante signals.

### 9.3 Persistencia local

Usar localStorage o sessionStorage solo para lo estrictamente necesario de sesión.

---

## 10. Rutas iniciales

### Públicas

- `/auth/login`
- `/auth/register` si aplica

### Protegidas

- `/dashboard`
- `/users`
- `/schools`
- `/branches`
- `/academic`
- `/groups`
- `/enrollments`
- `/assessments`
- `/attendance`
- `/grades`

La navegación real debe depender del rol y del scope.

---

## 11. Convenciones de código

### 11.1 Nombres

- Componentes: `feature-page.component.ts`
- Servicios: `feature.service.ts`
- Guards: `auth.guard.ts`, `role.guard.ts`
- Interceptors: `auth.interceptor.ts`
- Modelos: `*.model.ts`, `*.dto.ts`

### 11.2 Separación

- DTOs de UI no deben mezclarse con DTOs del backend.
- Los servicios de feature deben mapear la respuesta de API a modelos de uso interno.
- Los componentes no deben conocer detalles de transporte HTTP.

---

## 12. UI/UX inicial

### 12.1 Objetivo visual

- interfaz limpia,
- navegación simple,
- layouts responsivos,
- formularios claros,
- consistencia entre módulos.

### 12.2 Componentes comunes

- navbar,
- sidebar,
- tarjetas,
- tablas,
- formularios,
- diálogos,
- alertas y toasts,
- loaders,
- empty states.

---

## 13. Testing del frontend

Se recomienda cubrir al menos:

- servicios de autenticación,
- interceptor JWT,
- guards,
- componentes de login,
- mapeo de respuestas del backend,
- renderizado de menús por rol.

---

## 14. Orden recomendado de implementación

### Fase 1 — Base
- crear proyecto Angular 21,
- configurar routing,
- configurar estructura `core/shared/features`,
- conectar auth/login,
- interceptor JWT,
- guards básicos.

### Fase 2 — Sesión y navegación
- layout principal,
- navbar/sidebar,
- lectura de memberships,
- menú dinámico por rol.

### Fase 3 — CRUD inicial
- users,
- schools,
- branches,
- academic structure.

### Fase 4 — Núcleo académico
- levels,
- periods,
- evaluation periods,
- subjects,
- groups,
- enrollments.

### Fase 5 — Operación académica
- assessments,
- attendance,
- grades.

---

## 15. Consideraciones importantes

- El frontend no debe asumir permisos; debe consultarlos o leerlos del JWT.
- La lógica crítica de negocio siempre debe permanecer en el backend.
- La estructura debe permitir crecer sin romper el orden de los features.
- Los módulos deben desarrollarse como vertical slices de UI, no como una copia literal de la arquitectura backend.

---

## 16. Decisión base

El frontend de LogicEdu se construirá como una aplicación Angular 21 con enfoque **feature-first**, apoyada en:

- `core/` para infraestructura cliente,
- `shared/` para reutilización,
- `features/` para módulos funcionales,
- JWT para sesión,
- guards e interceptors para seguridad,
- y una navegación adaptada por `Role + Scope + Membership`.
