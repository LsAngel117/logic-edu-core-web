# crud-patterns.md

# LogicEdu Core — CRUD Patterns

## Objetivo

Definir los patrones visuales, de navegación y de interacción para todos los módulos CRUD de LogicEdu Core.

Este documento evita duplicidad de diseño entre módulos y garantiza consistencia en toda la plataforma.

---

# Dependencias

Todo CRUD debe respetar:

* design-system.md
* navigation-architecture.md
* chart-system.md
* dashboard-admin-spec.md
* dashboard-school-spec.md
* teacher-dashboard-spec.md

---

# Filosofía

Los módulos CRUD de LogicEdu siguen el estilo visual de Sneat adaptado a la identidad visual de LogicEdu.

Principios:

* Simplicidad
* Consistencia
* Escalabilidad
* Productividad
* Baja carga cognitiva

---

# Estructura General

Todos los módulos CRUD siguen la estructura:

```text
Page Header
↓
Filters Bar
↓
Data Table
↓
Pagination
```

---

# Layout de Página

```text
┌────────────────────────────────────────────┐
│ Título                                     │
│ Descripción                                │
│                                            │
│ [Filtros] [Buscar] [Acciones]              │
│                                            │
│ Tabla                                      │
│                                            │
│ Paginación                                 │
└────────────────────────────────────────────┘
```

---

# Page Header

## Estructura

```text
Título
Descripción breve
```

Ejemplo:

```text
Usuarios

Administra los usuarios registrados en la plataforma.
```

---

## Acciones Principales

Se ubican alineadas a la derecha.

Ejemplos:

```text
Nuevo Usuario
Nueva Institución
Nueva Sede
Nueva Matrícula
```

Botón:

* Primary Color
* Radius 12px
* Icono Lucide
* Altura 40px

---

# Filters Bar

Todos los CRUD deben incluir filtros.

---

## Componentes Permitidos

### Search

```text
🔍 Buscar...
```

---

### Select

```text
Estado
Rol
Institución
Sede
Periodo
```

---

### Date Range

Cuando aplique.

---

### Quick Filters

Chips.

Ejemplo:

```text
Activos
Inactivos
Pendientes
```

---

# Search Behavior

La búsqueda siempre debe:

* ser instantánea
* utilizar debounce
* conservar filtros activos

---

Valor recomendado:

```text
300ms
```

---

# Data Table Pattern

Todos los listados usan Data Table.

---

## Estilo

Inspirado en Sneat.

---

### Header

```css
background: #F8FAFC;
font-weight: 600;
```

---

### Row Height

```text
56px
```

---

### Hover

```css
background: #F8FAFC;
```

---

### Border

```css
#E5E7EB
```

---

# Columnas

Siempre priorizar información útil.

Evitar tablas excesivamente anchas.

---

# Estado

Los estados deben utilizar chips.

---

## Activo

```text
Verde
```

---

## Inactivo

```text
Gris
```

---

## Pendiente

```text
Amarillo
```

---

## Bloqueado

```text
Rojo
```

---

# Acciones por Fila

Ubicación:

Última columna.

---

Formato:

```text
⋮
```

Menu contextual.

---

Acciones permitidas:

```text
Ver
Editar
Eliminar
```

---

Acciones adicionales según módulo.

---

# Empty State

Cuando no existan registros.

```text
┌────────────────────────────┐
│     Icono                  │
│                            │
│ No hay registros           │
│                            │
│ Crear nuevo registro       │
└────────────────────────────┘
```

---

# Create Pattern

## Regla

No navegar a páginas nuevas.

---

Usar:

Drawer lateral.

---

# Drawer Pattern

Ubicación:

Derecha.

---

Ancho:

```text
480px
```

---

Desktop:

```text
480px
```

---

Tablet:

```text
100%
```

---

# Drawer Header

```text
Título
Descripción
```

Ejemplo:

```text
Crear Usuario

Registra un nuevo usuario.
```

---

# Drawer Body

Formulario.

---

# Drawer Footer

Botones:

```text
Cancelar
Guardar
```

---

Alineación:

Derecha.

---

# Edit Pattern

Mismo Drawer.

---

Cambia:

```text
Crear Usuario
```

por:

```text
Editar Usuario
```

---

# Delete Pattern

Siempre mediante diálogo.

Nunca eliminar directamente.

---

## Confirmation Dialog

```text
¿Eliminar usuario?

Esta acción no puede deshacerse.
```

---

Botones:

```text
Cancelar
Eliminar
```

---

Eliminar:

Color Danger.

---

# Detail Pattern

Cuando una entidad requiera más información.

---

## Estructura

```text
Overview
Tabs
Related Information
Audit
```

---

Ejemplo:

Usuario.

```text
Información General
Membresías
Actividad
Auditoría
```

---

# Form Pattern

Todos los formularios deben utilizar:

* Lucide Icons
* Roboto
* Radius 12px
* Labels visibles

---

Prohibido:

Placeholder como label único.

---

Correcto:

```text
Correo Electrónico

[________________]
```

---

# Validation

Validación:

* inmediata al perder foco
* no mientras escribe

---

Errores:

```text
Debajo del campo
```

---

Color:

```text
Danger
```

---

# Notifications

Operaciones exitosas:

Snackbar.

---

Ejemplos:

```text
Usuario creado correctamente
```

```text
Institución actualizada correctamente
```

---

# Audit Metadata

Cuando aplique.

Mostrar:

```text
Creado por
Fecha creación

Modificado por
Fecha modificación
```

---

# Responsive Behavior

Desktop:

Tabla completa.

---

Tablet:

Tabla simplificada.

---

Mobile:

Cards.

---

# Loading States

Prohibido:

Pantalla vacía.

---

Utilizar:

* Skeletons
* Table Skeleton
* Form Skeleton

---

# Accesibilidad

Todos los CRUD deben:

* soportar teclado
* focus visible
* labels accesibles
* contraste AA

---

# Reutilización

Todos los módulos deben reutilizar:

```text
shared/ui/table
shared/ui/drawer
shared/ui/dialog
shared/ui/forms
shared/ui/filters
shared/ui/charts
```

---

# Regla Arquitectónica

Los módulos NO pueden crear variantes visuales propias.

Todos los CRUD deben implementar los patrones definidos en este documento.

Cualquier excepción debe documentarse explícitamente en el spec del módulo correspondiente.

