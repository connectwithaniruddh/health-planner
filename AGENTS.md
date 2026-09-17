# Health Planner implementation contracts

This is a static GitHub Pages PWA. Never add a server, hosted database, serverless endpoint, private runtime key, or embedded OAuth secret.

## Specialist ownership
- Architect/frontend: private IndexedDB domain, validated migrations, recovery, concurrent writes, hash navigation, offline release, and restore-first onboarding data import.
- UI/UX: shared design.md; light-gray onboarding gradient; readable neutral surfaces; accessible keyboard/mobile/desktop interactions; motivational but optional progress feedback.
- Dietary researcher/dietitian: sourced SQLite catalog, recipe yields and nutrition, allergy exclusions, explainable local ranking, and private user-created food/meal records with editable portions and calorie corrections.
- Health planner: observation context and units, dated trends, MASLD/NAFLD, diabetes, and sedentary desk-work planning context with clinician boundaries; no fabricated measurements or diagnoses.
- Fitness: original/licensed exercise demonstrations and repository-tracked infographics, sets/reps/session recovery, effort-aware user-approved progression, and no invented exercise expenditure.
- Google integration: explicit incremental browser OAuth. Drive restore is the first onboarding option and is limited to `drive.appdata`; Calendar provides timed reminders and Tasks dated completion. Tokens remain in memory and no health data enter event/task descriptions by default.

Independent specialist work may run in parallel with explicit file ownership. Coordinate shared contracts before editing. Existing docs/agent_reports are historical proposals, not medical authority or evidence of implementation; this file is the current source of truth for every specialist.

## Shared contracts
Reference data and original graphics are public and versioned; personal data never enter repository assets or logs. Custom meals/foods are private IndexedDB records, never catalog writes. Missing nutrients are unknown, not zero. Generated selections are not preference events. Planned meals are distinct from eaten logs. Exercise calories do not automatically increase food allowance.

## Onboarding and experience contract
- The first screen must offer **Connect Google & restore saved items** and **Continue with this device**. Google restore requires the user to explicitly authorize the Drive app-data scope and must preserve local records if validation fails.
- Onboarding must be resumable, motivational, and usable without Google. Use real profile inputs for sliders, estimates, progress, or charts; never insert sample measurements, diagnoses, fasting state, or implied clinical outcomes.
- Keep the onboarding background a light-gray gradient. Dark/light appearance settings apply after setup. Maintain readable contrast, visible focus states, reduced-motion support, and 320px layouts.
- Ship visual assets under `public/graphics/` with code, license/provenance, and service-worker caching. Do not depend on remote image hosts for core exercise demonstrations.

## Verification
Run domain tests, TypeScript/build, catalog validation, and Playwright flows. Verify the restore-first onboarding, Drive-backup absence/failure behavior, /health-planner/ base path, hash refresh, workers/WASM, offline restart, migration, exports, allergy constraints, personal-food persistence, calorie/portion overrides, Google deduplication, Asia/Kolkata dates, responsive keyboard access, and installed-PWA updates. Never claim clinical validation without a real qualified review.
