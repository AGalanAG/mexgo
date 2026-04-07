# Convenciones de Frontend - MexGo

Este documento establece las convenciones de diseño y desarrollo frontend para el proyecto MexGo, basado en la identidad visual de Fundación Coppel y Hola México.

## Paleta de Colores

Utilizamos una paleta basada en los colores institucionales de Coppel, complementada con tonos que evocan la riqueza cultural de México.

### Colores Principales (CSS Variables)
- `--primary`: `#004891` (Azul Coppel) - Usado para acciones principales, encabezados y marca.
- `--secondary`: `#FFD400` (Amarillo Coppel) - Usado para acentos, botones de atención y elementos destacados.
- `--accent`: `#006341` (Verde México) - Usado para elementos relacionados con turismo y naturaleza.
- `--background`: `#F8F9FA` (Gris muy claro) - Color de fondo general.
- `--surface`: `#FFFFFF` (Blanco) - Fondo para cards, modales y secciones.
- `--text-primary`: `#212529` (Gris casi negro) - Texto principal.
- `--text-secondary`: `#6C757D` (Gris medio) - Texto secundario/desactivado.

## Tipografía y Tamaños

- **Fuente Principal:** Sans-serif estándar (Inter, Roboto o System default).
- **Escala de Tamaños:**
  - `text-xs`: 0.75rem (12px)
  - `text-sm`: 0.875rem (14px)
  - `text-base`: 1rem (16px)
  - `text-lg`: 1.125rem (18px)
  - `text-xl`: 1.25rem (20px)
  - `text-2xl`: 1.5rem (24px)
  - `text-3xl`: 1.875rem (30px)

## Estructura de Componentes

Los componentes se organizan en `components/`.
- `tourist/`: Componentes específicos para el flujo del turista y landing page.
- `common/`: Componentes reutilizables (Botones, Inputs, Cards genéricas).

### Convenciones de Naming
- Archivos: PascalCase (ej. `TouristCard.tsx`).
- Carpetas: camelCase (ej. `tourist/`).
- Estilos: Tailwind CSS como prioridad, usando las variables definidas en `globals.css`.

## Responsive Design
- Móvil primero (Mobile-first).
- Breakpoints estándar de Tailwind:
  - `sm`: 640px
  - `md`: 768px
  - `lg`: 1024px
  - `xl`: 1280px
