---
name: LifeLink
colors:
  surface: '#f8f9fa'
  surface-dim: '#d9dadb'
  surface-bright: '#f8f9fa'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f4f5'
  surface-container: '#edeeef'
  surface-container-high: '#e7e8e9'
  surface-container-highest: '#e1e3e4'
  on-surface: '#191c1d'
  on-surface-variant: '#5b4040'
  inverse-surface: '#2e3132'
  inverse-on-surface: '#f0f1f2'
  outline: '#8f6f6f'
  outline-variant: '#e3bebd'
  surface-tint: '#ba1434'
  primary: '#9e0027'
  on-primary: '#ffffff'
  primary-container: '#c41e3a'
  on-primary-container: '#ffdada'
  inverse-primary: '#ffb3b4'
  secondary: '#356382'
  on-secondary: '#ffffff'
  secondary-container: '#acdafe'
  on-secondary-container: '#31607f'
  tertiary: '#005278'
  on-tertiary: '#ffffff'
  tertiary-container: '#006b9c'
  on-tertiary-container: '#cae6ff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdad9'
  primary-fixed-dim: '#ffb3b4'
  on-primary-fixed: '#40000a'
  on-primary-fixed-variant: '#920023'
  secondary-fixed: '#c9e6ff'
  secondary-fixed-dim: '#9fccef'
  on-secondary-fixed: '#001e2f'
  on-secondary-fixed-variant: '#184b69'
  tertiary-fixed: '#cae6ff'
  tertiary-fixed-dim: '#8ccdff'
  on-tertiary-fixed: '#001e2f'
  on-tertiary-fixed-variant: '#004b6f'
  background: '#f8f9fa'
  on-background: '#191c1d'
  surface-variant: '#e1e3e4'
typography:
  display-lg:
    fontFamily: Montserrat
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Montserrat
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
  headline-lg-mobile:
    fontFamily: Montserrat
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-md:
    fontFamily: Montserrat
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-bold:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.05em
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  container-margin-desktop: 40px
  container-margin-mobile: 20px
  gutter: 24px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 32px
---

## Brand & Style
The design system is built on a foundation of **Urgency tempered by Stability**. It serves as a critical bridge between donors and patients, requiring a UI that feels both medically authoritative and human-centric. 

The aesthetic follows a **Modern Corporate** approach with a **Tactile** edge. It utilizes high-clarity typography and a structured grid to convey reliability, while using soft, rounded shapes and subtle depth to remain approachable and calm during high-stress emergency scenarios. The visual narrative prioritizes information density and speed of recognition above all else.

## Colors
This design system uses a restricted color palette to maintain a calm medical environment. 

- **Primary (Crimson):** Used exclusively for high-priority actions (Request Blood), critical alerts, and the "Blood Drop" icon. It should never be the background of a large container.
- **Secondary (Deep Navy/Teal):** Provides the professional anchor. Used for navigation, headers, and primary non-emergency buttons to instill trust.
- **Surface & Base:** A hierarchy of grays (#F8F9FA to #E9ECEF) creates a clean, sanitary background that reduces eye strain.
- **Semantic Logic:** Success greens indicate a successful match or donation completion; yellow is reserved for pending requests or low-stock warnings.

## Typography
The system employs **Montserrat** for headlines to provide a confident, sturdy, and modern personality. **Inter** is used for all body copy and functional UI labels due to its exceptional legibility at small sizes and high x-height, which is critical for reading medical data on the go.

- Use **Label-Bold** in all-caps for categories or status tags.
- Maintain a minimum body size of 16px for general accessibility in high-pressure situations.
- Headlines should use tighter letter-spacing to appear more urgent and impactful.

## Layout & Spacing
The layout follows a **12-column Fluid Grid** for desktop and a **4-column Fluid Grid** for mobile. 

A strict 8px spacing rhythm ensures consistency. Generous whitespace (32px+) should be used between functional sections (e.g., separating Donor Profile from Contact History) to prevent the UI from feeling cluttered or overwhelming. 

**Breakpoints:**
- Mobile: 0px - 599px
- Tablet: 600px - 1023px
- Desktop: 1024px+

Elements should utilize `stack-md` (16px) for internal card padding and `stack-lg` (32px) for vertical separation between distinct content modules.

## Elevation & Depth
Depth in the design system is used to indicate interactivity and hierarchy. We avoid flat design to ensure users understand what can be clicked instantly.

- **Level 0 (Base):** #F8F9FA background.
- **Level 1 (Cards):** White background with a 1px #E9ECEF border and a soft, highly diffused shadow (0px 4px 20px rgba(0, 0, 0, 0.04)).
- **Level 2 (Active/Hover):** Slightly deeper shadow (0px 8px 30px rgba(0, 0, 0, 0.08)) to indicate the element is raised.
- **Level 3 (Modals/Emergency Alerts):** High-contrast shadow with a slight crimson tint in the shadow value to draw immediate focus.

## Shapes
Shapes are defined by a **Rounded** philosophy. This softens the clinical nature of the platform, making it feel more human and less institutional.

- **Default (8px):** Standard buttons, input fields, and small UI elements.
- **Large (16px):** Main donor profile cards, map containers, and modal windows.
- **Full (Pill):** Status chips (e.g., "Matched", "Urgent") and primary action floating buttons.

## Components

### Buttons
- **Primary Urgent:** Crimson (#C41E3A) background with white text. Reserved for "Request Blood" or "Confirm Emergency."
- **Primary Standard:** Deep Navy (#1B4D6B) for standard actions like "Save Profile" or "Message Donor."
- **Secondary:** Outline style with 1px Navy border.

### Donor Profile Cards
- Cards must feature a 16px corner radius.
- Use a large, clear Blood Type indicator in the top right (e.g., "O+" in a Crimson circle).
- Include a "Distance" label with a map pin icon for quick geographic relevance.

### Input Fields
- Soft 8px radius with a light gray border. Focus state uses a 2px Teal outline.
- Labels always sit above the field, never inside as placeholders, to maintain visibility during data entry.

### Horizontal Steppers
- Used for the blood request process. 
- Completed steps use the Success Green; active steps use the Primary Crimson to indicate the current point of urgency.

### Interactive Maps
- Map pins should be color-coded by blood type availability.
- Use a custom map style with reduced detail (muted grays) to allow the Crimson/Blue markers to pop.

### Chips/Tags
- Small, pill-shaped indicators for "Rare Type," "Verified," or "Available Now."
- Use light-tinted backgrounds of the semantic colors (e.g., Light Green background with Dark Green text).