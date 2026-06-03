# Frontend Execution Plan — LogicEdu Core Web

## Proyecto

LogicEdu Core — Plataforma SaaS de gestión educativa.
Frontend: Angular 21 + Angular Material 3 + Lucide Icons + Vitest + bun.

---

## Objetivo

Desarrollar el frontend incrementalmente, priorizando primero la estabilidad arquitectónica, luego la experiencia de usuario y finalmente los módulos de negocio. Cada fase se ejecuta con SDD ligero: propuesta → specs → diseño → tareas → implementación → verificación → archivo.

---

## Estado Actual

### Backend

- Arquitectura Hexagonal completa
- JWT Authentication con Spring Security
- GlobalExceptionHandler + ErrorResponse estandarizado
- OpenAPI / Swagger documentado (`api-docs.json`)
- Spring Boot + Java 25 LTS + Gradle
- 14 tags documentados: Autenticación, Usuarios, Membresías, Instituciones, Sedes, Estructura Académica, Niveles Académicos, Períodos Académicos, Cortes de Evaluación, Materias, Grupos, Matrículas, Evaluaciones, Asistencia, Calificaciones

### Frontend

| Fase | Estado | Tests | Specs |
|------|--------|-------|-------|
| 0 — Base técnica | ✅ Archivado | 8 | `base-tecnica` |
| 1 — Autenticación | ✅ Archivado | 40 | `user-auth` |
| 1.5 — Error Handling | ✅ Completado | 8 | — |
| 2 — Usuarios y Membresías | ✅ Archivado | 124 | `user-management`, `membership-management` |
| 3 — Instituciones y Sedes | ✅ Archivado | 200 | `school-management`, `branch-management` |

**Total: 200+ tests, 6 specs maestras, modelos alineados con OpenAPI.**

Infraestructura lista:
- `core/interceptors/error.ts` — manejo centralizado de errores SaaS
- `core/interceptors/auth.ts` — inyección de JWT + logout en 401
- `core/guards/auth.ts` — protección de rutas
- `core/services/auth.ts` — AuthService con signals, JWT decode, rehidratación
- `core/constants/error-messages.ts` — mapeo code→mensaje amigable
- `core/models/api-error.ts` — interfaz ErrorResponse del backend
- `app.config.ts` — provideHttpClient con errorInterceptor + authInterceptor

---

## Reglas de Ejecución

Estas reglas aplican a todas las fases. El orchestrator las valida en cada ciclo SDD.

1. **No iniciar una fase sin completar la anterior.** Las dependencias entre fases son estrictas: no se implementa navegación sin auth, ni operación académica sin configuración.

2. **Toda funcionalidad consume contratos OpenAPI.** Modelos, endpoints, payloads y respuestas deben coincidir exactamente con `api-docs.json`. Nunca inventar campos que el backend no expone.

3. **Toda pantalla reutiliza componentes Shared cuando existan.** Si un componente se usa en 2+ features, se mueve a `shared/`. Si solo una feature lo usa, vive dentro de ella. (Regla de Scope: 1 feature → `features/[feature]/components/`, 2+ features → `shared/components/`).

4. **No duplicar lógica de negocio en Angular.** Validaciones de reglas de negocio (unicidad, capacidad, conflictos de horario, restricciones de membresía) viven en el backend. El frontend solo valida formato (email, required, minLength) y muestra errores del backend vía ErrorInterceptor.

5. **Las validaciones críticas permanecen en Backend.** Spring Security + Use Cases son la fuente de verdad. El frontend refleja permisos visualmente pero nunca reemplaza la seguridad real.

### Valoración de las reglas

Son excelentes. Cubren los puntos críticos de una arquitectura frontend-backend bien separada: contrato de API como fuente de verdad, responsabilidad única del backend en reglas de negocio, y reutilización de componentes gobernada por una regla clara (Scope Rule). La regla 1 (secuencialidad) es la más importante para evitar retrabajo y la hemos seguido estrictamente con SDD.

---

# Fases Pendientes

## Fase 4 — Dashboard y Layout Principal

**Objetivo**: Construir el shell de navegación para que los CRUDs ya implementados (usuarios, escuelas, sedes) sean accesibles.

**Por qué ahora**: Tenemos 3 módulos CRUD completos que no se pueden navegar porque el dashboard es un stub. Sin layout, las features construidas no se ven.

**Alcance**:
- Layout principal con sidebar + topbar (Angular Material)
- Sidebar dinámico por rol (lee memberships del usuario)
- Topbar con nombre de usuario, avatar, botón de logout
- Navegación a `/users`, `/schools`, `/dashboard`
- Reemplazar el stub del dashboard por uno real con resumen y accesos rápidos

**Depende de**: Fase 1 (auth), Fase 2 (users/memberships), Fase 3 (schools)

**Entregables**: Shell funcional con navegación por rol.

---

## Fase 5 — Configuración Académica

**Objetivo**: Implementar la parametrización necesaria antes de la operación académica.

**Módulos (basados en OpenAPI)**:
- **Estructura Académica** — `POST/GET /api/v1/schools/{schoolId}/structures`
- **Niveles Académicos** — `POST/GET /api/v1/schools/{schoolId}/levels`
- **Períodos Académicos** — `POST/GET /api/v1/levels/{levelId}/periods`
- **Cortes de Evaluación** — `POST/GET /api/v1/periods/{periodId}/evaluations`
- **Materias** — `POST/GET /api/v1/schools/{schoolId}/subjects`

**Depende de**: Fase 3 (schools), Fase 4 (layout para navegar entre ellos)

**Entregables**: Toda la estructura académica parametrizada y navegable.

---

## Fase 6 — Operación Académica

**Objetivo**: Implementar el núcleo funcional del sistema educativo.

**Módulos (basados en OpenAPI)**:
- **Grupos** — `POST/GET /api/v1/schools/{schoolId}/groups` (con horarios, filtros por sede/período)
- **Matrículas** — `POST /api/v1/enrollments`, `GET /api/v1/groups/{groupId}/enrollments`
- **Evaluaciones** — `POST/GET /api/v1/groups/{groupId}/assessments`
- **Calificaciones** — `POST/GET /api/v1/assessments/{assessmentId}/grades`
- **Asistencia** — `POST/GET /api/v1/groups/{groupId}/attendances`

**Depende de**: Fase 5 (configuración académica completa)

**Entregables**: Operación académica de extremo a extremo.

---

## Fase 7 — Experiencia de Usuario y Optimización

**Objetivo**: Llevar la UI a nivel producción.

**Mejoras**:
- Skeleton loaders en todas las tablas
- Estados vacíos personalizados por módulo
- Notificaciones toast (éxito/error) vía servicio central
- Confirmaciones con diálogos reutilizables
- Responsive completo en todas las pantallas
- Animaciones de transición entre rutas
- Temas claro/oscuro con Angular Material 3

**Depende de**: Fase 6 (todos los módulos funcionales)

---

## Fase 8 — OpenAPI Generator (Automatización)

**Objetivo**: Eliminar la escritura manual de modelos y servicios HTTP.

**Flujo**:
```
api-docs.json → openapi-generator → Angular SDK (models + services)
```

**Depende de**: Backend estable con OpenAPI completo.

**Nota**: Posponer hasta que el backend esté maduro. Hacerlo antes genera fricción con cada cambio de API y perdemos el control fino que tenemos ahora con modelos manuales. Ideal para cuando el catálogo de endpoints esté cerrado.

---

# Criterio de Éxito

El frontend estará listo para producción cuando:

1. La autenticación esté completamente cerrada (login, logout, sesión, recuperación). ✅ Parcial — falta recuperación de contraseña.
2. Exista infraestructura reutilizable (error handling, guards, interceptors, shared components). ✅
3. El Dashboard y la navegación estén funcionales. 🔲
4. La configuración académica esté parametrizada. 🔲
5. La operación académica funcione de extremo a extremo. 🔲
6. Los contratos OpenAPI estén integrados como fuente de verdad. ✅
7. Los módulos de negocio se desarrollen sin modificar la infraestructura base. ✅

---

# Orquestación de Agentes

## Orchestrator

Responsabilidades:
- Validar cada fase contra las reglas de ejecución
- Controlar dependencias entre fases
- Coordinar agentes SDD (propose → spec → design → tasks → apply → verify → archive)
- Aprobar entregables contra specs
- Evitar trabajo fuera de alcance
- Aplicar revision budget (400 líneas) y feature-branch-chain

## Reglas para agentes IA
- Priorizar consistencia sobre creatividad
- No introducir patrones innecesarios en frontend
- No duplicar lógica de backend en Angular
- Usar Angular Material como base visual (customizado, no por defecto)
- Mantener la estructura feature-first (core / shared / features)
- Evitar archivos sueltos sin propósito
- Mantener cambios pequeños y comprobables
- Todo código generado en inglés; UI copy y mensajes de error en español
