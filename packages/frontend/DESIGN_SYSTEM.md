# VaultFinance Design System

## Purpose

VaultFinance follows a **refined financial design language** emphasizing precision, stability, and trust. The design system ensures consistency across all UI components while maintaining flexibility for future growth.

> **Core Philosophy: Trust through clarity, stability through precision.**

---

## Core Principles

### 1. Single Source of Truth

All visual decisions flow through one pipeline:

- **`src/index.css`** - CSS variables, theme definitions
- **`tailwind.config.js`** - Semantic token mapping
- **`src/components/ui/*`** - Reusable UI primitives
- **Feature/page components** - Composition only, no style redefinition

### 2. Color Philosophy

As a lending/borrowing DeFi protocol, we use:
- **Deep Green (#2B6D16)** as brand color - represents growth, stability, financial health
- **Pure black/white** for backgrounds - maximum contrast, professional feel
- **Green for buy/supply**, **Red for sell/borrow** - standard financial semantics

### 3. Typography

System font stack for zero loading latency:
```css
font-family:
  -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
  "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei",
  sans-serif;
```

---

## Color System

### Brand Colors

| Token | Value | Usage |
|-------|-------|-------|
| `--brand` | #2B6D16 | Primary brand color, CTAs |
| `--brand-hover` | #3A8A1F | Hover states |
| `--brand-light` | rgba(43, 109, 22, 0.12) | Subtle backgrounds |

### Semantic Colors

| Token | Value (Dark) | Value (Light) | Usage |
|-------|--------------|---------------|-------|
| `--color-buy` | #00D084 | #00B470 | Supply, success, positive |
| `--color-sell` | #FF3B30 | #E0352B | Borrow, danger, negative |

### Background Colors

#### Dark Theme
| Token | Value | Usage |
|-------|-------|-------|
| `--bg-page` | #000000 | Page background |
| `--bg-surface` | #0A0A0A | Cards, containers |
| `--bg-elevated` | #141414 | Elevated elements |
| `--bg-hover` | #1A1A1A | Hover states |

#### Light Theme
| Token | Value | Usage |
|-------|-------|-------|
| `--bg-page` | #FFFFFF | Page background |
| `--bg-surface` | #FAFAFA | Cards, containers |
| `--bg-elevated` | #F5F5F5 | Elevated elements |
| `--bg-hover` | #F0F0F0 | Hover states |

### Text Colors

#### Dark Theme
| Token | Value | Usage |
|-------|-------|-------|
| `--text-primary` | #FFFFFF | Headlines, primary text |
| `--text-secondary` | #A0A0A0 | Secondary text |
| `--text-tertiary` | #6B6B6B | Muted text |

#### Light Theme
| Token | Value | Usage |
|-------|-------|-------|
| `--text-primary` | #000000 | Headlines, primary text |
| `--text-secondary` | #666666 | Secondary text |
| `--text-tertiary` | #999999 | Muted text |

### Border Colors

| Token | Value (Dark) | Value (Light) |
|-------|--------------|---------------|
| `--border-default` | #262626 | #E8E8E8 |
| `--border-subtle` | #1A1A1A | #F0F0F0 |
| `--border-strong` | #333333 | #D0D0D0 |

---

## Component Patterns

### Buttons

- **Primary**: `bg-brand text-white`
- **Secondary**: `bg-background-elevated text-foreground`
- **Outline**: `border border-border bg-transparent`
- **Buy**: `bg-buy text-black`
- **Sell**: `bg-sell text-white`

### Cards

- Background: `bg-background-surface`
- Border: `border border-border`
- Border Radius: `rounded-xl` (12px)
- Shadow: subtle on hover

### Tabs

- Container: `bg-background-elevated`
- Active: `bg-foreground text-background` (inverted)
- Inactive: `text-foreground-secondary`

### Badges (APY)

- Supply APY: `bg-buy-light text-buy` (no border)
- Borrow APY: `bg-sell-light text-sell` (no border)

---

## Usage Rules

### Do
- Use semantic Tailwind classes (`text-foreground`, `bg-background-surface`)
- Reference CSS variables for one-off values
- Maintain theme consistency via `data-theme` attribute

### Don't
- Hardcode colors like `text-[#FE2C55]` or `bg-green-500`
- Define theme values in component files
- Use multiple naming systems for the same concept

---

## Theme Toggle

Themes switch via `data-theme` attribute on `<html>`:

```tsx
// Dark (default)
<html data-theme="dark">

// Light
<html data-theme="light">
```

CSS variables automatically adapt based on the theme.
