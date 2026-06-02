# school-management Specification

## Purpose

CRUD UI for `/api/v1/schools`. List, create, edit, and toggle status. Restricted to PLATFORM_ADMIN by membership scope; SCHOOL_ADMIN has read-only access to their own school.

## Requirements

### Requirement: School List Page

Material table at `/schools` with sortable columns (name, code, status, branch count), search input, and status filter chips.

#### Scenario: Loads and lists schools

- GIVEN an authenticated admin
- WHEN navigating to `/schools`
- THEN the table SHALL display a paginated list from `GET /api/v1/schools`
- AND search + filters SHALL be empty
- AND the branch count column SHALL display the count from the response

#### Scenario: Empty list

- GIVEN no schools exist
- WHEN the list loads
- THEN the table SHALL show "No schools found"

#### Scenario: Search filters by name

- GIVEN a populated list
- WHEN typing a search term
- THEN `GET /api/v1/schools?q={term}` SHALL be called
- AND the table SHALL update with matching results

#### Scenario: Filter by status

- GIVEN schools with mixed status
- WHEN selecting a status chip (active / inactive)
- THEN `GET /api/v1/schools?status={value}` SHALL be called
- AND the table SHALL update to show only matching schools

#### Scenario: Combined search + filter

- GIVEN a populated list
- WHEN typing a search term AND selecting a status filter
- THEN `GET /api/v1/schools?q={term}&status={value}` SHALL be called
- AND the table SHALL reflect both constraints

#### Scenario: Network failure

- GIVEN backend unreachable
- WHEN the list loads
- THEN a retriable error banner SHALL appear

#### Scenario: 403 forbidden

- GIVEN a user without PLATFORM_ADMIN role
- WHEN navigating to `/schools`
- THEN the guard SHALL redirect or show "Insufficient permissions"

### Requirement: School Detail View

Read-only summary panel accessible by clicking a school row, showing full address, creation date, and branch count. Alternatively, this can be embedded as an expandable row or a side panel — the spec does not prescribe the UI pattern.

#### Scenario: View school details

- GIVEN a school selected from the list
- WHEN clicking the row
- THEN a detail view SHALL display name, code, address, status, creation date, and branch count
- AND "Edit" and "Branches" action buttons SHALL be present

#### Scenario: Row click navigates to branches

- GIVEN a school displayed
- WHEN clicking the "Branches" button or the branch count
- THEN the app SHALL navigate to `/schools/{id}/branches`

### Requirement: Create School

Dialog with name (required), code (required, unique), and address (optional).

#### Scenario: Successful creation

- GIVEN valid data for all required fields
- WHEN submitted
- THEN `POST /api/v1/schools` SHALL be called with `{name, code, address}`
- AND the dialog SHALL close
- AND the table SHALL refresh with the new school at the top
- AND a success snackbar SHALL appear

#### Scenario: Duplicate code

- GIVEN an existing school code
- WHEN submitted
- THEN a 409 response SHALL show "A school with this code already exists"
- AND the dialog SHALL remain open
- AND the code field SHALL be marked as invalid

#### Scenario: Duplicate name

- GIVEN an existing school name
- WHEN submitted
- THEN a 409 response SHALL show "A school with this name already exists"
- AND the dialog SHALL remain open

#### Scenario: Validation errors

- GIVEN missing required fields (name, code)
- WHEN clicking submit
- THEN invalid fields SHALL be highlighted with "Required" message
- AND `POST` SHALL NOT fire

#### Scenario: Code format validation

- GIVEN a code with special characters or spaces
- WHEN submitting
- THEN client-side validation SHALL flag the code field as invalid
- AND `POST` SHALL NOT fire
- AND a hint SHALL explain the allowed format (alphanumeric, uppercase, hyphens allowed)

#### Scenario: 403 forbidden

- GIVEN insufficient rights (SCHOOL_ADMIN)
- WHEN opening the create dialog
- THEN the create button SHALL be hidden or disabled in the toolbar
- AND direct navigation to the dialog SHALL show "Insufficient permissions"

### Requirement: Edit School

Edit dialog pre-filled with current name, code, and address. Code field SHALL be read-only or editable with caution because changing it may cascade.

#### Scenario: Successful edit

- GIVEN a school selected
- WHEN editing name or address and submitting
- THEN `PUT /api/v1/schools/:id` SHALL be called with the updated fields
- AND the dialog SHALL close
- AND the table row SHALL update
- AND a success snackbar SHALL appear

#### Scenario: School deleted meanwhile (404)

- GIVEN an open edit dialog
- WHEN the target school is deleted by another admin
- THEN a 404 response SHALL show "School no longer exists"
- AND the dialog SHALL close
- AND the row SHALL be removed from the table

#### Scenario: Duplicate name on edit

- GIVEN a name changed to one already used by another school
- WHEN submitting
- THEN a 409 response SHALL show "A school with this name already exists"
- AND the dialog SHALL remain open

#### Scenario: Code change propagation warning

- GIVEN the code field is editable
- WHEN the admin modifies the code
- THEN a warning SHALL display: "Changing the code may affect integrations. Are you sure?"
- AND the admin SHALL confirm before `PUT` proceeds

### Requirement: Status Toggle

Activate/deactivate toggle per row with confirmation dialog.

#### Scenario: Deactivate school

- GIVEN an active school
- WHEN clicking deactivate and confirming
- THEN `PATCH /api/v1/schools/:id/status` SHALL be called with `{status: "INACTIVE"}`
- AND the status chip SHALL update to inactive
- AND a success snackbar SHALL appear

#### Scenario: Activate school

- GIVEN an inactive school
- WHEN clicking activate and confirming
- THEN `PATCH /api/v1/schools/:id/status` SHALL be called with `{status: "ACTIVE"}`
- AND the status chip SHALL update to active

#### Scenario: Deactivate school with active branches

- GIVEN a school that has active branches
- WHEN attempting to deactivate
- THEN a confirmation dialog SHALL warn: "This school has {n} active branches. Deactivating will also deactivate all its branches."
- AND on confirm, `PATCH /api/v1/schools/:id/status` SHALL cascade-deactivate branches
- AND a snackbar SHALL confirm "School and {n} branches deactivated"

#### Scenario: Business rule violation (422)

- GIVEN a status toggle request
- WHEN the backend responds 422
- THEN the toggle SHALL revert to its previous state
- AND a snackbar SHALL display the backend error message

#### Scenario: Self-school protection

- GIVEN the admin's own school (from their membership scope)
- WHEN attempting to deactivate it
- THEN the toggle SHALL be disabled with tooltip "Cannot deactivate your own school"
