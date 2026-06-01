# Proposal: Phase 0 — Base Técnica

## Intent

Establish a compilable, runnable Angular 21 application with the agreed architecture skeleton. `app.ts` is incomplete (missing `@Component` decorator), routes are empty, and `core/shared/features` exist as empty directories. Without this phase, no development can start or be verified.

## Scope

### In Scope
- Fix `app.ts`: add `@Component` decorator, `RouterOutlet` template, class export
- Define root layout with Material toolbar + router outlet shell
- Set up base routes with a default redirect and lazy-loaded placeholders
- Configure Angular Material provider in `app.config.ts`
- Confirm global styles compile (Material 3 theming)
- Validate bun/package manager integration
- Create sentinel files under `core/shared/features` to prevent tree-shaking
- Configure Vitest runner and add a smoke test

### Out of Scope
- Auth, guards, interceptors, HTTP layer (Phase 1+)
- Feature module implementation (Phases 1+)
- API integration or backend connectivity

## Capabilities

### New Capabilities
None — infrastructure-only phase, no functional capabilities introduced.

### Modified Capabilities
None — no existing specs in `openspec/specs/` to modify.

## Approach

1. **Fix app.ts**: Add `@Component` decorator with `RouterOutlet` import, inline template with toolbar scaffold, export class `App`.
2. **Root layout**: Wrap `<router-outlet>` in a Material toolbar + content area shell.
3. **Routes**: Define lazy route stubs for `auth` and `dashboard`; add `redirectTo: 'auth/login'`.
4. **Material**: Add `provideAnimationsAsync()` to `app.config.ts` for Material animations.
5. **Structure**: Place `.gitkeep` files under `core/`, `shared/`, `features/` to commit the structure.
6. **Vitest**: Configure via `angular.json` test builder; add a smoke test that bootstraps `App`.
7. **Verify**: `bun install && bun ng build` succeeds, `bun ng test` passes.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/app/app.ts` | Modified | Add @Component decorator + class |
| `src/app/app.routes.ts` | Modified | Define base route structure |
| `src/app/app.config.ts` | Modified | Add Material + animation providers |
| `src/app/core/` | New | Add `.gitkeep` sentinel |
| `src/app/shared/` | New | Add `.gitkeep` sentinel |
| `src/app/features/` | New | Add `.gitkeep` sentinel |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| bun incompatibility with Angular CLI | Low | `angular.json` already set for bun; verify with `bun ng build` |
| Vitest builder config not finding tests | Medium | Add explicit `test` block in `angular.json` pointing to `src/` |
| Material animation provider missing | Low | Add `provideAnimationsAsync()` — standard Angular Material setup |

## Rollback Plan

All changes are additive or self-contained. Revert with `git checkout -- .` on the changed files. No schema migrations or side effects.

## Dependencies

- bun 1.2.5 (packageManager in `package.json`)
- Angular CLI 21.2.13 (in `node_modules`)
- Angular Material ~21.2.13 (in `node_modules`)

## Success Criteria

- [ ] `bun ng build` exits with code 0
- [ ] `bun ng serve` starts and the browser renders the toolbar shell at localhost
- [ ] `bun ng test` passes the smoke test
- [ ] Material 3 theme CSS variables appear in the rendered page
