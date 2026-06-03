# Dashboard Home Specification

## Purpose

Authenticated landing page showing a personalized welcome, summary statistics, and quick-access navigation to main modules.

## Requirements

### Requirement: Welcome Message

The dashboard MUST display a greeting `Bienvenido, {fullName}` using the current user's `fullName` from AuthService.

#### Scenario: Welcome displays user name

- GIVEN an authenticated user with `fullName: "María García"`
- WHEN the dashboard loads
- THEN the heading SHALL read `Bienvenido, María García`

#### Scenario: Fallback when fullName is empty

- GIVEN an authenticated user with no `fullName` set
- WHEN the dashboard loads
- THEN the heading SHALL fall back to the user's `email` or `username`

### Requirement: Quick Stat Cards

The dashboard MUST render stat cards (placeholder data): total users, total schools, and total branches. Each card SHALL display a numeric value, a label, and an icon.

#### Scenario: Stat cards render

- GIVEN the dashboard component
- WHEN initialized
- THEN the DOM SHALL contain at least three stat cards: "Usuarios", "Instituciones", "Sedes"

### Requirement: Quick Links

The dashboard MUST provide quick-link cards to `/users` and `/schools`. Each link SHALL use `RouterLink` and display a descriptive label.

#### Scenario: Quick links navigate correctly

- GIVEN the dashboard page
- WHEN the user clicks the "Usuarios" quick link
- THEN the router SHALL navigate to `/users`

#### Scenario: Quick links navigate to schools

- GIVEN the dashboard page
- WHEN the user clicks the "Instituciones" quick link
- THEN the router SHALL navigate to `/schools`
