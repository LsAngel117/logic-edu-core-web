# Spec: Phase 0 — Base Técnica

## Purpose

Establish a compilable, runnable Angular 21 application skeleton with the agreed architecture. This phase delivers no functional capabilities — it lays the infrastructure for all subsequent phases.

## Requirements

### Requirement: App root component

The root component MUST use the `@Component` decorator with `RouterOutlet` in its template, and MUST export its class.

#### Scenario: App scaffolding compiles

- GIVEN `src/app/app.ts`
- WHEN the decorator, template, and class body are defined
- THEN the component MUST have `@Component` with `RouterOutlet` import
- AND the class body MUST be exported

### Requirement: Root layout with Material toolbar

The root component template MUST render a Material toolbar containing the application title "LogicEdu" followed by a `<router-outlet>` for routed content.

#### Scenario: Shell renders correctly

- GIVEN the app is bootstrapped
- WHEN the root component renders
- THEN a `<mat-toolbar>` with the text "LogicEdu" SHALL appear at the top
- AND a `<router-outlet>` SHALL render below it

### Requirement: Base route structure

The route configuration MUST define a default redirect to `/auth/login` and lazy-loaded stubs for `auth` and `dashboard`.

#### Scenario: Default redirect

- GIVEN the app is loaded at `/`
- WHEN the router resolves the root path
- THEN the user SHALL be redirected to `/auth/login`

#### Scenario: Auth route resolves

- GIVEN the route `/auth/login`
- WHEN the router processes the path
- THEN it MUST load the `AuthComponent` via lazy import

#### Scenario: Dashboard route resolves

- GIVEN the route `/dashboard`
- WHEN the router processes the path
- THEN it MUST load the `DashboardComponent` via lazy import

### Requirement: Material animation provider

The `app.config.ts` MUST include `provideAnimationsAsync()` for Angular Material animations.

#### Scenario: Animations are available

- GIVEN the application configuration
- WHEN the app is bootstrapped
- THEN `provideAnimationsAsync()` SHALL be registered as a provider
- AND Material components SHALL animate correctly

### Requirement: Directory structure sentinels

The `core/`, `shared/`, and `features/` directories MUST contain a `.gitkeep` file to preserve the directory tree in version control.

#### Scenario: Core directory is tracked

- GIVEN the `src/app/core/` directory
- WHEN inspecting its contents
- THEN a `.gitkeep` file SHALL exist

#### Scenario: Shared directory is tracked

- GIVEN the `src/app/shared/` directory
- WHEN inspecting its contents
- THEN a `.gitkeep` file SHALL exist

#### Scenario: Features directory is tracked

- GIVEN the `src/app/features/` directory
- WHEN inspecting its contents
- THEN a `.gitkeep` file SHALL exist

### Requirement: Vitest configuration and smoke test

The project MUST configure Vitest via `angular.json` and include a smoke test that bootstraps the App component.

#### Scenario: Build succeeds

- GIVEN the project is set up
- WHEN running `bun ng build`
- THEN the build SHALL exit with code 0

#### Scenario: Test passes

- GIVEN the project is configured for Vitest
- WHEN running `bun ng test`
- THEN all tests SHALL pass
- AND the smoke test SHALL confirm the App component renders without errors

### Requirement: Build and test verification

The application MUST compile and pass tests before the phase is considered complete. No TypeScript errors or test failures are permitted.

#### Scenario: Full verification

- GIVEN all Phase 0 changes are applied
- WHEN running `bun ng build`
- THEN the build SHALL succeed (exit code 0)
- AND `bun ng test` SHALL also pass (exit code 0)
