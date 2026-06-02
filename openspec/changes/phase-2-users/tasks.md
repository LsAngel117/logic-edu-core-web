# Tasks: Phase 2 — Users & Memberships

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 1400–1700 |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1 (Foundation) → PR 2 (List) → PR 3 (Detail+Memberships) → PR 4 (Routes+Wiring) |
| Delivery strategy | ask-on-risk |
| Chain strategy | feature-branch-chain |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: feature-branch-chain
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Base |
|------|------|-----------|------|
| 1 | Models + Services + tests | PR 1 | main |
| 2 | List page + create/edit dialogs + tests | PR 2 | tracker branch |
| 3 | Detail page + memberships + dialogs + tests | PR 3 | PR #2 branch |
| 4 | Routes + wiring | PR 4 | PR #3 branch |

## Phase 1: Foundation (Models + Services)

- [x] 1.1 Create models: `user-profile.ts`, `payloads.ts`, `membership.ts`
- [x] 1.2 Create `services/users.ts` — UsersService: list/get/create/update/patchStatus/changePassword
- [x] 1.3 Create `memberships/services/memberships.ts` — MembershipsService: list/create/delete

## Phase 2: List Page

- [ ] 2.1 Create `users-list.ts` + `.html` + `.scss` — mat-table with server-side sort/search/pagination, status toggle inline with confirm
- [ ] 2.2 Create `user-create.ts` — create user dialog (ReactiveForms, email/password/roles/name)
- [ ] 2.3 Create `user-edit.ts` — edit user dialog (pre-filled, PUT /:id)

## Phase 3: Detail Page & Memberships

- [ ] 3.1 Create `user-detail.ts` + `.html` + `.scss` — profile card + memberships panel integration
- [ ] 3.2 Create `memberships/memberships-panel.ts` + `.html` — chip list, add/remove, loading/empty/error states
- [ ] 3.3 Create `memberships/membership-add.ts` — add membership dialog (role/scope selection)
- [ ] 3.4 Create `user-password.ts` — change password dialog (new + confirm, mismatch validation)

## Phase 4: Routing & Wiring

- [ ] 4.1 Create `routes.ts` — lazy routes for `/users` (list) and `/users/:id` (detail)
- [ ] 4.2 Modify `app.routes.ts` — add `/users` lazy route with `authGuard`

## Phase 5: Testing

- [x] 5.1 Write `services/users.spec.ts` — CRUD + status + password, mock HttpClient per HTTP verb
- [x] 5.2 Write `memberships/services/memberships.spec.ts` — list/create/delete, verify userId query param
- [ ] 5.3 Write `users-list.spec.ts` — table render, sort/search triggers API, status confirm, error banner
- [ ] 5.4 Write `user-create.spec.ts` — validation, submit calls POST, 409/403 error display, dialog close
- [ ] 5.5 Write `user-edit.spec.ts` — pre-fill, submit calls PUT, 404 handled
- [ ] 5.6 Write `user-detail.spec.ts` + `memberships-panel.spec.ts` — load profile, chips render, add/remove, 404
- [ ] 5.7 Write `user-password.spec.ts` + `membership-add.spec.ts` — mismatch prevention, submit, duplicate 409
