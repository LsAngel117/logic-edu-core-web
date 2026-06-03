# Role-Based Navigation Specification

## Purpose

Filter sidebar nav items and conditionally render the platform admin toolbar based on `user().roles` from AuthService.

## Requirements

### Requirement: Role-Filtered Sidebar

The sidebar MUST read `user().roles` from AuthService and filter visible nav items accordingly. Items not matching the user's roles SHALL be hidden via `@if`.

#### Scenario: PLATFORM_ADMIN sees all items

- GIVEN a user with role `["PLATFORM_ADMIN"]`
- WHEN the sidebar renders
- THEN it SHALL display Dashboard, Users, Schools, and an admin section heading

#### Scenario: SCHOOL_ADMIN sees limited items

- GIVEN a user with role `["SCHOOL_ADMIN"]`
- WHEN the sidebar renders
- THEN it SHALL display Dashboard and Schools, but NOT an admin section

#### Scenario: TEACHER sees limited items

- GIVEN a user with role `["TEACHER"]`
- WHEN the sidebar renders
- THEN it SHALL display Dashboard only, with no admin section or school-management links

#### Scenario: STUDENT sees limited items

- GIVEN a user with role `["STUDENT"]`
- WHEN the sidebar renders
- THEN it SHALL display Dashboard only

#### Scenario: User has no roles

- GIVEN a user with an empty `roles` array
- WHEN the sidebar renders
- THEN it SHALL show only the Dashboard item and SHALL NOT throw

### Requirement: Platform Admin Top Navbar

When the user has `PLATFORM_ADMIN` role, a horizontal navbar SHALL render below the header: 64px tall, white background, sticky. It SHALL contain module-selector chips (Users, Institutions, Academic Control) and a global search input. For all other roles the navbar SHALL NOT appear in the DOM.

#### Scenario: Admin navbar renders for PLATFORM_ADMIN

- GIVEN a user with `["PLATFORM_ADMIN"]`
- WHEN the layout renders
- THEN a sticky top navbar SHALL appear with module chips and a search input

#### Scenario: Admin navbar hidden for other roles

- GIVEN a user with `["SCHOOL_ADMIN"]` or `["TEACHER"]` or `["STUDENT"]`
- WHEN the layout renders
- THEN the admin navbar SHALL NOT be present in the DOM

### Requirement: Runtime Role Re-evaluation

The sidebar and admin navbar SHALL reactively update when `user()` signal changes (e.g., after login or token refresh). No manual refresh required.

#### Scenario: Role change on login

- GIVEN no user (not authenticated)
- WHEN `AuthService.user()` updates to a PLATFORM_ADMIN user
- THEN the sidebar and admin navbar SHALL reflect the new role without a page reload
