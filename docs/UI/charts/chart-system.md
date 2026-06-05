# chart-system.md

# LogicEdu Core Chart System

## Objetivo

Estandarizar la construcción de gráficos dentro de LogicEdu Core.

Todos los dashboards del sistema deben utilizar la misma librería, los mismos componentes base y los mismos tokens visuales.

Esto garantiza:

* Consistencia visual
* Reutilización de componentes
* Menor mantenimiento
* Escalabilidad
* Integración con el Design System

---

# Librería Oficial

## Chart Engine

ApexCharts

---

## Angular Wrapper

ng-apexcharts

---

## Instalación

```bash
bun add apexcharts
bun add ng-apexcharts
```

---

# Regla Arquitectónica

Prohibido utilizar ApexCharts directamente dentro de páginas.

Incorrecto:

```html
<apx-chart></apx-chart>
```

Correcto:

```html
<app-area-chart></app-area-chart>
```

---

Toda integración con ApexCharts debe estar encapsulada en componentes reutilizables.

---

# Estructura

```text
shared/
└── ui/
    └── charts/
        ├── area-chart/
        ├── line-chart/
        ├── bar-chart/
        ├── donut-chart/
        ├── radial-chart/
        ├── chart-card/
        └── chart-config/
```

---

# Componentes Oficiales

## AreaChartComponent

Uso:

Series temporales

Ejemplos:

* Matrículas por mes
* Usuarios por mes
* Ingresos por mes

---

## LineChartComponent

Uso:

Tendencias

Ejemplos:

* Crecimiento SaaS
* Asistencia histórica
* Actividad de usuarios

---

## BarChartComponent

Uso:

Comparaciones

Ejemplos:

* Estudiantes por grado
* Cursos por docente
* Usuarios por rol

---

## DonutChartComponent

Uso:

Distribuciones

Ejemplos:

* Distribución de estudiantes
* Usuarios por rol
* Estado de matrículas

---

## RadialChartComponent

Uso:

KPIs

Ejemplos:

* Asistencia
* Ocupación
* Progreso académico
* Adopción de plataforma

---

# Chart Card

Todos los gráficos deben estar contenidos dentro de:

ChartCardComponent

---

Estructura:

```text
┌─────────────────────────────┐
│ Título                      │
│ Subtítulo                   │
│                             │
│         Chart               │
│                             │
└─────────────────────────────┘
```

---

# Diseño Visual

## Fondo

Blanco

```css
background: #ffffff;
```

---

## Radius

```css
border-radius: 16px;
```

---

## Shadow

```css
box-shadow:
0 4px 12px rgba(0,0,0,.05);
```

---

## Padding

```css
24px
```

---

# Colores Oficiales

## Primary

```text
#2563EB
```

---

## Secondary

```text
#3B82F6
```

---

## Accent

```text
#60A5FA
```

---

## Success

```text
#10B981
```

---

## Warning

```text
#F59E0B
```

---

## Danger

```text
#EF4444
```

---

## Purple

```text
#6366F1
```

---

## Cyan

```text
#06B6D4
```

---

# Tema de Gráficos

Todos los gráficos deben:

* utilizar colores del Design System
* respetar modo claro
* tener animaciones suaves
* tener bordes redondeados
* utilizar tipografía Roboto

---

# Tooltips

## Reglas

Fondo:

```text
#111827
```

Texto:

```text
#FFFFFF
```

Radius:

```text
12px
```

---

Nunca usar tooltips nativos.

---

# Animaciones

Duración:

```text
300ms
```

Tipo:

```text
ease-out
```

---

Animaciones permitidas:

* fade
* slide
* grow

---

Evitar animaciones agresivas.

---

# Grid y Ejes

Color:

```text
#E5E7EB
```

---

Espesor:

```text
1px
```

---

Mantener apariencia limpia.

---

# Dashboard Platform Admin

Gráficos permitidos:

* Crecimiento de instituciones
* Usuarios activos
* Uso de módulos
* Crecimiento SaaS
* Distribución de roles

---

# Dashboard School Admin

Gráficos permitidos:

* Matrículas
* Asistencia
* Rendimiento académico
* Distribución por grado
* Actividades académicas

---

# Dashboard Teacher

Gráficos permitidos:

* Asistencia semanal
* Actividades calificadas
* Progreso del curso
* Participación estudiantil

---

# Performance

Regla:

Los dashboards nunca deben solicitar datos individualmente por gráfico.

Correcto:

```text
Dashboard API
    ↓
Dashboard DTO
    ↓
Todos los widgets
```

---

Incorrecto:

```text
Chart A → API
Chart B → API
Chart C → API
Chart D → API
```

---

# Escalabilidad

Todos los gráficos deben consumir ViewModels.

Los componentes de gráficos nunca deben conocer:

* APIs
* Casos de uso
* HttpClient
* DTOs de backend

---

Los componentes reciben únicamente:

```typescript
series
categories
labels
title
subtitle
```

---

# Relación con el Design System

El Chart System es una extensión del Design System.

Todos los gráficos deben respetar:

* design-system.md
* navigation-architecture.md
* dashboard-admin-spec.md
* dashboard-school-spec.md
* teacher-dashboard-spec.md

para garantizar una experiencia visual consistente en todo LogicEdu Core.

# Recomendación adicional: 

Cuando lleguemos a la fase de implementación, crear también un archivo:

shared/ui/charts/chart-theme.ts

Con toda la configuración global de ApexCharts (Roboto, colores, tooltips, grid, animaciones, etc.). Así cada gráfico reutiliza el mismo tema y nunca tendrás que repetir configuración en cada componente. 
Eso encaja perfectamente con no duplicar código y mantener una identidad visual única para LogicEdu Core.

