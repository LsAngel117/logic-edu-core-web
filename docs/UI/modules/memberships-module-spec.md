# memberships-module-spec.md

# LogicEdu Core — Memberships Module

## Objetivo

Gestionar roles y permisos del sistema.

Basado en:

* Sneat Access Roles
* Sneat Permissions

---

# Contexto

Exclusivo Platform Admin.

---

# Concepto

Usuario
↓
Membership
↓
Permisos

---

# Memberships iniciales

* Platform Admin
* School Admin
* Branch Admin
* Teacher
* Student
* Guardian

---

# Funcionalidades

## Crear Membership

Campos:

* Nombre
* Descripción
* Estado

---

## Asignar permisos

Vista:

```text
Users
Schools
Branches
Academic
Attendance
Grades
Reports
Settings
```

Checkbox matrix.

---

# Tabla

Columnas:

* Nombre
* Descripción
* Usuarios asociados
* Permisos
* Estado
* Acciones

---

# Vista detalle

Tabs:

* General
* Permisos
* Usuarios asociados
* Auditoría

---

# KPIs

* Roles activos
* Permisos asignados
* Usuarios asociados
* Roles personalizados

---

# Permisos

memberships.read
memberships.create
memberships.update
memberships.delete
permissions.manage

