# schools-module-spec.md

# LogicEdu Core — Schools Module

## Objetivo

Administrar instituciones educativas registradas en el SaaS.

---

# Contexto

Exclusivo Platform Admin.

---

# Funcionalidades

## Crear institución

Campos:

* Nombre
* NIT
* Código
* Correo
* Teléfono
* Dirección
* Ciudad
* País

---

## Configuración inicial

* Año académico
* Calendario
* Zona horaria
* Idioma

---

# Tabla

Columnas:

* Institución
* Código
* Ciudad
* Sedes
* Usuarios
* Estado
* Fecha creación

---

# Vista detalle

Tabs:

* General
* Sedes
* Administradores
* Configuración
* Auditoría

---

# Dashboard embebido

Cards:

* Total sedes
* Total usuarios
* Total estudiantes
* Estado suscripción

Charts:

* Crecimiento usuarios
* Uso plataforma

Utilizar chart-system.md

---

# Estados

* Activa
* Suspendida
* En configuración

---

# Permisos

schools.read
schools.create
schools.update
schools.disable

