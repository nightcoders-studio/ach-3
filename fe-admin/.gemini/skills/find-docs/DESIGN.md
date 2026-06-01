---
name: Mart2You Admin
colors:
  surface: "#f9faf2"
  surface-dim: "#d9dbd3"
  surface-bright: "#f9faf2"
  surface-container-lowest: "#ffffff"
  surface-container-low: "#f3f4ed"
  surface-container: "#edefe7"
  surface-container-high: "#e7e9e1"
  surface-container-highest: "#e2e3dc"
  on-surface: "#1a1c18"
  on-surface-variant: "#42493e"
  inverse-surface: "#2e312c"
  inverse-on-surface: "#f0f1ea"
  outline: "#72796d"
  outline-variant: "#c2c9bb"
  surface-tint: "#3c6934"
  primary: "#164212"
  on-primary: "#ffffff"
  primary-container: "#2e5a27"
  on-primary-container: "#9ed090"
  inverse-primary: "#a1d493"
  secondary: "#46663f"
  on-secondary: "#ffffff"
  secondary-container: "#c5eab8"
  on-secondary-container: "#4b6b43"
  tertiary: "#602440"
  on-tertiary: "#ffffff"
  tertiary-container: "#7c3b57"
  on-tertiary-container: "#ffabcb"
  error: "#ba1a1a"
  on-error: "#ffffff"
  error-container: "#ffdad6"
  on-error-container: "#93000a"
  primary-fixed: "#bdf0ad"
  primary-fixed-dim: "#a1d493"
  on-primary-fixed: "#002201"
  on-primary-fixed-variant: "#24501e"
  secondary-fixed: "#c8edbb"
  secondary-fixed-dim: "#acd0a0"
  on-secondary-fixed: "#042103"
  on-secondary-fixed-variant: "#2f4e29"
  tertiary-fixed: "#ffd9e5"
  tertiary-fixed-dim: "#ffb0cd"
  on-tertiary-fixed: "#3a0521"
  on-tertiary-fixed-variant: "#70314d"
  background: "#f9faf2"
  on-background: "#1a1c18"
  surface-variant: "#e2e3dc"
typography:
  display-lg:
    fontFamily: Geist
    fontSize: 32px
    fontWeight: "600"
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: "600"
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Geist
    fontSize: 20px
    fontWeight: "600"
    lineHeight: 28px
  title-lg:
    fontFamily: Geist
    fontSize: 18px
    fontWeight: "500"
    lineHeight: 26px
  body-lg:
    fontFamily: Geist
    fontSize: 16px
    fontWeight: "400"
    lineHeight: 24px
  body-md:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: "400"
    lineHeight: 20px
  label-md:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: "500"
    lineHeight: 16px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Geist
    fontSize: 11px
    fontWeight: "600"
    lineHeight: 14px
    letterSpacing: 0.03em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  sidebar-width: 260px
  container-padding: 32px
  gutter: 24px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 24px
---

## Brand & Style

The design system is engineered for operational efficiency, clarity, and trust. It targets retail administrators and inventory managers who require a high-density yet breathable interface to manage complex logistics.

The aesthetic follows a **Corporate / Modern** direction with a focus on functional minimalism. By pairing a deep, organic green with a clinical off-white workspace, the system balances the freshness of the grocery industry with the rigorous precision of a financial SaaS platform. The emotional response should be one of "controlled productivity"—where the interface recedes to let the data lead, but the brand presence remains grounded through a strong, authoritative sidebar.

## Colors

This design system utilizes a high-contrast structural palette to define functional zones:

- **Primary (Spinach Green):** Reserved for the navigation sidebar and primary call-to-action buttons. It signifies the brand identity and global navigation.
- **Secondary (Darker Green):** Used exclusively for active states, hover interactions, and pressed button states to provide immediate tactile feedback.
- **Background & Surface:** A layered approach using Off-white (#F8F9FA) for the application canvas and Pure White (#FFFFFF) for interactive content cards and data containers.
- **Functional Colors:** Use standard semantic greens (success), reds (error), and ambers (warning) for status badges and data trends, ensuring they are adjusted for legibility against white surfaces.

## Typography

The system employs **Geist** for its technical precision and exceptional legibility in data-heavy environments.

- **Headlines:** Use semi-bold weights with slight negative letter spacing to maintain a compact, professional appearance.
- **Data Display:** Numerical data in tables and summary cards should utilize `body-md` or `title-lg` to ensure clarity.
- **Labels:** Use `label-sm` in all-caps for table headers and section overviews to create a clear visual hierarchy between metadata and primary content.
- **Scaling:** On mobile devices, `display-lg` should scale down to 24px to prevent clipping in the main content area.

## Layout & Spacing

The layout follows a **Fixed Sidebar + Fluid Content** model:

- **Sidebar:** Fixed at 260px. This area houses the brand logo and primary navigation links.
- **Main Canvas:** A fluid area with a minimum horizontal padding of 32px. Content is organized into a modular grid.
- **Content Cards:** Arranged in a responsive grid. Summary cards typically span 3 columns (on a 12-column desktop grid), while data tables span the full 12 columns.
- **Breakpoints:**
  - **Desktop (1440px+):** Full sidebar visible.
  - **Tablet (768px - 1024px):** Sidebar collapses to an icon-only rail (80px) to maximize data workspace.
  - **Mobile (<768px):** Sidebar becomes a hidden drawer; container padding reduces to 16px.

## Elevation & Depth

Depth is used sparingly to maintain the clean, "flat-plus" aesthetic of the dashboard:

- **Level 0 (Canvas):** The Off-white (#F8F9FA) background serves as the base.
- **Level 1 (Cards):** Pure White (#FFFFFF) surfaces with a subtle, highly diffused shadow (e.g., `0px 2px 4px rgba(0,0,0,0.05)`). This separates the interactive content from the background.
- **Level 2 (Dropdowns/Modals):** Elements that float above the UI use a more pronounced shadow with a 12% opacity tint to indicate temporary focus.
- **Structural Outlines:** Use a 1px border of #E2E8F0 for all card elements to ensure definition against the off-white background even if shadows are not rendered.

## Shapes

The design system utilizes a **Soft (0.25rem)** shape language. This ensures the UI feels modern and approachable without losing the professional "edge" required for an administrative tool.

- **Buttons & Inputs:** 0.25rem (4px) corner radius.
- **Content Cards:** 0.5rem (8px) corner radius to provide a distinct container feel.
- **Status Badges:** 1rem (16px) or full pill-shape to distinguish them clearly from interactive buttons.

## Components

- **Primary Buttons:** Solid Spinach Green (#2E5A27) with white text. Hover state transitions to #1F3D1A.
- **Sidebar Navigation:** Items use Off-white (#F8F9FA) text and icons at 80% opacity. The active state uses a #1F3D1A background with a 4px left-accent border in a brighter green to indicate focus.
- **Summary Cards:** Top-row containers featuring a large `headline-md` value, a `label-md` title, and a background-tinted icon (15% opacity of the semantic color).
- **Data Tables:** Row height of 56px for readability. Header row uses `label-sm` with a subtle bottom border. High-priority rows should support a hover highlight in #F8F9FA.
- **Status Badges:** Low-saturation background fills with high-saturation text (e.g., Success = Light Green background with Dark Green text).
- **Input Fields:** 1px border in #CBD5E1, moving to #2E5A27 on focus. Labels are positioned above the field using `label-md`.
