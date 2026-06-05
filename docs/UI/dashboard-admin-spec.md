# Dashboard Administrador de Plataforma — UI Specification

## Objetivo

Diseñar el Dashboard principal de LogicEdu Core para el rol Administrador de Plataforma.

El diseño debe transmitir:

* Plataforma SaaS moderna.
* Gestión educativa empresarial.
* Claridad visual.
* Jerarquía de información.
* Sensación premium.
* Consistencia visual con Login.

No utilizar apariencia visual por defecto de Angular Material.

---

# Reglas Generales

## R1 — Continuidad Visual

El Dashboard debe sentirse parte del mismo producto que la pantalla Login.

Debe reutilizar:

* Roboto.
* Paleta azul corporativa.
* Iconografía Lucide.
* Bordes suaves.
* Sombras sutiles.
* Mucho espacio en blanco.

---

## R2 — Inspiración

Referencia principal:

Sneat Academy Dashboard.

Mantener:

* Estructura.
* Jerarquía.
* Espaciado.

No copiar estilos literalmente.

Adaptar al branding LogicEdu.

---

## R3 — Estética

Evitar:

* Apariencia Google.
* Apariencia Material por defecto.
* Interfaces densas.
* Bordes duros.
* Tablas oscuras.

Buscar:

* SaaS moderno.
* Minimalismo.
* Aire visual.
* Tarjetas limpias.

---

## Layout

PlatformLayout

Navigation Pattern:
- Top Navigation
- Context Sidebar

Sections:
- Dashboard
- Configuración
- Herramientas
- Reportes
- Administración

Ver: architecture/navigation-architecture.md

Ancho:

280px

Color:

#ffffff

Borde derecho:

1px solid #eef2f7

Shadow:

0 2px 12px rgba(15,23,42,.04)

---

## Header

Altura:

72px

Sticky.

Color:

#ffffff

Border Bottom:

1px solid #eef2f7

---

## Content

Fondo:

#f8fafc

Padding:

32px

Gap:

24px

---

# Sidebar Branding

Parte superior:

Logo Card LogicEdu.

La misma identidad usada en Login.

---

Card:

* Fondo blanco.
* Border radius 20px.
* Shadow suave.
* Isotipo académico.
* Texto LogicEdu.
* Texto secundario Core Platform.

---

# Menú

Iconos:

Lucide.

Tamaño:

20px

Color normal:

#64748b

Color activo:

#2563eb

---

Item activo:

Background:

rgba(37,99,235,.08)

Texto:

#2563eb

Border Radius:

12px

---

# Header

## Izquierda

Título:

Dashboard

Subtítulo:

Resumen general de la plataforma.

---

## Derecha

Elementos:

* Notificaciones.
* Configuración.
* Perfil usuario.

Todos con botones circulares.

Hover suave.

---

# Hero Principal

Card superior grande.

Altura aproximada:

220px

---

Fondo:

Gradiente institucional.

linear-gradient(
135deg,
#2563eb,
#3b82f6,
#60a5fa
)

---

Contenido:

Bienvenida.

Ejemplo:

Bienvenido nuevamente,
Luis

Subtexto:

Visualiza el estado general de LogicEdu Core.

---

Lado derecho:

Ilustración Dashboard LogicEdu.

---

# KPIs

Primera fila.

4 tarjetas.

---

## Escuelas

Icono:

School

Valor:

128

---

## Usuarios

Icono:

Users

Valor:

2431

---

## Sedes

Icono:

Building

Valor:

45

---

## Crecimiento

Icono:

TrendingUp

Valor:

+12%

---

# Diseño KPI

Background:

#ffffff

Border Radius:

18px

Padding:

24px

Shadow:

0 4px 20px rgba(15,23,42,.04)

---

Icono dentro de círculo:

48x48

Color:

#2563eb

Background:

rgba(37,99,235,.08)

---

# Segunda Fila

## Crecimiento de usuarios

Card grande.

70% ancho.

---

Gráfico:

Line Chart.

Color principal:

#2563eb

Área inferior suavemente degradada.

---

## Distribución por roles

Card mediana.

30% ancho.

---

Gráfico:

Donut Chart.

Colores:

Administrador:
#2563eb

Coordinador:
#60a5fa

Docente:
#93c5fd

---

# Tercera Fila

## Actividad reciente

Tabla moderna.

Columnas:

Fecha
Usuario
Acción
Estado

---

Estados:

Activo
Pendiente
Completado

Utilizar chips.

---

## Accesos rápidos

Grid 2x2.

Tarjetas pequeñas.

---

Crear Escuela

Icono School

---

Crear Usuario

Icono UserPlus

---

Crear Sede

Icono Building

---

Ver Reportes

Icono BarChart

---

# Tarjetas

Todas las tarjetas comparten:

Background:
#ffffff

Border Radius:
18px

Border:
1px solid #eef2f7

Shadow:
0 4px 20px rgba(15,23,42,.04)

Hover:

translateY(-2px)

transition:
200ms ease

---

# Tipografía

Fuente:

Roboto

---

Títulos:

700

#0f172a

---

Subtítulos:

500

#64748b

---

Valores KPI:

700

#111827

---

# Iconografía

Usar únicamente:

Lucide Angular

No usar:

Material Icons.

No usar:

Font Awesome.

---

# Responsive

Tablet:

Sidebar colapsable.

---

Mobile:

Sidebar Drawer.

KPIs en una sola columna.

Gráficos apilados verticalmente.

---

# Restricciones

No usar colores aleatorios.

No usar degradados fuera de la paleta institucional.

No usar tarjetas oscuras.

No usar efectos glassmorphism en el dashboard.

No usar estilos visuales predeterminados de Angular Material.

Todos los componentes deben seguir el sistema visual definido para LogicEdu Core.

