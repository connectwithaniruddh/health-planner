# Health Planner design system

Atmospheric personal health workspace. Hallmark pre-emit targets: philosophy 4, hierarchy 5, execution 4, specificity 5, restraint 5, variety 4.

## Shared visual language
App workbench with a slim sidebar, editorial greeting, useful agenda, and contextual detail panels. Dense information uses quiet readable surfaces. The signed-in workbench is monochrome: black, white, and neutral grays. The onboarding surface uses a light-gray gradient so connection and recovery feel welcoming rather than clinical. Use named CSS variables in src/index.css.

Typography: system sans for controls/body; Georgia for short editorial headings. 4px spacing scale, 16–28px surface radii. Liquid refraction only on compact navigation/controls; never distort data or use it to encode meaning.

## Interactions
Primary actions use high-contrast black or white fill according to context; secondary actions use restrained outlines. The first onboarding screen always presents Drive restore and local-only continuation with equal clarity. Onboarding uses a clear completion score, a small illustrative trend graphic, real-input slider feedback, and encouraging copy without gamifying medical outcomes. All controls have focus-visible, hover, disabled, and error feedback. Minimum 44px primary targets. Forms retain drafts. Save errors remain visible. Reduced motion/transparency supported. Desktop sidebar and mobile dock share destinations; all actions usable without dragging. No fake device chrome.

## Pages
Onboarding: restore-first connection, local continuation, motivational progress, and real-input metrics. Today: next actions and chronological agenda. Plan: editable 30-day workbench with private custom foods/meals, favorite preferences, quantities, calorie corrections, and day agenda on mobile. Exercise: library, original bundled infographics, and focused player. Health: dated observation ledger. Insights: interactive actual-recorded trends. Settings: profile, privacy, recovery, connections.
