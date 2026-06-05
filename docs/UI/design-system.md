# design-system.md

# LogicEdu Core Design System

## Objetivo

Definir el sistema visual oficial de LogicEdu Core.

Todas las interfaces del sistema deben construirse utilizando este documento como referencia única.

El objetivo es garantizar:

* Consistencia visual
* Escalabilidad
* Reutilización de componentes
* Experiencia uniforme entre módulos
* Menor duplicación de código

---

# Principios de Diseño

## Profesional

La interfaz debe transmitir confianza institucional.

---

## Moderna

Inspirada en plataformas SaaS actuales.

---

## Clara

La información es más importante que la decoración.

---

## Consistente

Los mismos elementos deben comportarse igual en toda la plataforma.

---

## Reutilizable

Todo componente visual debe poder reutilizarse entre contextos.

---

# Identidad Visual

## Marca

LogicEdu Core

---

## Estilo

Academic SaaS

EdTech Enterprise

Modern Dashboard

---

## Inspiración

* Sneat Dashboard
* Linear
* Notion
* Stripe Dashboard
* Vercel Dashboard

---

# Tipografía

## Fuente Oficial

Roboto

Pesos permitidos:

300

400

500

600

700

---

## Charts

Librería oficial:

ApexCharts

Tipos permitidos:

- Area
- Line
- Bar
- Donut
- Radial

Todos los gráficos deben utilizar:

- colores del Design System
- tooltips consistentes
- animaciones suaves
- bordes redondeados

---

## Escala Tipográfica

Page Title

32px

700

---

Section Title

24px

700

---

Card Title

18px

600

---

Body

14px

400

---

Caption

12px

400

---

# Paleta Oficial

## Primary

#2563EB

---

## Secondary

#3B82F6

---

## Accent

#60A5FA

---

## Success

#10B981

---

## Warning

#F59E0B

---

## Danger

#EF4444

---

## Neutral

#111827
#374151
#6B7280
#9CA3AF
#E5E7EB
#F3F4F6
#FFFFFF

---

# Iconografía

## Librería Oficial

Lucide Angular

---

No utilizar:

* Material Icons
* Bootstrap Icons
* Heroicons

---

## Estilo

Stroke Icons

1.5px

Limpios

Minimalistas

---

# Border Radius

## Inputs

12px

---

## Cards

16px

---

## Dialogs

20px

---

## Buttons

14px

---

# Sombras

## Card

box-shadow:
0 4px 12px rgba(0,0,0,.05);

---

## Hover

box-shadow:
0 8px 24px rgba(0,0,0,.08);

---

Nunca usar sombras agresivas.

---

# Espaciado

Base Unit

8px

---

Escalas permitidas

4px

8px

12px

16px

24px

32px

48px

64px

---

# Componentes Base

## PageHeader

Uso:

Todas las páginas principales.

---

## DashboardCard

KPIs.

---

## StatCard

Indicadores.

---

## ChartCard

Gráficos.

---

## DataTable

Listados.

---

## AppDialog

Modales.

---

## EmptyState

Estados vacíos.

---

## ConfirmationDialog

Confirmaciones.

---

# Formularios

## Filosofía

No utilizar apariencia visual por defecto de Angular Material.

Angular Material se utiliza únicamente como base funcional.

La apariencia pertenece al Design System de LogicEdu.

---

## Inputs

Altura:

52px

---

Radius:

12px

---

Focus:

Borde azul

Glow suave

---

## Checkbox

Estilo personalizado.

No utilizar apariencia Material por defecto.

---

## Password Fields

Iconos Lucide.

Mostrar/Ocultar contraseña.

---

# Botones

## Primary Button

Gradient:

#4F46E5 → #6366F1

---

Texto:

Blanco

---

Altura:

52px

---

Radius:

14px

---

## Secondary Button

Fondo blanco.

Borde gris suave.

---

# Cards

## Filosofía

Las cards son el elemento principal de la interfaz.

---

Características:

Fondo blanco

Radius 16px

Sombras suaves

Mucho espacio interno

---

# Tablas

## Estilo

Corporativo

Minimalista

---

No usar líneas pesadas.

---

Hover suave.

---

Acciones con iconos Lucide.

---

# Navegación

## Platform Admin

Navigation Pattern:

Top Navigation
+
Context Sidebar

---

## School Admin

Navigation Pattern:

Persistent Sidebar

---

## Branch Admin

Navigation Pattern:

Persistent Sidebar

---

## Teacher

Navigation Pattern:

Persistent Sidebar

---

# Reutilización Obligatoria

Los siguientes componentes deben compartirse entre todos los contextos:

PageHeaderComponent

UserMenuComponent

NotificationComponent

DashboardCardComponent

StatCardComponent

ChartCardComponent

DataTableComponent

AppDialogComponent

EmptyStateComponent

---

# Regla Arquitectónica

Los layouts pueden ser diferentes.

Las funcionalidades pueden ser diferentes.

Los permisos pueden ser diferentes.

Pero todos los contextos deben compartir:

* Design Tokens
* Tipografía
* Iconografía
* Componentes Base
* Comportamientos UI

para mantener una única identidad visual de LogicEdu Core.

---

# Resultado Esperado

Un usuario debe reconocer inmediatamente que se encuentra dentro de LogicEdu Core independientemente de si está utilizando:

* Platform Administration
* School Administration
* Branch Administration
* Teacher Portal

La identidad visual debe ser consistente en todo el ecosistema.

