# Health Planner — Comprehensive Apple HIG UI/UX Design Specifications

Here is the complete, production-ready UI/UX Design Specification for **Health Planner**, crafted according to Apple Human Interface Guidelines (HIG) with modern glassmorphism, responsive desktop/mobile layouts, gamification components, specialized Indian diet serving unit controls, interactive calculator tools, and Google Drive cloud sync UI.

---

## 1. Aesthetic Direction & Design System (Apple HIG Inspired)

### 1.1 Glassmorphism & Depth Architecture
- **Layering Model**: 3 primary visual layers:
  1. **Base Layer (Canvas)**: Dynamic dark/light background with subtle mesh radial gradients.
  2. **Card Layer (Glass Panels)**: `backdrop-filter: blur(20px) saturate(180%)`, ambient drop-shadow, and subtle specular edge border.
  3. **Floating Overlay Layer (Modals/Sheets/Nav Bars)**: High-blur glass `backdrop-filter: blur(32px) saturate(200%)` with high-contrast dynamic shadow.
- **Border Spec**: `1px solid rgba(255, 255, 255, 0.12)` in dark mode; `1px solid rgba(0, 0, 0, 0.08)` in light mode.
- **Squircle Border Radius**: 
  - Desktop Cards: `24px` (`rounded-3xl`)
  - Floating Panels / Bottom Sheet: `32px` (`rounded-[32px]`)
  - Buttons / Chips: `12px` - `16px` (`rounded-xl` to `rounded-2xl`)

### 1.2 Color System & Semantic Tokens

| Semantic Token | Light Mode Hex | Dark Mode Hex | Usage |
| :--- | :--- | :--- | :--- |
| **System Background** | `#F2F2F7` | `#000000` / `#0C0C0E` | App base canvas background |
| **Glass Card Background** | `rgba(255, 255, 255, 0.65)` | `rgba(28, 28, 30, 0.65)` | Widgets, panels, card containers |
| **Elevated Modal Glass** | `rgba(255, 255, 255, 0.85)` | `rgba(44, 44, 46, 0.80)` | Modals, popovers, dropdowns |
| **Primary Accent (Apple Blue)** | `#007AFF` | `#0A84FF` | Key actions, active states, buttons |
| **Calorie Gauge (Energy)** | `#FF9500` -> `#FF2D55` | `#FF9F0A` -> `#FF375F` | Fuel gauge, calorie deficit progress |
| **Protein Accent (Cyan)** | `#32ADE6` | `#64D2FF` | Macro protein tracking bar/chip |
| **Carb Accent (Orange Gold)**| `#FF9500` | `#FFD60A` | Macro carbs tracking bar/chip |
| **Fat Accent (Violet/Purple)**| `#AF52DE` | `#BF5AF2` | Macro fats tracking bar/chip |
| **Streak Flame (Vibrant Red)**| `#FF3B30` | `#FF453A` | Deficit streak counter, alert indicators |
| **Sync Success (Apple Green)**| `#34C759` | `#30D158` | Google Drive cloud sync success |
| **Text Primary** | `#1C1C1E` | `#F2F2F7` | Headings, primary metrics |
| **Text Secondary** | `#6C6C70` | `#8E8E93` | Subtitles, labels, unit metrics |

### 1.3 Typography & Hierarchy
- **Font Family**: `-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "SF Pro Rounded", sans-serif`.
- **Numeric Font Feature**: `font-variant-numeric: tabular-nums` for all dynamic calorie counters, macro weights, and streak counts to eliminate width jitter during animations.

```css
/* Typography Utility Scale */
.text-hero-stat  { font-size: 3rem;   line-height: 1.1; font-weight: 700; letter-spacing: -0.03em; font-family: "SF Pro Rounded"; }
.text-large-title { font-size: 2.125rem; line-height: 1.2; font-weight: 700; letter-spacing: -0.02em; }
.text-title-1    { font-size: 1.75rem; line-height: 1.25; font-weight: 600; letter-spacing: -0.015em; }
.text-title-2    { font-size: 1.375rem; line-height: 1.3; font-weight: 600; }
.text-body       { font-size: 1rem;    line-height: 1.5; font-weight: 400; }
.text-caption    { font-size: 0.75rem; line-height: 1.4; font-weight: 500; letter-spacing: 0.02em; text-transform: uppercase; }
```

### 1.4 Spatial System & Grid
- **Base Grid**: 8pt spatial system (`8px`, `16px`, `24px`, `32px`, `48px`).
- **Card Padding**: `16px` (Mobile), `24px` (Desktop).

---

## 2. Responsive Layout Breakdown & Navigation Architecture

### 2.1 Mobile Layout Architecture (Mobile-First)
- **Top Header Bar**: Fixed glass header (`h-14`) with User Profile/Avatar, Sync Indicator pill, and Dark/Light toggle.
- **Floating Bottom Bar**: Apple Watch Dock style floating navigation with dynamic backplate blur.
  - Position: `fixed bottom-4 left-4 right-4 z-50`
  - Floating pill style with `backdrop-filter: blur(24px)` and safe-area inset bottom padding.
  - **Tabs (5 items)**:
    1. **Dashboard** (SF Icon: `square.grid.2x2.fill`)
    2. **Log Food** (SF Icon: `plus.circle.fill` - Highlighted center action)
    3. **Calculators** (SF Icon: `slider.horizontal.3`)
    4. **Badges** (SF Icon: `flame.fill`)
    5. **Sync & Settings** (SF Icon: `icloud.fill`)

### 2.2 Desktop Layout Architecture
- **Sidebar Panel**: Collapsible left sidebar (`w-64`) with frosted glass background, system logo, navigation links, and mini Google Sync status widget at the bottom.
- **Main Content Area**: 12-Column Responsive CSS Grid dashboard with fluid scaling.

```
+-----------------------------------------------------------------------------------+
|  Header Bar: Logo | Cloud Sync Indicator | Quick Log + | Theme Toggle | Profile    |
+-------------------+---------------------------------------------------------------+
|  SIDEBAR NAV      | MAIN DASHBOARD GRID (12 Columns)                              |
|                   | +------------------------------+ +--------------------------+ |
|  - Dashboard      | | CALORIE FUEL GAUGE WIDGET    | | MACRO SPLIT RINGS        | |
|  - Food Log       | | (Col 1-7)                    | | (Col 8-12)             | |
|  - Indian Tools   | +------------------------------+ +--------------------------+ |
|  - Calculators    | +-------------------+ +-------------------+ +---------------+ |
|  - Badges & Goals | | STREAK COUNTER    | | INDIAN MEAL QUICK | | HYDRATION/WATER| |
|  - Cloud Sync     | | (Col 1-4)         | | LOG (Col 5-8)     | | (Col 9-12)      | |
|                   | +-------------------+ +-------------------+ +---------------+ |
|                   | +-----------------------------------------------------------+ |
|                   | | TODAY'S MEAL LOG LIST WITH KATORI/GRAM UNITS (Col 1-12)   | |
|                   | +-----------------------------------------------------------+ |
+-------------------+---------------------------------------------------------------+
```

---

## 3. Calorie Tracker & Gamification UI Specifications

### 3.1 Fuel Gauge / Battery Energy Widget
Visualizes daily net calories (Consumed vs. Burned vs. Deficit Goal) like an Apple Watch Ring or Tesla Battery Gauge.

- **Visual Components**:
  - Curved horizontal dynamic liquid tube or semi-circular gauge ring.
  - Dual fill indicators: Consumed (Solid Accent) + Planned/Burned Active Calories (Hatched Glass fill).
  - Central Stat Display: Big numerical counter showing **Calories Remaining** with active count animation.
- **Dynamic Status Color States**:
  - **Optimal Deficit (Target Range)**: Glowing Neon Cyan to Apple Ring Green gradient (`#30D158`).
  - **Nearing Maintenance Limit (< 200 kcal left)**: Warning Gold gradient (`#FFD60A`).
  - **Calorie Surplus / Target Exceeded**: Soft Red gradient (`#FF453A`) with subtle glass vibration cue.

### 3.2 Animated Calorie Deficit Streak Counter
- **Visual Design**: 
  - Glass card with a floating 3D Flame Icon (`SF Symbol: flame.fill`).
  - Micro gradient glow pulsating behind the fire icon proportional to streak days (e.g. 14 Days Deficit Streak).
- **Streak Celebration Micro-Animation**:
  - On reaching daily deficit goal, the streak number triggers a smooth CSS spring scale effect (`transform: scale(1.15)` with `cubic-bezier(0.34, 1.56, 0.64, 1)`), accompanied by subtle haptic feedback (mobile) and confetti burst animation.

### 3.3 Gamified 3D-Style Achievement Badges
- **Visual Style**: Apple Watch Activity Challenge inspired metallic/glass translucent badges.
- **Badge Types**:
  1. *Desi Superfood Explorer* (Logged 10+ traditional Indian dishes)
  2. *7-Day Deficit Master* (Maintained targeted calorie deficit for 7 continuous days)
  3. *Protein Beast* (Hit daily protein target 5 days in a row)
  4. *Hydration Monarch* (Logged 3L water daily for 14 days)
- **Interactive Mechanics**:
  - **Hover/Touch 3D Tilt**: Uses CSS `transform: perspective(600px) rotateX(...) rotateY(...)` on cursor move or tilt sensor to cast specular light reflections over the badge glass surface.

### 3.4 Meal Logging Sheet / Modal
- **Mobile**: Swipeable Bottom Sheet (`height: auto; max-height: 85vh; border-top-radius: 32px`).
- **Desktop**: Centered Glass Sheet Dialog (`max-width: 560px`).
- **Layout Features**:
  - Top Search Bar with instant filter & voice input icon.
  - Category Pills: *Breakfast, Lunch, Evening Snack, Dinner, Quick Add*.
  - Macro Preview Footer: Live updates showing added Calories, Protein, Carbs, and Fats before confirming log entry.

---

## 4. Indian Diet & Health Calculator UI Specifications

### 4.1 Indian Serving Unit Selector & Quantity Control
Traditional diet tracking standardizes on grams, but Indian meals rely heavily on household measuring items. The UI provides seamless conversion toggles.

- **Unit Selector Control**: Segmented pill control (`SF Segmented Control` style):
  - `[ Katori ]` | `[ Grams (g) ]` | `[ Piece / Roti ]` | `[ Tbsp / Scoop ]`
- **Katori Standard Preset Drawer**:
  - **Small Katori** (~120 ml / 0.75 standard)
  - **Medium/Standard Katori** (~150 ml / 1.0 standard)
  - **Large Katori** (~220 ml / 1.5 standard)
- **Interactive Stepper Control**:
  - Circular `-` and `+` frosted glass buttons with hold-to-accelerate counting.
  - Real-time recalculation chip below quantity: e.g., `1.5 Medium Katori Dal Tadka = 262 kcal | 13.5g Protein`.

### 4.2 Interactive Health Calculators (BMI / BMR / TDEE / Macro Split)

#### A. Interactive Slider Dual Controls
- Height / Weight / Age sliders with fine-grained numeric input fields.
- Smooth tactile slider handle with live value callout tooltip (`backdrop-blur-md`).

#### B. BMI Visual Spectrum Gauge
- Continuous horizontal spectrum bar divided into standard ranges:
  - `Blue (Underweight < 18.5)` | `Green (Normal 18.5 - 24.9)` | `Yellow (Overweight 25 - 29.9)` | `Red (Obese >= 30)`
- Animated indicator needle marking exact BMI position with a dynamic floating tag (e.g. `22.4 - Healthy Weight`).

#### C. Activity Level Selection Cards for TDEE
Grid of 4 selectable frosted glass cards:
- **Sedentary** (Desk job, little exercise - 1.2x)
- **Lightly Active** (Light exercise 1-3 days/week - 1.375x)
- **Moderately Active** (Moderate workout 3-5 days/week - 1.55x)
- **Very Active** (Intense training 6-7 days/week - 1.725x)

#### D. Macro Split Preset & Visualizer
- Interactive Donut Ring Chart displaying Carb / Protein / Fat proportions.
- Presets:
  - **Balanced Desi**: 50% Carbs, 20% Protein, 30% Fats
  - **High Protein Desi**: 40% Carbs, 35% Protein, 25% Fats
  - **Indian Veg Keto**: 10% Carbs, 20% Protein, 70% Fats

---

## 5. Google Drive Cloud Sync & Authentication UI

### 5.1 Google Auth Button
- **Apple HIG Compliant Design**:
  - Pill-shaped glass container (`rounded-full`) with full-color Google 'G' logo.
  - Text: `"Sign in with Google"` or `"Connect Google Drive"`.
  - Hover state: Subtle specular sheen sweep across the glass button.
  - Loading state: Inline circular progress ring replacing the icon during OAuth token negotiation.

### 5.2 Cloud Status Header Indicator
Prominently located in the top navigation bar / header to reassure the user that data is saved to their personal Google Drive storage.

- **Synced State**:
  - Green glass badge: `[ Icon: icloud.checkmark.fill ] "Synced to Drive"`
  - Text tone: Apple Green (`#30D158`).
- **Syncing State**:
  - Blue glass badge: `[ Icon: arrow.clockwise (rotating) ] "Syncing..."`
- **Offline / Local Fallback State**:
  - Amber glass badge: `[ Icon: icloud.slash ] "Saved Locally (Offline)"`

### 5.3 Sync Conflict & Status Banner
- Top-anchored floating toast / banner notification if connection drops or data merge requires user action.
- Action Buttons inside banner: `"Retry Sync"`, `"View Cloud Files"`, or `"Dismiss"`.

---

## 6. Actionable Implementation Summary

| Component | Target File Location | Core CSS / Framework Utilities |
| :--- | :--- | :--- |
| **Glassmorphism Theme System** | `src/styles/theme.css` | `backdrop-blur-xl bg-white/65 dark:bg-zinc-900/65 border border-white/20 dark:border-white/10` |
| **Mobile Bottom Dock** | `src/components/nav/MobileNav.tsx` | `fixed bottom-4 inset-x-4 h-16 rounded-full backdrop-blur-2xl bg-white/75 dark:bg-black/75 shadow-2xl` |
| **Calorie Fuel Gauge** | `src/components/dashboard/FuelGauge.tsx` | SVG gradient stroke with `stroke-dashoffset` CSS transition & tabular typography |
| **Indian Serving Selector** | `src/components/food/IndianUnitSelector.tsx` | Segmented control tab bar with quantity stepper buttons and Katori volume preset picker |
| **Google Drive Status Pill** | `src/components/sync/CloudStatusPill.tsx` | Animated SVG rotation + dynamic status badge (`#30D158` / `#FF9F0A`) |
