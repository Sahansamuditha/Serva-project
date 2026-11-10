---
name: Academic Precision
colors:
  surface: '#fff8f7'
  surface-dim: '#ead5d4'
  surface-bright: '#fff8f7'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#fff0ef'
  surface-container: '#ffe9e8'
  surface-container-high: '#f9e3e2'
  surface-container-highest: '#f3dedd'
  on-surface: '#241919'
  on-surface-variant: '#574141'
  inverse-surface: '#3a2d2d'
  inverse-on-surface: '#ffedec'
  outline: '#8a7170'
  outline-variant: '#debfbf'
  surface-tint: '#a7373e'
  primary: '#58000f'
  on-primary: '#ffffff'
  primary-container: '#7a1521'
  on-primary-container: '#ff8487'
  inverse-primary: '#ffb3b2'
  secondary: '#5c5f61'
  on-secondary: '#ffffff'
  secondary-container: '#e0e3e5'
  on-secondary-container: '#626567'
  tertiary: '#262829'
  on-tertiary: '#ffffff'
  tertiary-container: '#3c3e3e'
  on-tertiary-container: '#a8a9a9'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdad9'
  primary-fixed-dim: '#ffb3b2'
  on-primary-fixed: '#410009'
  on-primary-fixed-variant: '#861f29'
  secondary-fixed: '#e0e3e5'
  secondary-fixed-dim: '#c4c7c9'
  on-secondary-fixed: '#191c1e'
  on-secondary-fixed-variant: '#444749'
  tertiary-fixed: '#e2e2e2'
  tertiary-fixed-dim: '#c6c6c7'
  on-tertiary-fixed: '#1a1c1c'
  on-tertiary-fixed-variant: '#454747'
  background: '#fff8f7'
  on-background: '#241919'
  surface-variant: '#f3dedd'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  stats-number:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 32px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 8px
  sm: 12px
  md: 16px
  lg: 24px
  xl: 32px
  gutter: 24px
  margin-mobile: 16px
  sidebar-width: 260px
  sidebar-collapsed: 72px
---

## Brand & Style

The design system is engineered for **Serva**, an institutional maintenance monitoring platform. The brand personality is authoritative, systematic, and reliable, reflecting the academic excellence of the Institute of Technology, University of Moratuwa. 

The visual style follows a **Corporate / Modern** aesthetic with a focus on high information density and clarity. It utilizes a structured hierarchy, ample whitespace to reduce cognitive load during complex task management, and subtle depth through soft shadows. The interface prioritizes utility and trust, ensuring that critical maintenance data is accessible and actionable for both administrative staff and technical teams.

## Colors

The palette is anchored by a **Deep Maroon**, establishing a strong institutional identity. 

- **Primary:** Used for brand headers, primary action buttons, and active sidebar states.
- **Background & Surface:** A layered approach using Off-white (#F8FAFC) for the application backdrop and Pure White (#FFFFFF) for cards and content containers to create clear visual separation.
- **Functional/Status Colors:** These follow industry standards for maintenance workflows—Amber for caution/pending, Blue for active tasks, Emerald for resolution, and Red for urgent failures. 
- **Neutral Tones:** Slate-based greys are used for typography to ensure high legibility and a modern feel compared to pure black.

## Typography

The design system utilizes **Inter** exclusively for its exceptional legibility in data-heavy environments. 

- **Scale:** A tight scale is used to maintain professional density.
- **Headlines:** Use SemiBold (600) or Bold (700) with slight negative letter-spacing to appear more grounded.
- **Data Display:** Labels for table headers and metadata should use `label-md` with uppercase styling to differentiate from interactive body text.
- **Mobile Adjustments:** For screens smaller than 768px, `display-lg` should scale down to `headline-md` size (24px) to prevent awkward line breaks in dashboard titles.

## Layout & Spacing

This design system employs a **Fluid Grid** system with fixed-width behaviors for specific containers.

- **Dashboard Layout:** A persistent left sidebar with a main content area. On desktop, the main content uses a maximum width of 1440px, centered, with 24px margins.
- **Grid:** Use a 12-column grid for desktop dashboard layouts. Stat cards typically span 3 columns (4 cards per row), while primary data tables span 8-9 columns with a secondary 3-4 column sidebar for filters or activity logs.
- **Spacing Rhythm:** Based on a 4px baseline. Use 16px (md) for standard component internal padding and 24px (lg) for gaps between major layout sections.

## Elevation & Depth

Hierarchy is established through **Tonal Layering** and **Soft Shadows**. 

1. **Level 0 (Background):** Off-white (#F8FAFC), flat.
2. **Level 1 (Cards/Sidebar):** Pure White (#FFFFFF) with a very soft, diffused shadow: `0px 1px 3px rgba(0,0,0,0.05), 0px 4px 6px rgba(0,0,0,0.02)`.
3. **Level 2 (Dropdowns/Modals):** Pure White (#FFFFFF) with a more pronounced shadow to indicate focus: `0px 10px 15px -3px rgba(0,0,0,0.1)`.

Avoid using heavy borders; instead, use a 1px stroke in a light grey (#E2E8F0) to define card boundaries if the shadow is insufficient on certain displays.

## Shapes

The design system uses a **Rounded** shape language to soften the institutional feel without losing professional rigor.

- **Standard Radius:** 8px (0.5rem) for buttons, input fields, and small cards.
- **Large Radius:** 12px (0.75rem) for main content containers and large dashboard widgets.
- **Pill Radius:** Used exclusively for status badges and tags to distinguish them from interactive buttons.

## Components

### Sidebar
- **State:** Deep Maroon (#7A1521) background. 
- **Typography:** White with 70% opacity for inactive items, 100% opacity + SemiBold for active items.
- **Behavior:** Collapsible to 72px with tooltips for icons.

### Stat Cards
- **Content:** Large `stats-number`, a descriptive label, and a subtle background-tinted icon (e.g., a light blue circle behind a blue icon).
- **Border:** Subtle 1px stroke (#E2E8F0).

### Data Tables
- **Header:** Light grey background (#F1F5F9), `label-md` typography.
- **Rows:** White background with a 1px bottom border. Hover state should trigger a subtle shift to #F8FAFC.

### Form Fields
- **Input:** 8px radius, #F8FAFC background, 1px #E2E8F0 border.
- **Focus State:** 1px solid Deep Maroon (#7A1521) with a 3px soft maroon glow (alpha 10%).

### Status Badges
- **Style:** Small pill-shaped containers with a low-opacity background of the status color and high-contrast text of the same hue (e.g., Pending: Light Amber background with Dark Amber text).

### Progress Steppers
- **Visual:** Horizontal line with circular nodes. Completed steps use the Deep Maroon color; current steps use a maroon outline; future steps use light grey.