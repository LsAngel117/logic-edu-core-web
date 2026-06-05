# users-module-spec.md

# LogicEdu Core — Users Module

## Objetivo

Administrar todos los usuarios de la plataforma.

Implementa los patrones definidos en:

* crud-patterns.md
* design-system.md

---

# Contexto

Disponible para:

* Platform Admin
* School Admin (limitado)
* Branch Admin (limitado)

---

# Funcionalidades

## Crear usuario

Campos:

* Nombre
* Apellido
* Tipo documento
* Documento
* Correo electrónico
* Teléfono
* Estado

Acción:

```text
Nuevo Usuario
```

Drawer lateral.

---

## Editar usuario

Permite modificar:

* Información personal
* Estado
* Contacto

No permite modificar:

* Auditoría
* Historial

---

## Restablecer contraseña

Acción contextual.

```text
Restablecer contraseña
```

Confirmación requerida.

---

## Activar / Desactivar

Estado:

* Activo
* Inactivo
* Bloqueado

Visualizado mediante chips.

---

# Tabla

Columnas:

* Nombre completo
* Documento
* Correo
* Teléfono
* Estado
* Membresías
* Último acceso
* Acciones

---

# Vista detalle

Tabs:

* Información General
* Membresías
* Actividad
* Auditoría

---

# KPIs

Cards superiores:

* Usuarios activos
* Usuarios inactivos
* Nuevos usuarios
* Usuarios bloqueados

---

# Permisos

users.read
users.create
users.update
users.disable
users.reset-password

---

# Responsive

Seguir crud-patterns.md

