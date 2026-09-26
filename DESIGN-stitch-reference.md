---
name: AfroLogistics Tradeflow
colors:
  surface: '#faf8ff'
  surface-dim: '#d2d9f4'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3ff'
  surface-container: '#eaedff'
  surface-container-high: '#e2e7ff'
  surface-container-highest: '#dae2fd'
  on-surface: '#131b2e'
  on-surface-variant: '#3f493f'
  inverse-surface: '#283044'
  inverse-on-surface: '#eef0ff'
  outline: '#6f7a6e'
  outline-variant: '#becabc'
  surface-tint: '#006d30'
  primary: '#00652c'
  on-primary: '#ffffff'
  primary-container: '#15803d'
  on-primary-container: '#d3ffd5'
  inverse-primary: '#79db8d'
  secondary: '#bb0112'
  on-secondary: '#ffffff'
  secondary-container: '#e02928'
  on-secondary-container: '#fffbff'
  tertiary: '#97344a'
  on-tertiary: '#ffffff'
  tertiary-container: '#b64c62'
  on-tertiary-container: '#fff1f1'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#95f8a7'
  primary-fixed-dim: '#79db8d'
  on-primary-fixed: '#00210a'
  on-primary-fixed-variant: '#005323'
  secondary-fixed: '#ffdad6'
  secondary-fixed-dim: '#ffb4ab'
  on-secondary-fixed: '#410002'
  on-secondary-fixed-variant: '#93000b'
  tertiary-fixed: '#ffd9dd'
  tertiary-fixed-dim: '#ffb2bd'
  on-tertiary-fixed: '#400013'
  on-tertiary-fixed-variant: '#81233b'
  background: '#faf8ff'
  on-background: '#131b2e'
  surface-variant: '#dae2fd'
typography:
  headline-xl:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-xl-mobile:
    fontFamily: Inter
    fontSize: 26px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-lg-medium:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '500'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-md-medium:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
  metric-display:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 34px
    letterSpacing: -0.02em
  metric-display-mobile:
    fontFamily: Inter
    fontSize: 22px
    fontWeight: '700'
    lineHeight: 28px
    letterSpacing: -0.01em
  label-md:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.04em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-mobile: 0.75rem
  margin: 1.5rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1rem
  space-xl: 1.5rem
---

## Brand & Style
The design system is engineered specifically for cross-border wholesale meat commerce and supply chain management connecting Senegal to Togo. It prioritizes functional durability, instant legibility under direct sunlight, and frictionless one-handed mobile ergonomics in high-tempo, demanding environments such as cold-storage warehouses, freight transit hubs, and wholesale open-air markets.

### Design Movement
**Utilitarian Structural Minimalism.** The design rejects ornamental gradients, skeuomorphic volume, pseudo-AI aesthetics, and visual noise. Visual authority is achieved through rigid data hierarchy, crisp contrast ratios, predictable placement, and purposeful structural density.

### Emotional Target & Key Principles
- **Uncompromising Precision:** Absolute clarity regarding ledger balances in FCFA, inventory metrics in kilograms, cargo batch weights, and temperature logs.
- **Transactional Assurance:** Green signifies verified settlement, positive stock, and safe custody transfer; red is isolated strictly to financial exposure (overdue credit) and operational emergencies (stock ruptures).
- **Physical Resilience:** Designed for physical work environments—touch targets remain minimum 48px to accommodate one-handed operation on low-tier or mid-tier smartphones with protective cases.

## Colors
The palette is strictly calibrated to three functional color groups to ensure zero cognitive fatigue and maximum accessibility under high glare.

### Functional Roles & Rules
- **Primary (`#15803d`):** Designates confirmed status, payment receipts, inventory stock additions, and primary call-to-action buttons. It is never used decoratively; its presence always indicates progress, balance, or primary execution.
- **Secondary (`#dc2626`):** Reserved exclusively as a critical sentinel for stock depletion, cold-chain temperature violations, critical payment arrears/credit defaults, and destructive commands. Never used as an accent or decorative highlight.
- **Neutral & Canvas Surfaces:**
  - Base Background: Pure Light (`#f8fafc`) for soft outdoor glare reduction.
  - Card & Container Surfaces: Pure White (`#ffffff`) for sharp foreground separation.
  - Subtle Borders & Dividers: Slate Tint (`#e2e8f0` and `#cbd5e1`) to demarcate ledger lines without visual clutter.
  - High-Hierarchy Text & Metrics: Slate 900 (`#0f172a`) providing an AAA contrast ratio exceeding 12:1 against white.
  - Secondary Metadata & Units (kg, FCFA): Slate 600 (`#334155`) and Slate 500 (`#64748b`).

## Typography
Typographic hierarchy is built entirely on `Inter` for its tall x-height, neutral letterforms, and high disambiguation between numbers and Latin characters.

### Numerical Data Formatting
- Currency amounts in West African CFA Franc (`FCFA`) and weights (`kg`, `T`) must always be formatted with tabular figures (`tnum`) to keep columns and ledgers vertically aligned across dynamic lines.
- Suffix units (`FCFA`, `kg`) are set at 75% visual size or rendered using `label-sm` in Slate 600 (`#334155`) directly alongside the primary bold figures to prevent ambiguity without overpowering the quantitative value.
- Headings on mobile retain tight line heights (1.2 to 1.3) to maximize vertical information density.

## Layout & Spacing
A fluid 4-column grid governs mobile screens (widths under 640px), stepping up to an 8-column layout for tablets (641px–1024px) and 12 columns for desktop monitoring screens.

### Ergonomic Rules for Ground Operations
- **Mobile Edge Margins:** Maintained strictly at `1rem` (16px) to maximize horizontal real estate on handheld units while avoiding edge-tap distortion.
- **Finger-First Touch Constraints:** Every interactive row, tab, field, or action button must guarantee an unobstructed hit area of at least 48px by 48px. 
- **Vertical Scannability:** Data rows within invoices and bill-of-lading lists utilize `space-md` (12px) vertical padding paired with `space-sm` (8px) internal content spacing, creating tight, readable groupings without accidental taps.

## Elevation & Depth
This design system avoids heavy shadows, colored drop glows, and multi-layered glass blurs, which distort contrast under bright exterior lighting and degrade performance on budget mobile processors.

### Depth Architecture
- **Layer 0 (Canvas Base):** Background tint `#f8fafc`.
- **Layer 1 (Cards, Ledger Items, Form Blocks):** Background `#ffffff` framed with a hairline perimeter border: `1px solid #e2e8f0`. No box shadow is applied in default states.
- **Layer 2 (Sticky Headers, Footers, Modals):** Background `#ffffff` with a directional containment border (`1px solid #cbd5e1`) and a discrete ambient drop shadow: `0 4px 6px -1px rgba(15, 23, 42, 0.08)`.
- **State Feedback:** Focused or pressed cards darken subtly to `#f1f5f9` rather than lifting via 3D scale transforms.

## Shapes
A disciplined "Soft" curvature philosophy is applied across the system (`roundedness: 1`). Radii are kept compact (`4px` to `8px`) to preserve maximum usable interior canvas and reflect a serious, commercial infrastructure feel.

### Geometric Constraints
- **Form Controls & Inputs:** `4px` corner radius.
- **Transaction Cards & Metric Blocks:** `6px` to `8px` corner radius.
- **Status Badges & Chips:** `4px` corner radius with strict square-like corners; fully rounded pills are prohibited to maintain a clinical, receipt-like quality.

## Components

### Buttons
- **Primary (Execution/Validation):** Height of `48px` minimum. Solid background `#15803d`, text `#ffffff` (`body-lg-medium`). Focused with an outer `2px` ring in `#15803d` offset by `2px` white. Used for: *Valider la pesée*, *Confirmer la réception*, *Encaisser FCFA*.
- **Critical (Hazard/Cancellation):** Height of `48px` minimum. Solid background `#dc2626`, text `#ffffff`. Reserved strictly for irreversible tasks: *Annuler le bordereau*, *Signaler avarie*, *Déclarer impayé*.
- **Secondary / Neutral:** Height of `48px` minimum. Background `#ffffff`, border `1px solid #cbd5e1`, text `#0f172a`.

### Cards & Ledger Rows (Meat Cargo & Billing)
- Enclosed with `1px solid #e2e8f0` on `#ffffff`.
- Structured as a two-zone layout: left side accommodates vehicle ID, cargo batch (e.g., *Bœuf désossé - 1 250 kg*), and timestamp; right side stacks total valuation (*3 750 000 FCFA*) with status indicators.
- Numeric balances use `metric-display` in tabular format.

### Status Badges & Settlement Chips
- **Conforme / Réceptionné / Réglé:** Background `#f0fdf4`, border `1px solid #bbf7d0`, text `#15803d` (`label-sm`).
- **Alerte / Rupture / Impayé:** Background `#fef2f2`, border `1px solid #fecaca`, text `#dc2626` (`label-sm`).
- **En Transit / En Attente:** Background `#f1f5f9`, border `1px solid #cbd5e1`, text `#334155` (`label-sm`).

### Input Fields & Rapid Weigh-in Controls
- Target height `48px` minimum. Border `1.5px solid #cbd5e1`, background `#ffffff`, text `#0f172a`.
- Focus state shifts border color directly to `#15803d` with zero shadow blur.
- Numeric inputs for weight (kg) and pricing automatically present specialized large numerical keypads on mobile viewports with fixed inline unit markers (*KG*, *FCFA*).

### Checkboxes & List Selection
- Checkbox target size: `24px` by `24px` inside a touch perimeter of `48px`.
- Unchecked: White background, `2px solid #cbd5e1`.
- Checked: Solid `#15803d` fill with bold white checkmark.