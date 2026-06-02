# Proposal: Phase 2 — Users & Memberships

## Intent

Build identity management UI consuming `/api/v1/users` and `/api/v1/memberships`. Enable PLATFORM_ADMIN/SCHOOL_ADMIN to manage users and their role/scope memberships.

## Scope

### In Scope
- User table with search + status/role filters
- User creation form (name, email, roles, initial password)
- Edit form (name, email, roles)
- User status toggle (activate/deactivate)
- Password change dialog
- Memberships panel: assign/remove roles + scopes
- Route `/users` with auth + role guards

### Out of Scope
- Hard delete, self-registration, bulk ops, audit log, role/scope CRUD

## Capabilities

### New Capabilities
- `user-management`: User listing, creation, editing, status toggle, password change
- `membership-management`: Assign/remove roles and scopes per user, display memberships

### Modified Capabilities
- None — `user-auth` session model stays; user management gets its own DTOs

## Approach

Two feature modules: `features/users/` and `features/memberships/`.

| Module | Key deliverables |
|--------|-----------------|
| `users/` | `users-list.ts` (Material table + filters), `users-form.ts` (dialog), `users-password.ts`, `users.service.ts`, models |
| `memberships/` | `memberships-panel.ts` (embedded in user detail), `memberships.service.ts`, models |

- **Data flow**: feature services call REST endpoints. Components own data via `effect()` — no shared state.
- **Models**: `UserProfile` in users/ (extends auth `User`), `Membership`, `Role`, `Scope` in memberships/.
- **Routing**: `/users` lazy-loaded with `authGuard`. Detail route `/users/:id` hosts memberships panel.
- **UI**: Standard Material: table, dialog, chips, toggle.

## Affected Areas

| Area | Impact |
|------|--------|
| `features/users/` | New module |
| `features/memberships/` | New module |
| `app.routes.ts` | Add `/users` lazy route |
| `core/models/` | New `UserProfile` type |
| `core/guards/` | New `role.guard.ts` |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Backend contract mismatch | Med | Service adapters absorb changes |
| Password endpoint shape unclear | Med | Generic dialog; confirm in spec phase |
| Membership batch ops unsupported | Low | Sequential calls in service |

## Rollback Plan

- Remove `features/users/`, `features/memberships/` and route entry
- No changes to shared auth logic

## Dependencies

- `user-auth` capability complete
- Backend: `GET/POST /api/v1/users`, `GET/PUT /api/v1/users/:id`, `PATCH /api/v1/users/:id/status`, `POST /api/v1/users/:id/password`, `GET/POST /api/v1/memberships`, `DELETE /api/v1/memberships/:id`

## Success Criteria

- [ ] Admin lists, filters, creates, edits, deactivates users
- [ ] Password change works for any user
- [ ] Roles and scopes assignable/removable per user
- [ ] 403 handled gracefully in all flows
- [ ] `bun ng test` and `bun ng build` pass
