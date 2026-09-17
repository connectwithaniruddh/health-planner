# Health Planner design system

Atmospheric personal health workspace. Hallmark pre-emit targets: philosophy 4, hierarchy 5, execution 4, specificity 5, restraint 5, variety 4.

## Shared visual language
App workbench with a slim sidebar, editorial greeting, useful agenda, and contextual detail panels. Nature is confined to a scenic welcome panel; dense information uses quiet readable surfaces. Teal accent, slate ink, warm off-white light surfaces, deep forest dark surfaces. Use named CSS variables in src/index.css.

Typography: system sans for controls/body; Georgia for short editorial headings. 4px spacing scale, 16–28px surface radii. Liquid refraction only on compact navigation/controls; never distort data or use it to encode meaning.

## Interactions
Primary actions use teal fill; secondary actions use restrained outlines. All controls have focus-visible, hover, disabled, and error feedback. Minimum 44px primary targets. Forms retain drafts. Save errors remain visible. Reduced motion/transparency supported. Desktop sidebar and mobile dock share destinations; all actions usable without dragging. No fake device chrome.

## Pages
Today: next actions and chronological agenda. Plan: seven-day workbench with meal inspector, day agenda on mobile. Exercise: library and focused player. Health: dated observation ledger. Insights: actual recorded trends. Settings: profile, privacy, recovery, connections.
