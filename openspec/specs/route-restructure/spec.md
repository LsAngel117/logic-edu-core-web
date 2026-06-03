# Route Restructure Specification

## Purpose

Restructure application routes so all authenticated pages render inside the layout shell while the login page remains independent.

## Requirements

### Requirement: Layout-Wrapped Authenticated Routes

All authenticated routes (`/dashboard`, `/users`, `/schools`) MUST nest under a parent route that resolves the `AppLayout` component. The layout component SHALL apply `canActivate: [authGuard]` so that the guard protects all child routes at once.

#### Scenario: Authenticated route renders inside layout

- GIVEN an authenticated user
- WHEN navigating to `/dashboard`
- THEN the page SHALL render inside the layout shell (sidebar + header visible)

#### Scenario: Unauthenticated redirect

- GIVEN no authenticated user
- WHEN navigating to `/dashboard`
- THEN the authGuard SHALL redirect to `/auth/login`

#### Scenario: Direct child route under layout

- GIVEN the route configuration
- WHEN resolving `/users`
- THEN the Users feature route SHALL be a child of the layout parent, inheriting the layout shell

### Requirement: Flat Login Route

The `/auth/login` route MUST remain outside the layout parent, with no sidebar or header.

#### Scenario: Login renders without layout

- GIVEN a user visiting `/auth/login`
- WHEN the route resolves
- THEN the login component SHALL render WITHOUT the layout shell

### Requirement: Default Redirect

An empty path `/` MUST redirect to `/dashboard`.

#### Scenario: Root redirect

- GIVEN a user accessing `/`
- WHEN the router resolves
- THEN it SHALL redirect to `/dashboard`

### Requirement: Existing Feature Routes Preserved

Each feature route (`users`, `schools`, `dashboard`) SHALL continue using `loadChildren` for lazy loading. The layout parent SHALL use `loadChildren` as well.

#### Scenario: Lazy loading preserved

- GIVEN the route configuration
- WHEN any protected route is accessed
- THEN the feature module SHALL be lazy-loaded via `loadChildren`
