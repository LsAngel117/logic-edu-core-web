# Proposal: Phase 3 — Schools & Branches

## Intent

Enable institutional administration: manage schools (institutions) and their branches (venues) via `/api/v1/schools` and `/api/v1/branches`. PLATFORM_ADMIN oversees all schools; SCHOOL_ADMIN manages their own.

## Scope

### In Scope
- Schools list with Material table + search/filter
- School creation form (dialog)
- School edit form (dialog)
- School deactivation
- Branches list per school (sub-route `/schools/:id/branches`)
- Branch creation/edit/deactivation
- Route `/schools` with auth + role guards

### Out of Scope
- Hard delete (deactivate only)
- Bulk operations, audit log, school-scoped dashboard
- Branch-level analytics or academic context

## Capabilities

### New Capabilities
- `school-management`: School listing, creation, editing, deactivation, search/filter
- `branch-management`: Branch listing per school, creation, editing, deactivation

### Modified Capabilities
- None — schools/branches are independent from existing `user-auth`, `user-management`, `membership-management`

## Approach

Two feature modules mirroring the users pattern:

| Module | Key deliverables |
|--------|-----------------|
| `features/schools/` | `schools-page.ts` (Material table + filters), `school-form.ts` (dialog), `schools.service.ts`, models |
| `features/schools/branches/` | `branches-page.ts` (list per school), `branch-form.ts` (dialog), `branches.service.ts`, models |

- **Data flow**: Feature services call REST endpoints. Components own data via `effect()` — no shared store.
- **Models**: `School` (id, name, status, address, createdAt), `Branch` (id, name, schoolId, status, address, createdAt).
- **Routing**: `/schools` lazy-loaded with `authGuard`. Sub-route `/schools/:id/branches` nested under schools.
- **UI**: Standard Material: table, dialog, chips, status toggle. Embedded branches panel in school detail view.
- **Convention**: Same directory structure as `features/users/` — pages, services, models, no file suffixes.

## Affected Areas

| Area | Impact |
|------|--------|
| `features/schools/` | New module |
| `features/schools/branches/` | New sub-module |
| `app.routes.ts` | Add `/schools` lazy route |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Backend branch endpoint differs from schools pattern | Medium | Service adapters absorb shape differences |
| Deactivation semantics unclear (PATCH status vs DELETE) | Low | Confirm in spec phase; follow users' `PATCH /status` pattern |
| No SCHOOL_ADMIN role guard yet | Medium | Extend `role.guard.ts` from phase 2 with school-scope check |

## Rollback Plan

Remove `features/schools/` directory and its route entry in `app.routes.ts`. No shared infrastructure changes.

## Dependencies

- `user-auth` capability complete
- `role.guard.ts` from phase 2 (extend for school-scoped check)
- Backend: `GET/POST /api/v1/schools`, `GET/PUT/PATCH /api/v1/schools/:id`, `GET/POST /api/v1/branches?schoolId=:id`, `GET/PUT/PATCH /api/v1/branches/:id`

## Success Criteria

- [ ] Admin lists, filters, creates, edits, deactivates schools
- [ ] Branches listed per school, create/edit/deactivate works
- [ ] Navigation includes `/schools` in sidebar
- [ ] 403 handled gracefully in all flows
- [ ] `bun ng test` and `bun ng build` pass
