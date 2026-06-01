# Tasks: Phase 0 — Base Técnica

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~100–110 |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | Single PR |
| Delivery strategy | single-pr |
| Chain strategy | size-exception |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: size-exception
400-line budget risk: Low

## Phase 1: Directory Structure & Sentinels

- [x] 1.1 Create `src/app/core/{auth,guards,interceptors,layouts,services}/` dirs with `.gitkeep`
- [x] 1.2 Create `src/app/shared/{components,pipes,directives,models}/` dirs with `.gitkeep`

## Phase 2: Core Implementation

- [x] 2.1 Add `@Component` decorator with inline Material toolbar template (`mat-toolbar` + `router-outlet`) and class export to `src/app/app.ts`
- [x] 2.2 Configure lazy routes (`auth`, `dashboard`) with `redirectTo: 'dashboard'` in `src/app/app.routes.ts`
- [x] 2.3 Add `provideAnimationsAsync()` provider to `src/app/app.config.ts`
- [x] 2.4 Create stub `LoginComponent` and `routes.ts` (path: empty) in `src/app/features/auth/`
- [x] 2.5 Create stub `DashboardComponent` and `routes.ts` (path: empty) in `src/app/features/dashboard/`

## Phase 3: Testing & Verification

- [x] 3.1 Write Vitest smoke test in `src/app/app.spec.ts` using `TestBed.createComponent(App)`
- [x] 3.2 Run `bun ng build` — verify exit 0, no TS errors
- [x] 3.3 Run `bun ng test` — verify all tests pass

## Implementation Order

Phase 1 first (sentinels are independent), then Phase 2 (core files + feature stubs), then Phase 3 (smoke test + full verification). Tasks within a phase can run in listed order (2.1→2.2→2.3→2.4→2.5 has implicit dependency: routes reference lazy modules, stubs must exist).
