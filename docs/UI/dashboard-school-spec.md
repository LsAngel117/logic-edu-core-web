# dashboard-school-spec.md

# Dashboard UI Specification — School Administration

## Objetivo

Definir la experiencia visual y funcional para los usuarios con rol:

* School Admin

Este dashboard representa la operación completa de una institución educativa.

No administra la plataforma SaaS.

Administra la institución.

---

# Layout

## SchoolLayout


Patrón de navegación:

Sidebar persistente izquierdo.

Inspiración:

* Sneat Dashboard
* ERP modernos
* Sistemas académicos empresariales

Ver: architecture/navigation-architecture.md

---

# Sidebar

Logo:

LogicEdu

Subtítulo:

School Administration

---

Menú principal

Dashboard

Académico

* Estudiantes
* Docentes
* Cursos
* Asignaturas
* Horarios

Operaciones

* Matrículas
* Asistencia
* Calificaciones

Comunicación

* Anuncios
* Notificaciones

Reportes

Configuración

---

# Header

Altura:

72px

Contenido:

Izquierda:

* Breadcrumb

Derecha:

* Notificaciones
* Usuario
* Menú de perfil

---

# Dashboard Principal

## Welcome Card

Ubicación:

Primera fila

Contenido:

Buenos días, Juan.

Institución:
Colegio San José

Período:
2026-I

---

# KPI Cards

Fila 1

## Estudiantes

Icono:

Users

Color:

Blue

---

## Docentes

Icono:

GraduationCap

Color:

Indigo

---

## Cursos

Icono:

BookOpen

Color:

Cyan

---

## Matrículas Activas

Icono:

ClipboardCheck

Color:

Green

---

# Analytics Section

Fila 2

## Evolución de Matrículas

Tipo:

Line Chart

Periodo:

Últimos 12 meses

---

## Distribución por Grado

Tipo:

Donut Chart

---

# Academic Activity

Fila 3

## Asistencia Hoy

Métrica principal

Porcentaje

---

## Calificaciones Pendientes

Cantidad

---

## Próximos Eventos

Lista

---

# Quick Actions

Panel lateral derecho

Acciones rápidas:

Nueva matrícula

Registrar estudiante

Registrar docente

Crear curso

Enviar comunicado

---

# Visual Design

## Typography

Roboto

---

## Border Radius

16px

---

## Shadows

Muy suaves

Estilo SaaS moderno

---

## Cards

Fondo blanco

Separación amplia

No usar bordes pesados

---

# Design Tokens

Primary

#2563EB

Secondary

#3B82F6

Accent

#60A5FA

Success

#10B981

Warning

#F59E0B

Danger

#EF4444

---

# Responsividad

Desktop

Sidebar expandido

---

Tablet

Sidebar colapsable

---

Mobile

Drawer temporal

---

# Regla

School Admin visualiza indicadores académicos y operativos.

Nunca visualiza indicadores SaaS.

No debe visualizar:

* Instituciones
* Membresías
* Suscripciones
* Auditoría global

Esos módulos pertenecen exclusivamente al contexto Platform Admin.

