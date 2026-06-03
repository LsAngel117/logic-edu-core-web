# Frontend Execution Plan

## Proyecto

LogiEdu Core

---

# Objetivo

Desarrollar el frontend de manera incremental, priorizando primero la estabilidad arquitectónica, luego la experiencia de usuario y finalmente los módulos de negocio.

El objetivo es minimizar retrabajo, garantizar mantenibilidad y permitir que Angular evolucione alineado con el contrato OpenAPI definido por el backend.

---

# Estado Actual

## Backend

Completado:

* Arquitectura Hexagonal
* Use Cases estandarizados
* JWT Authentication
* GlobalExceptionHandler
* ErrorResponse estandarizado
* OpenAPI / Swagger documentado
* Spring Boot 4
* Java 25 LTS
* Gradle

## Frontend

Actual:

* Angular 21
* Login implementado
* Consumo inicial de APIs
* Base de diseño definida

---

# Fase 1 - Completar Autenticación

## Objetivo

Finalizar todo el ciclo de autenticación antes de construir funcionalidades de negocio.

## Alcance

### Login

* Validación de credenciales
* Persistencia de sesión
* Redirección automática

### Logout

* Eliminación de tokens
* Limpieza de sesión

### Recuperación de Contraseña

#### Solicitud de recuperación

* Formulario
* Consumo de API
* Confirmación al usuario

#### Restablecimiento

* Validación de token
* Cambio de contraseña

### Seguridad

* Guards
* Interceptor JWT
* Manejo de expiración de sesión

## Entregables

* Flujo completo de autenticación
* Rutas protegidas
* Sesión persistente

---

# Fase 2 - Infraestructura Frontend

## Objetivo

Construir la base técnica reutilizable para toda la aplicación.

## Core

core/
├── auth/
├── guards/
├── interceptors/
├── services/
├── state/
├── models/
└── layouts/

## Shared

shared/
├── ui/
├── forms/
├── tables/
├── dialogs/
└── pipes/

## Manejo de Errores

Consumir ErrorResponse del backend.

Ejemplo:

{
"status": 404,
"code": "USER_NOT_FOUND",
"message": "Usuario no encontrado"
}

## Entregables

* Infraestructura reutilizable
* Manejo centralizado de errores
* Componentes compartidos

---

# Fase 3 - Dashboard Base

## Objetivo

Construir la estructura principal de navegación.

## Alcance

### Layout Principal

* Sidebar
* Topbar
* Perfil usuario
* Menú de sesión

### Dashboard Home

* Bienvenida
* Accesos rápidos
* Información del usuario

## Entregables

* Shell principal de la aplicación
* Navegación funcional

---

# Fase 4 - Configuración Académica

## Objetivo

Implementar la parametrización necesaria antes de la operación académica.

## Módulos

### Instituciones Educativas

* Listar
* Crear
* Editar
* Consultar

### Sedes

* Gestión de sedes
* Asociación a institución

### Niveles Académicos

* Preescolar
* Básica
* Media
* Otros

### Grados

* Crear grados
* Configuración

### Jornadas

* Mañana
* Tarde
* Nocturna
* Personalizadas

### Periodos Académicos

* Apertura
* Configuración
* Cierre

### Grupos

* Creación
* Asignación

## Entregables

Toda la estructura académica parametrizada.

---

# Fase 5 - Operación Académica

## Objetivo

Implementar el núcleo funcional del sistema educativo.

## Módulos

### Estudiantes

* Registro
* Consulta
* Actualización
* Estado

### Matrículas

* Nueva matrícula
* Renovación
* Traslado
* Cancelación

### Asignación Académica

* Estudiante → Grupo
* Estudiante → Grado
* Estudiante → Periodo

### Historial Académico

* Seguimiento
* Consulta histórica

### Gestión de Cupos

* Disponibilidad
* Control por grupo

## Entregables

Operación académica completamente funcional.

---

# Fase 6 - Administración de Usuarios

## Objetivo

Gestionar acceso y operación administrativa.

## Módulos

### Usuarios

* CRUD
* Activación
* Desactivación

### Roles

* Gestión de roles

### Permisos

* Gestión de permisos

### Auditoría

* Acciones del usuario
* Trazabilidad

## Entregables

Administración completa de usuarios.

---

# Fase 7 - Membresías y Comercial

## Objetivo

Gestionar el modelo SaaS de la plataforma.

## Módulos

### Planes

* Crear
* Editar
* Consultar

### Membresías

* Asignación
* Renovación
* Suspensión

### Suscripciones

* Estado
* Vigencia

### Facturación (Futuro)

* Integraciones de pago

## Entregables

Modelo SaaS operativo.

---

# Fase 8 - Integración OpenAPI

## Objetivo

Reducir mantenimiento manual mediante generación automática.

## Flujo

Backend
↓
OpenAPI
↓
SDK Generado
↓
Angular

## Actividades

* Evaluar OpenAPI Generator
* Generar modelos
* Generar clientes HTTP
* Integrar SDK

## Entregables

SDK Angular generado automáticamente.

---

# Fase 9 - UX y Optimización

## Objetivo

Mejorar experiencia de usuario.

## Mejoras

* Skeleton Loaders
* Estados vacíos
* Confirmaciones
* Notificaciones
* Responsive
* Accesibilidad

## Entregables

Experiencia de usuario de nivel producción.

---

# Orquestación de Agentes

## Orchestrator

Responsabilidades:

* Validar cada fase
* Controlar dependencias
* Coordinar agentes
* Aprobar entregables
* Evitar trabajo fuera de alcance

## Reglas de Ejecución

- No iniciar una fase sin completar la anterior.
- Toda funcionalidad debe consumir contratos OpenAPI.
- Toda pantalla debe reutilizar componentes Shared cuando existan.
- No duplicar lógica de negocio en Angular.
- Las validaciones críticas deben permanecer en Backend.

# Criterio de Éxito

El frontend estará listo para crecimiento sostenido cuando:

* La autenticación esté completamente cerrada.
* Exista infraestructura reutilizable.
* El Dashboard sea estable.
* La configuración académica esté parametrizada.
* La operación académica funcione de extremo a extremo.
* Los contratos OpenAPI estén integrados.
* Los módulos de negocio se desarrollen sin modificar la infraestructura base.
