# Tasks: Phase 3 — Schools & Branches

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~1,700 |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1: Schools feature → PR 2: Branches feature → PR 3: Wiring |
| Delivery strategy | ask-on-risk |
| Chain strategy | feature-branch-chain |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: feature-branch-chain
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Base |
|------|------|-----------|------|
| 1 | Schools feature: models, service, page, dialogs, routes | PR 1 | tracker branch |
| 2 | Branches feature: models, service, page, dialogs, sub-routes | PR 2 | PR #1 branch |
| 3 | Wiring + verification: app.routes.ts, full build & test | PR 3 | PR #2 branch |

## Phase 1: Data Models

- [x] 1.1 Create `features/schools/models/school.ts` — `School`, `CreateSchoolPayload`, `UpdateSchoolPayload`
- [x] 1.2 Create `features/schools/branches/models/branch.ts` — `Branch`, `CreateBranchPayload`, `UpdateBranchPayload`

## Phase 2: Services & Routes

- [x] 2.1 Write `schools.service.spec.ts` — CRUD, status toggle, `q`/`status` params, error cases
- [x] 2.2 Create `features/schools/services/schools.ts` — `list/get/create/update/updateStatus` with `HttpParams`
- [x] 2.3 Write `branches.service.spec.ts` — CRUD, `schoolId` filter, status toggle, error cases
- [x] 2.4 Create `features/schools/branches/services/branches.ts` — `list/get/create/update/updateStatus`
- [x] 2.5 Create `features/schools/routes.ts` — lazy: `/schools` → `SchoolsPage`, `/:id/branches` → branches sub-route
- [x] 2.6 Create `features/schools/branches/routes.ts` — lazy sub-route → `BranchesPage`

## Phase 3: Schools UI

- [x] 3.1 Write `schools-page.spec.ts` — table render, search debounce, status filter chips, branchCount column, error/403 banners
- [x] 3.2 Create `schools-page.ts/.html/.scss` — `mat-table` with columns + toolbar with create/search/status chips
- [x] 3.3 Write `school-create.spec.ts` — validation, submit, 409 duplicate, code format regex check
- [x] 3.4 Create `dialogs/school-create.ts` — ReactiveForms: name (required), code (required, regex), address (optional)
- [x] 3.5 Write `school-edit.spec.ts` — pre-fill, update, 409/404, code-change warning
- [x] 3.6 Create `dialogs/school-edit.ts` — pre-filled, code read-only with change propagation warning
- [x] 3.7 Write `school-status.spec.ts` — toggle, cascade warning with `branchCount`, 422 revert, self-school disable
- [x] 3.8 Create `dialogs/school-status.ts` — confirm dialog with cascade warning + self-school protection via `MembershipsService`

## Phase 4: Branches UI

- [x] 4.1 Write `branches-page.spec.ts` — school-scoped list, search/filter, breadcrumb, back nav, 404/403 handling
- [x] 4.2 Create `branches-page.ts/.html/.scss` — `mat-table` + school header + breadcrumb + back to schools
- [x] 4.3 Write `branch-create.spec.ts` — auto `schoolId` from route, validation, 409
- [x] 4.4 Create `dialogs/branch-create.ts` — dialog with `schoolId` from route param, name/code/address
- [x] 4.5 Write `branch-edit.spec.ts` — pre-fill, update, 409/404
- [x] 4.6 Create `dialogs/branch-edit.ts` — pre-filled, code read-only
- [x] 4.7 Write `branch-status.spec.ts` — toggle, 422 revert
- [x] 4.8 Create `dialogs/branch-status.ts` — confirm toggle dialog

## Phase 5: Routing & Wiring

- [x] 5.1 Modify `app.routes.ts` — add `{path: 'schools', loadChildren, canActivate: [authGuard]}`

## Phase 6: Verification

- [x] 6.1 Run `bun ng test` — all 10 spec files pass
- [x] 6.2 Run `bun ng build` — production build succeeds
