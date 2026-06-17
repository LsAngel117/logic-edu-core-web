# Proposal: User Detail Page

## Intent

Enhance `/users/:id` with admin actions: edit drawer, block/unblock, reset password, and placeholder sections for access/audit + activity timeline.

## Scope

### In Scope
- Edit drawer (right slide-in panel) for name/email/role
- Block/Unblock via ConfirmationDialog (BLOCKED state, self-block prevented)
- Reset password without currentPassword (`PATCH /api/v1/users/{id}/password`)
- Placeholder sections: Accesos/Auditoría (EmptyState), Actividad (simulated timeline)
- Tabs/sections layout: Profile, Memberships, Access/Audit, Activity

### Out of Scope
- Quick-edit dialog on users table (stays unchanged)
- Real access/audit APIs or activity feed
- Change Password dialog (keeps currentPassword flow)

## Capabilities

### New Capabilities
- `user-detail`: Detail page with profile view, edit drawer, block/unblock, reset password, placeholders

### Modified Capabilities
- `user-management`: Extend status toggle spec with BLOCKED state; add reset-password variant

## Approach

Enhance `UserDetailComponent` — no rewrite. Add tab layout. Edit drawer uses `MatDrawer` in `over` mode. Block/Unblock extends `UserStatusDialogComponent` with BLOCKED + self-block guard. Reset password extends PasswordDialog with optional currentPassword.

| Feature | Component | Notes |
|---------|-----------|-------|
| Edit drawer | New `UserEditDrawer` | MatDrawer, name/email/role form |
| Block/Unblock | Extend `UserStatusDialogComponent` | +BLOCKED, self-block guard |
| Reset password | Extend `PasswordDialogComponent` | Optional currentPassword |
| Placeholders | `EmptyState` | Reuse shared component |

## Affected Areas

| Area | Impact |
|------|--------|
| `features/users/user-detail.ts` | Modified |
| `features/users/dialogs/user-status.ts` | Modified |
| `features/users/dialogs/password.ts` | Modified |
| `features/users/services/users.ts` | Modified |
| `features/users/models/user-profile.ts` | Modified |
| `features/users/user-edit-drawer/` | New |
| `features/users/user-detail.scss` | Modified |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Backend rejects empty currentPassword on reset | Med | Validate with backend; fallback to separate endpoint |
| Backend doesn't accept BLOCKED in status PATCH | Low | Coordinate API contract before implementation |

## Rollback Plan

- Remove drawer component, revert `user-detail.ts`, dialogs, service, model changes
- Placeholder sections are UI-only — no data risk

## Dependencies

- Backend: `PATCH /api/v1/users/:id/password` MUST accept missing currentPassword
- Backend: `PATCH /api/v1/users/:id/status` MUST accept `BLOCKED`

## Success Criteria

- [ ] Edit drawer opens/closes, saves name/email/role
- [ ] Block/Unblock calls status endpoint with correct state; self-block disabled
- [ ] Reset password succeeds without currentPassword
- [ ] Placeholder sections show "Próximamente — en desarrollo"
- [ ] `bun ng test` && `bun ng build` pass
