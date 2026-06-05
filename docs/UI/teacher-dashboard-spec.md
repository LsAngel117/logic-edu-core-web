# teacher-dashboard-spec.md

# Dashboard UI Specification — Teacher

## Objetivo

Definir la experiencia de usuario para docentes.

El docente necesita velocidad, simplicidad y acceso inmediato a sus actividades diarias.

---

# Layout

## TeacherLayout

Basado en SchoolLayout.

Debe reutilizar:

* Header
* Sidebar
* Design System
* Componentes visuales

No duplicar código.

Ver: architecture/navigation-architecture.md

---

# Sidebar

Dashboard

Mis Cursos

Mis Estudiantes

Asistencia

Calificaciones

Agenda

Comunicados

Perfil

---

# Header

Mismo componente utilizado por SchoolLayout.

Diferencias:

* Menos acciones
* Menos notificaciones

---

# Dashboard Principal

## Welcome Card

Hola, María.

Hoy tienes:

4 clases programadas

32 estudiantes pendientes de asistencia

12 actividades por calificar

---

# KPI Cards

## Cursos Activos

Icono:

BookOpen

---

## Estudiantes

Icono:

Users

---

## Asistencias Pendientes

Icono:

ClipboardCheck

---

## Actividades por Calificar

Icono:

NotebookPen

---

# Main Content

## Horario del Día

Tipo:

Timeline

Contenido:

08:00 Matemáticas

10:00 Física

13:00 Programación

---

## Actividades Pendientes

Lista

Prioridad visual alta

---

## Últimas Calificaciones

Tabla resumida

---

# Quick Actions

Registrar asistencia

Registrar calificaciones

Crear actividad

Enviar comunicado

---

# Visual Design

Utilizar exactamente el mismo sistema visual de:

* Login
* School Dashboard
* Platform Dashboard

---

# Reutilización Obligatoria

Debe reutilizar:

DashboardCardComponent

StatCardComponent

ChartCardComponent

PageHeaderComponent

UserMenuComponent

NotificationComponent

---

# Restricciones

El docente no puede visualizar:

* Configuración institucional
* Usuarios
* Roles
* Matrículas globales
* Reportes administrativos

---

# Principio UX

Todo debe estar orientado a responder:

¿Qué debo hacer hoy?

La pantalla principal debe mostrar únicamente información útil para la jornada del docente.

No mostrar métricas corporativas ni administrativas.

