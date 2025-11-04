# Repository Guidelines

## Project Structure & Module Organization
The game client is a Vue 3 + TypeScript app under `src/`, with `components/` for shared UI, `views/` for routed scenes, `stores/` for Pinia state, `composables/` for reusable hooks, and `locales/` for translation bundles. Static artwork and poem JSON live in `public/resource/`. Express helpers remain in `server/` (`server/server.js`, scripts in `server/scripts/`). Test suites mirror the UI layout under `tests/`, and extended docs are in `doc/`.

## Build, Test, and Development Commands
- `npm run dev`: Vite dev server; pair with `npm run server:dev` when touching proxy routes.
- `npm run dev:full`: boots client and Express watcher together via `concurrently`.
- `npm run build`: type-check with `vue-tsc` and emit production assets to `dist/`.
- `npm run build:full`: builds the client then starts `server/server.js` for smoke tests.
- `npm run test`, `test:run`, `test:coverage`: Vitest in watch, CI, and coverage modes (output in `coverage/`).
- `npm run test:poem` and `test:verify-fetch`: content sanity checks for poem data and fallback fetch logic.
- Quality gates: `npm run lint` (ESLint) and `npm run format` (Prettier over `src/`).

## Coding Style & Naming Conventions
Use 2-space indentation and `<script setup lang="ts">` in SFCs. Name components in PascalCase, composables `useX`, stores `useXStore`, and utilities in kebab-case. Favor Tailwind utility classes for layout. Keep locale keys synchronized across `locales/`. Only touch generated artifacts (`dist/`, `components.d.ts`) through their scripts.
The code quality principles are as follows: DRY, YAGNI, SOLID, and KISS.

## Testing Guidelines
Vitest with `@vue/test-utils` powers the UI tests located in `tests/`; name specs `*.spec.ts` and reuse `tests/setup.ts` for global mocks. Add fixtures under `tests/mocks/` to avoid brittle snapshots. Maintain ≥80% line coverage for critical layers (stores, composables, router guards) to match `doc/TEST_REPORTS.md`. Backend scripts rely on Jest via `server/test` and `server/jest.config.cjs`; run them when modifying Express helpers.

## Commit & Pull Request Guidelines
Follow Conventional Commits (e.g., `feat(i18n): add spanish hints`). Keep the body focused on the behavior change and note doc updates or data migrations. PRs should list impacted modules, commands executed (tests/lint), linked issues, and screenshots or GIFs for UI tweaks. Ping both a front-end and server reviewer whenever API contracts or shared models change.

## Security & Configuration Tips
Copy `.env.example` or `server/env.example` before local testing; never commit filled `.env` files. Use `npm run logs:help` to rotate server logs and leave artifacts out of Git. Secrets for LLM or cloud providers belong in Capacitor platform configs, not the repo.
