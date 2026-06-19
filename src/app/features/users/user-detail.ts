import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  HostListener,
  inject,
  signal,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import {
  LucideChevronLeft,
  LucidePencil,
  LucideBan,
  LucideLockOpen,
  LucideKeyRound,
  LucideShield,
  LucideClock,
  LucideFileSearch,
  LucideUsers,
  LucideTrash,
  LucideUserRoundPen,
  LucideSchool,
} from '@lucide/angular';
import { UsersService } from './services/users';
import { MembershipsService } from './memberships/services/memberships';
import { AuthService } from '../../core/services/auth';
import { UserProfile } from './models/user-profile';
import { roleLabel as getRoleLabel } from '../../core/constants/role-labels';
import { statusLabel as getStatusLabel } from '../../core/constants/display-labels';
import { Membership } from './memberships/models/membership';
import { StatCard, ConfirmationDialog } from '../../shared/ui';
import { PasswordDialogComponent } from './dialogs/password';
import { EditUser } from './dialogs/edit-user';
import { AddMembershipDialogComponent } from './memberships/dialogs/add-membership';

/* ------------------------------------------------------------------ */
/*  Constants                                                           */
/* ------------------------------------------------------------------ */

const ROLE_COLORS: Record<string, string> = {
  PLATFORM_ADMIN: '#2563EB',
  SCHOOL_ADMIN: '#3B82F6',
  TEACHER: '#10B981',
  STUDENT: '#F59E0B',
};

const ROLE_BG: Record<string, string> = {
  PLATFORM_ADMIN: 'rgba(37, 99, 235, 0.1)',
  SCHOOL_ADMIN: 'rgba(59, 130, 246, 0.1)',
  TEACHER: 'rgba(16, 185, 129, 0.1)',
  STUDENT: 'rgba(245, 158, 11, 0.1)',
};

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: '#10B981',
  INACTIVE: '#EF4444',
  BLOCKED: '#F59E0B',
};

const STATUS_BG: Record<string, string> = {
  ACTIVE: 'rgba(16, 185, 129, 0.12)',
  INACTIVE: 'rgba(239, 68, 68, 0.12)',
  BLOCKED: 'rgba(245, 158, 11, 0.12)',
};

/* ------------------------------------------------------------------ */
/*  Component                                                           */
/* ------------------------------------------------------------------ */

@Component({
  selector: 'app-user-detail',
  standalone: true,
  imports: [
    RouterModule,
    DatePipe,
    StatCard,
    ConfirmationDialog,
    EditUser,
    PasswordDialogComponent,
    AddMembershipDialogComponent,
    LucideChevronLeft,
    LucidePencil,
    LucideBan,
    LucideLockOpen,
    LucideKeyRound,
    LucideShield,
    LucideClock,
    LucideFileSearch,
    LucideUsers,
    LucideTrash,
    LucideUserRoundPen,
    LucideSchool,
  ],
  templateUrl: './user-detail.html',
  styleUrl: './user-detail.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserDetailComponent {
  /* ---- Dependencies -------------------------------------------------- */
  private readonly route = inject(ActivatedRoute);
  private readonly usersService = inject(UsersService);
  private readonly membershipsService = inject(MembershipsService);
  private readonly auth = inject(AuthService);

  /* ---- State --------------------------------------------------------- */
  readonly user = signal<UserProfile | null>(null);
  readonly memberships = signal<Membership[]>([]);
  readonly loading = signal(true);
  readonly error = signal(false);
  readonly notFound = signal(false);
  readonly activeTab = signal('cuenta');
  readonly currentId = signal('');
  readonly membershipsLoading = signal(false);

  /* ---- Dialog visibility --------------------------------------------- */
  readonly editDialogVisible = signal(false);
  readonly blockDialogVisible = signal(false);
  readonly passwordDialogVisible = signal(false);
  readonly addMembershipVisible = signal(false);
  readonly removeMembershipVisible = signal(false);
  readonly selectedMembership = signal<Membership | null>(null);

  /* ---- Computed ------------------------------------------------------ */
  readonly isBlocked = computed(() => this.user()?.status === 'BLOCKED');
  readonly isSelf = computed(() => {
    const current = this.auth.user();
    const u = this.user();
    return current !== null && u !== null && current.id === u.id;
  });

  readonly blockTitle = computed(() =>
    this.isBlocked() ? 'Desbloquear usuario' : 'Bloquear usuario',
  );
  readonly blockMessage = computed(() => {
    const u = this.user();
    if (!u) return '';
    const action = this.isBlocked() ? 'desbloquear' : 'bloquear';
    return `¿Estás seguro de que deseas ${action} a ${u.fullName}?`;
  });
  readonly blockConfirmLabel = computed(() =>
    this.isBlocked() ? 'Desbloquear' : 'Bloquear',
  );

  readonly removeMembershipMessage = computed(() => {
    const m = this.selectedMembership();
    if (!m) return '';
    return `¿Eliminar la membresía de ${getRoleLabel(m.role)}?`;
  });

  readonly roleColor = computed(() => ROLE_COLORS[this.user()?.role ?? ''] ?? '#6B7280');
  readonly roleBg = computed(() => ROLE_BG[this.user()?.role ?? ''] ?? 'rgba(107, 114, 128, 0.1)');
  readonly statusColor = computed(() => STATUS_COLORS[this.user()?.status ?? ''] ?? '#6B7280');
  readonly statusBg = computed(() => STATUS_BG[this.user()?.status ?? ''] ?? 'rgba(107, 114, 128, 0.1)');

  /* ---- Membership stats ---------------------------------------------- */
  readonly totalMemberships = computed(() => this.memberships().length);
  readonly assignedSchools = computed(() => {
    const schools = new Set(
      this.memberships()
        .filter((m) => m.active)
        .map((m) => m.scopeRefId),
    );
    return schools.size;
  });
  readonly activeRoles = computed(() => {
    const roles = new Set(
      this.memberships()
        .filter((m) => m.active)
        .map((m) => m.role),
    );
    return roles.size;
  });

  /* ---- Lifecycle ----------------------------------------------------- */
  constructor() {
    this.route.params.subscribe((params) => {
      const id = params['id'];
      if (id) {
        this.currentId.set(id);
      }
    });

    effect(() => {
      const id = this.currentId();
      if (id) {
        this.loadUser(id);
      }
    });
  }

  /* ---- Data loading -------------------------------------------------- */
  loadUser(id: string): void {
    this.loading.set(true);
    this.error.set(false);
    this.notFound.set(false);
    this.user.set(null);

    this.usersService.getById(id).subscribe({
      next: (result) => {
        this.user.set(result);
        this.loading.set(false);
        this.loadMemberships(id);
      },
      error: (err) => {
        if (err.status === 404) {
          this.notFound.set(true);
        } else {
          this.error.set(true);
        }
        this.loading.set(false);
      },
    });
  }

  loadMemberships(userId: string): void {
    this.membershipsLoading.set(true);
    this.membershipsService.getByUser(userId).subscribe({
      next: (result) => {
        this.memberships.set(result);
        this.membershipsLoading.set(false);
      },
      error: () => {
        this.memberships.set([]);
        this.membershipsLoading.set(false);
      },
    });
  }

  /* ---- Tab switching ------------------------------------------------- */
  setActiveTab(tab: string): void {
    this.activeTab.set(tab);
  }

  /* ---- User update callback ------------------------------------------ */
  onUserUpdated(updated: UserProfile): void {
    this.user.set(updated);
  }

  /* ---- Action: Edit -------------------------------------------------- */
  openEditDialog(): void {
    this.editDialogVisible.set(true);
  }

  onUserEdited(updated: UserProfile): void {
    this.user.set(updated);
  }

  /* ---- Action: Block/Unblock ----------------------------------------- */
  openBlockDialog(): void {
    this.blockDialogVisible.set(true);
  }

  closeBlockDialog(): void {
    this.blockDialogVisible.set(false);
  }

  async confirmBlock(): Promise<void> {
    const u = this.user();
    if (!u) return;

    const newStatus = this.isBlocked() ? 'ACTIVE' : 'BLOCKED';
    try {
      const updated = await firstValueFrom(
        this.usersService.changeStatus(u.id, { status: newStatus }),
      );
      this.onUserUpdated(updated);
      this.blockDialogVisible.set(false);
    } catch {
      // silently fail
    }
  }

  /* ---- Action: Reset Password ---------------------------------------- */
  openPasswordDialog(): void {
    this.passwordDialogVisible.set(true);
  }

  onPasswordChanged(): void {
    // Password reset successful — no UI update needed
  }

  /* ---- Action: Add Membership ---------------------------------------- */
  openAddMembership(): void {
    this.addMembershipVisible.set(true);
  }

  onMembershipAdded(): void {
    this.loadMemberships(this.currentId());
  }

  /* ---- Action: Remove Membership ------------------------------------- */
  openRemoveMembership(membership: Membership): void {
    this.selectedMembership.set(membership);
    this.removeMembershipVisible.set(true);
  }

  closeRemoveDialog(): void {
    this.removeMembershipVisible.set(false);
  }

  async confirmRemoveMembership(): Promise<void> {
    const m = this.selectedMembership();
    if (!m) return;

    try {
      await firstValueFrom(this.membershipsService.deactivate(m.id));
      this.removeMembershipVisible.set(false);
      this.loadMemberships(this.currentId());
    } catch {
      // silently fail
    }
  }

  /* ---- Helpers ------------------------------------------------------- */
  getInitials(name: string): string {
    const parts = name.trim().split(/\s+/);
    return parts
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() ?? '')
      .join('');
  }

  roleDisplayColor(role: string): string {
    return ROLE_COLORS[role] ?? '#6B7280';
  }

  roleDisplayBg(role: string): string {
    return ROLE_BG[role] ?? 'rgba(107, 114, 128, 0.1)';
  }

  roleLabel(role: string | undefined): string {
    return getRoleLabel(role);
  }

  statusLabel(status: string | undefined): string {
    return getStatusLabel(status);
  }

  /* ---- Close dialogs on Escape --------------------------------------- */
  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.blockDialogVisible.set(false);
    this.passwordDialogVisible.set(false);
    this.addMembershipVisible.set(false);
    this.removeMembershipVisible.set(false);
  }
}
