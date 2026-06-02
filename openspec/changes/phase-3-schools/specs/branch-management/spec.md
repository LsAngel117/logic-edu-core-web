# branch-management Specification

## Purpose

CRUD UI for `/api/v1/branches`. List branches per school, create, edit, and toggle status. Uses the flat endpoint pattern: `GET /api/v1/branches?schoolId=:id` for listing, `/api/v1/branches` for CRUD. Restricted to PLATFORM_ADMIN and SCHOOL_ADMIN within their scope.

## Requirements

### Requirement: Branches List Page

Material table at `/schools/{schoolId}/branches` with sortable columns (name, code, status, address), search input, and status filter chips. The school context SHALL be displayed in a header or breadcrumb.

#### Scenario: Loads and lists branches for a school

- GIVEN an authenticated admin with access to the school
- WHEN navigating to `/schools/{id}/branches`
- THEN the table SHALL display a paginated list from `GET /api/v1/branches?schoolId={id}`
- AND the school name SHALL be displayed in the page header
- AND search + filters SHALL be empty

#### Scenario: Empty list

- GIVEN no branches exist for the school
- WHEN the list loads
- THEN the table SHALL show "No branches found"
- AND a "Create Branch" button SHALL be visible

#### Scenario: Search filters by name

- GIVEN a populated branch list
- WHEN typing a search term
- THEN `GET /api/v1/branches?schoolId={id}&q={term}` SHALL be called
- AND the table SHALL update

#### Scenario: Filter by status

- GIVEN branches with mixed status
- WHEN selecting a status chip
- THEN `GET /api/v1/branches?schoolId={id}&status={value}` SHALL be called
- AND the table SHALL update

#### Scenario: Network failure

- GIVEN backend unreachable
- WHEN the list loads
- THEN a retriable error banner SHALL appear

#### Scenario: School not found (404)

- GIVEN an invalid school ID in the route
- WHEN navigating to `/schools/{invalid}/branches`
- THEN a "School not found" error SHALL be displayed
- AND a "Go back to schools" link SHALL be provided

#### Scenario: 403 school access denied

- GIVEN a SCHOOL_ADMIN whose scope does not include the target school
- WHEN navigating to the branches route
- THEN a 403 error SHALL be displayed
- AND the guard SHALL redirect or show "Access denied"

### Requirement: Create Branch

Dialog with name (required), code (required, unique within school), address (optional). The `schoolId` SHALL be automatically populated from the route parameter.

#### Scenario: Successful creation

- GIVEN valid data for a branch
- WHEN submitted
- THEN `POST /api/v1/branches` SHALL be called with `{name, code, address, schoolId}`
- AND the dialog SHALL close
- AND the table SHALL refresh with the new branch
- AND a success snackbar SHALL appear

#### Scenario: Duplicate code within school

- GIVEN an existing branch code for the same school
- WHEN submitted
- THEN a 409 response SHALL show "A branch with this code already exists in this school"
- AND the dialog SHALL remain open
- AND the code field SHALL be marked as invalid

#### Scenario: Duplicate code in different school (allowed)

- GIVEN a branch code that exists in a different school
- WHEN submitted
- THEN `POST` SHALL succeed (uniqueness is scoped per school)
- AND the branch SHALL be created

#### Scenario: Validation errors

- GIVEN missing required fields (name, code)
- WHEN clicking submit
- THEN invalid fields SHALL be highlighted
- AND `POST` SHALL NOT fire

#### Scenario: 403 forbidden

- GIVEN insufficient rights for the school scope
- WHEN opening the create dialog
- THEN the create button SHALL be hidden or disabled
- AND direct access SHALL show "Insufficient permissions"

### Requirement: Edit Branch

Edit dialog pre-filled with current name, code, and address. Code field SHALL be read-only or editable with school-scoped uniqueness validation.

#### Scenario: Successful edit

- GIVEN a branch selected
- WHEN editing and submitting
- THEN `PUT /api/v1/branches/:id` SHALL be called
- AND the dialog SHALL close
- AND the table row SHALL update
- AND a success snackbar SHALL appear

#### Scenario: Branch deleted meanwhile (404)

- GIVEN an open edit dialog
- WHEN the target branch is deleted by another admin
- THEN a 404 response SHALL show "Branch no longer exists"
- AND the dialog SHALL close
- AND the row SHALL be removed from the table

#### Scenario: Duplicate code on edit

- GIVEN a code changed to one already used by another branch in the same school
- WHEN submitting
- THEN a 409 response SHALL show "A branch with this code already exists in this school"
- AND the dialog SHALL remain open

### Requirement: Status Toggle

Activate/deactivate toggle per branch row with confirmation dialog.

#### Scenario: Deactivate branch

- GIVEN an active branch
- WHEN clicking deactivate and confirming
- THEN `PATCH /api/v1/branches/:id/status` SHALL be called with `{status: "INACTIVE"}`
- AND the status chip SHALL update to inactive
- AND a success snackbar SHALL appear

#### Scenario: Activate branch

- GIVEN an inactive branch
- WHEN clicking activate and confirming
- THEN `PATCH /api/v1/branches/:id/status` SHALL be called with `{status: "ACTIVE"}`
- AND the status chip SHALL update to active

#### Scenario: Business rule violation (422)

- GIVEN a status toggle request
- WHEN the backend responds 422
- THEN the toggle SHALL revert
- AND a snackbar SHALL display the error

### Requirement: Back Navigation

The branches page SHALL provide a way to navigate back to the schools list.

#### Scenario: Breadcrumb navigation

- GIVEN the user is on `/schools/{id}/branches`
- THEN a breadcrumb SHALL display "Schools / {school name} / Branches"
- WHEN clicking "Schools" in the breadcrumb
- THEN the app SHALL navigate to `/schools`

#### Scenario: Back button

- GIVEN the branches page
- THEN a back arrow or "Back to Schools" button SHALL be visible in the toolbar
- WHEN clicking it
- THEN the app SHALL navigate to `/schools`
