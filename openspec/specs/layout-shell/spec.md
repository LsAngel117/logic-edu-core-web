# Layout Shell Specification

## Purpose

Main navigation shell that wraps all authenticated routes: sidebar navigation, header bar, and a content outlet.

## Requirements

### Requirement: Layout Shell

The system MUST render a full-viewport layout composed of a vertical sidebar (left) and a content area (right) with a header bar and `<router-outlet>`. The layout SHALL use `OnPush` change detection.

#### Scenario: Full layout renders

- GIVEN an authenticated user navigating to any protected route
- WHEN the layout component initializes
- THEN the DOM SHALL contain a sidebar region, a header bar, and a `<router-outlet>` content area

#### Scenario: Viewport fills

- GIVEN the layout component
- WHEN rendered
- THEN it SHALL occupy `100vh` height with `display: flex`, sidebar fixed on the left and content area scrolling independently

### Requirement: Vertical Sidebar

The sidebar MUST be 260px wide with `background: #111827`. It MUST display Lucide-icon nav items for Dashboard (`/dashboard`), Users (`/users`), and Schools (`/schools`). The active route SHALL show a 3px left border with `color: #4F46E5`. The sidebar MUST be collapsible to icon-only mode (64px) via a toggle button. In collapsed mode, hovering an icon SHALL show a tooltip with the item label. A footer SHALL display the app version or branding.

#### Scenario: Sidebar renders nav items

- GIVEN the sidebar component
- WHEN initialized with nav item config
- THEN each item SHALL display a Lucide icon and a label, and the active item SHALL have a 3px left border

#### Scenario: Sidebar collapses to icon-only

- GIVEN the sidebar is expanded
- WHEN the user clicks the collapse toggle
- THEN the sidebar SHALL resize to 64px, show only icons, and hide labels

#### Scenario: Collapsed sidebar shows tooltip on hover

- GIVEN the sidebar is collapsed (icon-only)
- WHEN the user hovers over a nav icon
- THEN a tooltip SHALL display the item's label text

### Requirement: Header Bar

The header MUST be 64px tall, white background, with `border-bottom`. On the left it SHALL contain a hamburger icon to toggle the sidebar. On the right it SHALL display the user's `fullName`, an avatar placeholder, and a logout button with a Lucide log-out icon. Clicking logout SHALL call `AuthService.logout()` and navigate to `/auth/login`.

#### Scenario: Header displays user info and logout

- GIVEN an authenticated user
- WHEN the header renders
- THEN it SHALL show `user().fullName`, an avatar placeholder circle, and a logout icon

#### Scenario: Logout clears session

- GIVEN the user clicks the logout button
- WHEN `AuthService.logout()` completes
- THEN the user SHALL be redirected to `/auth/login`

#### Scenario: No authenticated user

- GIVEN no user in AuthService (edge case in guarded routes)
- WHEN the header attempts to render
- THEN it SHALL NOT throw; it SHALL show a placeholder or empty state

### Requirement: Responsive Behavior

On mobile (≤768px) the layout SHALL show a hamburger menu that toggles the sidebar as an overlay. On tablet (768–1024px) the sidebar SHALL default to collapsed (icon-only). Below 640px the sidebar SHALL be hidden by default.

#### Scenario: Mobile sidebar overlay

- GIVEN a viewport width ≤768px
- WHEN the layout renders
- THEN the sidebar SHALL be hidden by default, and a hamburger icon in the header SHALL toggle it as an overlay
