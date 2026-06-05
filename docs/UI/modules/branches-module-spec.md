# branches-module-spec.md

# LogicEdu Core — Branches Module

## Objetivo

Administrar sedes asociadas a una institución.

---

# Contexto

Platform Admin
School Admin

---

# Relación

School
└── Branches

---

# Funcionalidades

## Crear sede

Campos:

* Institución
* Nombre
* Código
* Dirección
* Ciudad
* Teléfono
* Correo

---

## Asignar administrador

Permite seleccionar:

* Branch Admin

---

# Tabla

Columnas:

* Sede
* Institución
* Ciudad
* Administrador
* Usuarios
* Estado

---

# Vista detalle

Tabs:

* General
* Administradores
* Usuarios
* Configuración
* Auditoría

---

# Dashboard embebido

Cards:

* Usuarios
* Docentes
* Estudiantes
* Cursos

Charts:

* Asistencia
* Actividad académica

Utilizar chart-system.md

---

# Estados

* Activa
* Inactiva

---

# Permisos

branches.read
branches.create
branches.update
branches.disable

