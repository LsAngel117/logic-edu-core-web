# Navigation Architecture

## Objetivo

Definir la arquitectura de navegación oficial de LogicEdu Core.

Esta decisión separa claramente los contextos de administración de plataforma (SaaS) y operación académica (ERP educativo), permitiendo una experiencia de usuario más limpia, escalable y alineada con el modelo de permisos RBAC.

---

# Decisión Arquitectónica

LogicEdu Core manejará dos contextos funcionales completamente distintos:

1. Administración de Plataforma (Platform Context)
2. Operación Académica (Academic Context)

Cada contexto utilizará un layout diferente y una navegación adaptada a las responsabilidades reales del usuario.

---

# Contexto 1 — Platform Administration

## Roles

* Platform Admin
* Super Admin

## Responsabilidad

Administrar la plataforma LogicEdu como producto SaaS.

No participa en la operación académica diaria.

Gestiona:

* Instituciones
* Sedes
* Usuarios globales
* Roles
* Membresías
* Suscripciones
* Configuración global
* Auditoría
* Integraciones
* Monitoreo

---

## Patrón de Navegación

### Navegación Híbrida

Compuesta por:

* Navbar superior
* Sidebar contextual

---

### Navbar Superior

Agrupa las grandes áreas funcionales.

Ejemplo:

Dashboard
Configuraciones
Herramientas
Reportes
Administración

---

### Sidebar Contextual

El contenido cambia según la sección seleccionada en la navbar superior.

Ejemplo:

Configuraciones

* Instituciones
* Sedes
* Usuarios
* Roles
* Membresías
* Parámetros Globales
* Integraciones

---

Ejemplo:

Reportes

* Actividad
* Instituciones
* Usuarios
* Auditoría
* Suscripciones

---

## Justificación

La administración de plataforma contiene muchos módulos independientes.

Un único sidebar crecería excesivamente y generaría ruido visual.

La navegación híbrida permite:

* Mejor organización
* Menor profundidad visual
* Escalabilidad futura
* Agrupación natural de funcionalidades

---

# Contexto 2 — Academic Operations

## Roles

* School Admin
* Branch Admin
* Teacher

---

## Responsabilidad

Gestionar la operación educativa diaria.

Incluye:

* Estudiantes
* Docentes
* Cursos
* Horarios
* Matrículas
* Asistencia
* Calificaciones
* Reportes académicos

---

## Patrón de Navegación

### Sidebar Único

Basado en la experiencia de Sneat Dashboard.

Ejemplo:

Dashboard

Académico

* Estudiantes
* Docentes
* Cursos
* Horarios

Operaciones

* Matrículas
* Asistencia
* Calificaciones

Reportes

Configuración

---

## Justificación

Los usuarios académicos trabajan continuamente dentro de los mismos módulos.

Un sidebar persistente ofrece:

* Navegación más rápida
* Menor cantidad de clics
* Menor carga cognitiva
* Mejor productividad

---

# Diferenciación por Rol

## School Admin

Acceso completo a los módulos académicos de una institución.

Layout:

SchoolLayout

---

## Branch Admin

Acceso restringido a una sede específica.

Layout:

BranchLayout

Puede reutilizar el mismo patrón visual del SchoolLayout.

---

## Teacher

Acceso únicamente a herramientas docentes.

Ejemplo:

Dashboard

Mis Cursos

Mis Estudiantes

Asistencia

Calificaciones

Agenda

Perfil

Layout:

TeacherLayout

---

# Relación con RBAC

La arquitectura de navegación debe construirse a partir de permisos.

Los menús no son estáticos.

La visibilidad de módulos debe depender de:

* Rol
* Permisos asignados
* Contexto actual

---

# Implementación Angular

La aplicación debe soportar layouts independientes.

Ejemplo:

PlatformLayout

* Top Navigation
* Context Sidebar

---

SchoolLayout

* Sidebar Único

---

BranchLayout

* Sidebar Único

---

TeacherLayout

* Sidebar Compacto

---

Cada layout actúa como shell principal y renderiza los módulos mediante router-outlet.

---

# Beneficios Arquitectónicos

## Escalabilidad

Permite agregar nuevos módulos sin degradar la experiencia de usuario.

---

## Mantenibilidad

Cada contexto evoluciona de manera independiente.

---

## Separación de Responsabilidades

Administrar la plataforma no es lo mismo que operar una institución educativa.

La interfaz debe reflejar esta diferencia.

---

## Consistencia

Cada usuario visualiza únicamente las herramientas necesarias para su trabajo.

---

# Regla Oficial

Platform Admin utilizará navegación híbrida:

* Navbar superior
* Sidebar contextual

School Admin, Branch Admin y Teacher utilizarán navegación basada en sidebar persistente estilo Sneat Dashboard.

Esta decisión se considera estándar oficial de navegación para LogicEdu Core.

