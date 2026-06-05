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

### R1 — Secuencialidad con criterio

**No implementar una fase sin completar la anterior.** Las dependencias entre fases son estrictas: no se construye navegación sin auth, ni operación académica sin configuración.

**Flexibilidad**: la planificación (spec/design) de la siguiente fase puede comenzar en paralelo al apply/verify de la actual. Planificación ≠ implementación. Esto evita cuellos de botella sin romper la secuencialidad.

### R2 — OpenAPI como fuente de verdad (LA MÁS IMPORTANTE)

**Modelos, endpoints, payloads y respuestas deben coincidir exactamente con `api-docs.json`.** Nunca inventar campos que el backend no expone. Nunca asumir endpoints planos si el spec dice anidados. Cada divergencia se paga en verify con CRITICAL issues.

**Lección aprendida**: branches con URLs planas, memberships con `scope` inventado, password con POST en vez de PATCH — todo corregido en el alineamiento de API. No repetir.

### R3 — Scope Rule para reutilización

**1 feature → `features/[feature]/components/`. 2+ features → `shared/components/`.**

Hoy `shared/` está vacío. Cuando construyamos Dashboard van a emerger patrones repetidos (tablas, diálogos de confirmación, chips de status). En ese momento la regla se activa: si el mismo componente se necesita en 2 features distintas, se promueve a `shared/`. Hasta entonces, cada feature mantiene sus componentes locales.

### R4 — Separación frontend/backend en reglas de negocio

**Frontend**: solo validaciones de formato (required, email, minLength).  
**Backend**: reglas de negocio (unicidad, capacidad, conflictos de horario, restricciones de membresía, integridad de datos).

El ErrorInterceptor es el mecanismo para esta separación: el backend rechaza con código HTTP + mensaje, el interceptor lo traduce, el componente lo muestra. El frontend nunca implementa lógica del tipo "no se puede matricular si el grupo está lleno" — eso lo decide el backend.

### R5 — Seguridad real en backend, reflejo visual en frontend

Spring Security + Use Cases son la fuente de verdad para autorización. El frontend puede ocultar botones, deshabilitar acciones y filtrar rutas según el rol del usuario, pero **nunca** reemplaza la validación del backend. Si el frontend muestra un botón que el backend rechaza, el ErrorInterceptor maneja el 403 y el usuario ve "No tienes permisos".

### Por qué estas reglas

| Regla | Previene |
|-------|----------|
| R1 | Integración caótica, fases a medio terminar |
| R2 | Retrabajo masivo por divergencia API (ya lo vivimos) |
| R3 | Duplicación de componentes, inconsistencia visual |
| R4 | Frontend gordo con lógica de negocio duplicada |
| R5 | Falsa sensación de seguridad — el frontend es maquillaje, no candado |

---

# Fases Pendientes

## Fase 4 — Dashboard y Layout Principal

**Depende de** /logic-edu-core-web/docs/UI/dashboard/dashboard-admin-spec.md, dashboard-school-spec.md, teacher-dashboard-spec.md

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
