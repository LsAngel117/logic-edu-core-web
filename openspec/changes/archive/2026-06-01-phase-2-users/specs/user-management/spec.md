# user-management Specification

## Purpose

CRUD UI for `/api/v1/users`. List, create, edit, toggle status, change passwords. Restricted to PLATFORM_ADMIN / SCHOOL_ADMIN by membership scope.

## Requirements

### Requirement: User List Page

Material table at `/users` with sortable columns (name, email, role, status), search input, and role/status filter chips.

#### Scenario: Loads and lists users

- GIVEN an authenticated admin
- WHEN navigating to `/users`
- THEN the table SHALL display a paginated list from `GET /api/v1/users`
- AND search + filters SHALL be empty

#### Scenario: Empty list

- GIVEN no users exist
- WHEN the list loads
- THEN the table SHALL show "No users found"

#### Scenario: Search filters results

- GIVEN a populated list
- WHEN typing a search term
- THEN `GET /api/v1/users?q={term}` SHALL be called
- AND the table SHALL update

#### Scenario: Network failure

- GIVEN backend unreachable
- WHEN the list loads
- THEN a retriable error banner SHALL appear

### Requirement: Create User

Dialog with email, displayName, password, and roles.

#### Scenario: Successful creation

- GIVEN valid data
- WHEN submitted
- THEN `POST /api/v1/users` SHALL be called
- AND the dialog SHALL close
- AND the table SHALL refresh

#### Scenario: Duplicate email

- GIVEN an existing email
- WHEN submitted
- THEN a 409 response SHALL show "Email already in use"
- AND the dialog SHALL remain open

#### Scenario: Validation errors

- GIVEN missing required fields
- WHEN clicking submit
- THEN invalid fields SHALL be highlighted
- AND `POST` SHALL NOT fire

#### Scenario: 403 forbidden

- GIVEN insufficient rights
- WHEN submitting
- THEN the dialog SHALL show "Insufficient permissions"

### Requirement: Edit User

Edit dialog pre-filled with current name, email, and roles.

#### Scenario: Successful edit

- GIVEN a user selected
- WHEN editing and submitting
- THEN `PUT /api/v1/users/:id` SHALL be called
- AND the dialog SHALL close with table update

#### Scenario: User deleted meanwhile

- GIVEN an open edit dialog
- WHEN the target user is deleted by another admin
- THEN a 404 response SHALL show "User no longer exists"
- AND the dialog SHALL close

### Requirement: Status Toggle

Activate/deactivate toggle per row with confirmation.

#### Scenario: Deactivate user

- GIVEN an active user
- WHEN clicking deactivate and confirming
- THEN `PATCH /api/v1/users/:id/status` SHALL be called
- AND the status chip SHALL update

#### Scenario: Self-toggle disabled

- GIVEN the admin's own row
- WHEN clicking deactivate
- THEN the toggle SHALL be disabled with tooltip "Cannot deactivate yourself"

#### Scenario: Business rule violation

- GIVEN a deactivation request
- WHEN the backend responds 422
- THEN the toggle SHALL revert
- AND a snackbar SHALL show the error

### Requirement: Change Password

Dialog with new-password and confirm-password fields.

#### Scenario: Password changed

- GIVEN a user selected
- WHEN submitting matching passwords
- THEN `POST /api/v1/users/:id/password` SHALL be called
- AND a success snackbar SHALL appear

#### Scenario: Mismatch prevented

- GIVEN non-matching confirmation
- WHEN submitting
- THEN the form SHALL highlight the mismatch
- AND the API SHALL NOT be called

#### Scenario: Weak password

- GIVEN a password failing policy
- WHEN submitted
- THEN a 422 response SHALL display the validation error
