# Design: Phase 0 — Base Técnica

## Technical Approach

Fix the broken `app.ts` by adding `@Component` decorator with an inline template containing a Material toolbar and `<router-outlet>`. Populate routes with lazy-loaded stubs for `auth` and `dashboard`, with a default redirect to `/auth/login`. Wire `provideAnimationsAsync()` into `app.config.ts`. Create `.gitkeep` sentinels in `core/` and `shared/` subdirectories. Add a Vitest smoke test that bootstraps the App component.

No functional capabilities — infrastructure-only.

## Component Tree

```
AppComponent
├── mat-toolbar (inline, "LogicEdu" title)
└── router-outlet
    ├── /auth/login  → AuthComponent  (lazy, stub)
    └── /dashboard   → DashboardComponent (lazy, stub)
```

No separate LayoutComponent — the toolbar is inlined in `AppComponent` because Phase 0 has no shared shell abstraction yet.

## Architecture Decisions

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Inline toolbar vs separate LayoutComponent | LayoutComponent adds indirection for a single-element shell; inline is simpler | Inline in App — extract later when navbar/sidebar join |
| `loadChildren` per feature vs flat routes | Flat routes require all components upfront; lazy loading enables future route-level guards | `loadChildren` with feature-level `routes.ts` |
| Vitest via `@angular/build:unit-test` vs standalone `vitest.config.ts` | Standalone config duplicates Angular's built-in integration; the builder already handles module resolution + browser globals | No custom vitest config — rely on Angular builder |

## File Manifest

| File | Action | Description |
|------|--------|-------------|
| `src/app/app.ts` | Modify | Add `@Component` with inline toolbar template + class export |
| `src/app/app.routes.ts` | Modify | Add redirect + lazy `auth`/`dashboard` routes |
| `src/app/app.config.ts` | Modify | Add `provideAnimationsAsync()` |
| `src/app/core/auth/.gitkeep` | Create | Sentinel |
| `src/app/core/guards/.gitkeep` | Create | Sentinel |
| `src/app/core/interceptors/.gitkeep` | Create | Sentinel |
| `src/app/core/layouts/.gitkeep` | Create | Sentinel |
| `src/app/core/services/.gitkeep` | Create | Sentinel |
| `src/app/shared/components/.gitkeep` | Create | Sentinel |
| `src/app/shared/pipes/.gitkeep` | Create | Sentinel |
| `src/app/shared/directives/.gitkeep` | Create | Sentinel |
| `src/app/shared/models/.gitkeep` | Create | Sentinel |
| `src/app/features/auth/auth.ts` | Create | Stub `AuthComponent` for route resolution |
| `src/app/features/auth/routes.ts` | Create | `{ path: 'login', component: AuthComponent }` |
| `src/app/features/dashboard/dashboard.ts` | Create | Stub `DashboardComponent` for route resolution |
| `src/app/features/dashboard/routes.ts` | Create | `{ path: '', component: DashboardComponent }` |
| `src/app/app.spec.ts` | Create | Vitest smoke test via `TestBed.createComponent(App)` |

**Create**: 14 files | **Modify**: 3 files | **Delete**: 0

## Route Configuration Shape

```typescript
// app.routes.ts
const routes: Routes = [
  { path: '', redirectTo: 'auth/login', pathMatch: 'full' },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/routes').then(m => m.routes)
  },
  {
    path: 'dashboard',
    loadChildren: () => import('./features/dashboard/routes').then(m => m.routes)
  }
];
```

Each feature exposes its own `routes` array from its `routes.ts`, enabling future guards, resolvers, and nested children without touching the root config.

## Provider Configuration

```typescript
// app.config.ts (modified)
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideAnimationsAsync()   // ← added
  ]
};
```

`provideAnimationsAsync()` replaces the deprecated `provideAnimations()` and is required by Angular Material ~21.

## Test Setup

**Runner**: Vitest v4.0.8 via `@angular/build:unit-test` builder.

**No additional config file needed** — `tsconfig.spec.json` already includes `vitest/globals` types and matches `src/**/*.spec.ts`. The Angular builder handles browser environment setup.

**Smoke test approach**:
```typescript
// app.spec.ts
import { TestBed } from '@angular/core/testing';
import { App } from './app';

describe('App', () => {
  it('should bootstrap without errors', async () => {
    const fixture = await TestBed.createComponent(App);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
```

**Verification commands**:
- `bun ng build` — must exit 0, no TS errors
- `bun ng test` — must exit 0, smoke test passes

## Conventions Applied

| Convention | Source | Applied |
|-----------|--------|---------|
| No `.component`/`.service` suffixes | angular-architecture | `app.ts`, `auth.ts`, `dashboard.ts` |
| `inject()` over constructor | angular-core | Stub components use `inject()` if needed |
| Standalone components | angular-core | All components standalone (default in v21) |
| `OnPush` change detection | project context | Default on all components |
| `input()`/`output()`/`model()` functions | angular-core | Used when stubs get real inputs |
| No lifecycle hooks | angular-core | `effect()` when reactivity needed |
| 2-space indent, single quotes, Prettier | project context | All files |
| SCSS for styles | angular.json schematics | `styles.scss` already configured |

## Open Questions

None — all design decisions are resolved for this phase. No blocking unknowns.
