# membership-management Specification

## Purpose

Display, assign, and remove role/scope memberships per user in their detail view. Consumes `/api/v1/memberships`.

## Requirements

### Requirement: Memberships Display

The user detail page `/users/:id` MUST render a memberships panel listing all assigned memberships as chips (role + scope label), with a visual indicator of effective permissions.

#### Scenario: User with memberships

- GIVEN a user with 3 memberships
- WHEN viewing `/users/:id`
- THEN the panel SHALL display 3 chips, each showing `{role} @ {scope}`
- AND a tooltip SHALL list the effective permissions for each

#### Scenario: User with no memberships

- GIVEN a user with zero memberships
- WHEN viewing the panel
- THEN the panel SHALL display "No memberships assigned"
- AND an "Add Membership" button SHALL be visible

#### Scenario: Loading state

- GIVEN the memberships request is in flight
- WHEN the panel renders
- THEN a Material progress indicator SHALL be shown
- AND chips SHALL NOT appear until the response arrives

#### Scenario: Network failure

- GIVEN the backend is unreachable
- WHEN the panel tries to load
- THEN the panel SHALL show a retriable error state

### Requirement: Add Membership

The system MUST provide a dialog or inline form to assign a role + scope membership to a user.

#### Scenario: Successful addition

- GIVEN a user and a selected role + scope
- WHEN the admin submits
- THEN `POST /api/v1/memberships` SHALL be called with `{userId, role, scope}`
- AND the new chip SHALL appear in the panel
- AND the effective permissions indicator SHALL update

#### Scenario: Duplicate membership prevented

- GIVEN an identical role+scope already assigned
- WHEN the admin submits
- THEN the backend SHALL respond 409
- AND the dialog SHALL display "This membership already exists"
- AND the form SHALL remain open

#### Scenario: 403 on add

- GIVEN the admin lacks membership management rights
- WHEN submitting
- THEN the service SHALL propagate 403
- AND the dialog SHALL display "Insufficient permissions"

### Requirement: Remove Membership

Each membership chip MUST support removal with confirmation.

#### Scenario: Successful removal

- GIVEN an existing membership
- WHEN the admin clicks remove and confirms
- THEN `DELETE /api/v1/memberships/:id` SHALL be called
- AND the chip SHALL disappear from the panel
- AND a success snackbar SHALL appear

#### Scenario: Last admin membership protected

- GIVEN the target user is the last admin for a scope
- WHEN attempting to remove that membership
- THEN the backend SHALL respond 422
- AND the chip SHALL remain
- AND a snackbar SHALL read "Cannot remove last admin membership"

#### Scenario: Membership deleted externally (404)

- GIVEN a membership removed by another admin
- WHEN attempting to remove it
- THEN `DELETE` SHALL respond 404
- AND the chip SHALL be removed from the UI
- AND a snackbar SHALL read "Membership was already removed"
