# Health Planner implementation contracts

This is a static GitHub Pages PWA. Never add a server, hosted database, serverless endpoint, private runtime key, or embedded OAuth secret.

## Specialist ownership
- Architect/frontend: private IndexedDB domain, validated migrations, recovery, concurrent writes, hash navigation, offline release.
- UI/UX: shared design.md, readable glass surfaces, accessible keyboard/mobile/desktop interactions.
- Dietary researcher/dietitian: sourced SQLite catalog, recipe yields and nutrition, allergy exclusions, explainable local ranking.
- Health planner: observation context and units, condition guidance and clinician boundaries; no fabricated measurements or diagnoses.
- Fitness: original/licensed exercise demonstrations, sets/reps/session recovery, effort-aware user-approved progression.
- Google integration: incremental browser OAuth, Calendar timing, Tasks dated completion, persistent IDs/queue/conflicts.

Independent specialist work may run in parallel with explicit file ownership. Coordinate shared contracts before editing. Existing docs/agent_reports are historical proposals, not medical authority or evidence of implementation.

## Shared contracts
Reference data are public and versioned; personal data never enter repository assets or logs. Missing nutrients are unknown, not zero. Generated selections are not preference events. Planned meals are distinct from eaten logs. Exercise calories do not automatically increase food allowance.

## Verification
Run domain tests, TypeScript/build, catalog validation, and Playwright flows. Verify /health-planner/ base path, hash refresh, workers/WASM, offline restart, migration, exports, allergy constraints, Google deduplication, Asia/Kolkata dates, responsive keyboard access. Never claim clinical validation without a real qualified review.
