import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import {
  LucideUserPlus,
  LucideSearch,
  LucideEye,
  LucidePencil,
  LucidePower,
  LucideShield,
} from '@lucide/angular';
import { UsersService } from './services/users';
import { AuthService } from '../../core/services/auth';
import { UserProfile, CreateUserPayload, ChangeStatusRequest } from './models/user-profile';
import { PageHeader, StatCard, EmptyState, AppDialog, ConfirmationDialog } from '../../shared/ui';

/* ------------------------------------------------------------------ */
/*  Filter types                                                        */
/* ------------------------------------------------------------------ */

type RoleFilter = 'Todos' | 'PLATFORM_ADMIN' | 'SCHOOL_ADMIN' | 'TEACHER' | 'STUDENT';
type StatusFilter = 'Todos' | 'ACTIVE' | 'INACTIVE';

/* ------------------------------------------------------------------ */
/*  Role → display helpers                                              */
/* ------------------------------------------------------------------ */

const ROLE_COLORS: Record<string, string> = {
  PLATFORM_ADMIN: '#2563EB',
  SCHOOL_ADMIN: '#3B82F6',
  TEACHER: '#10B981',
  STUDENT: '#F59E0B',
};

const STATUS_CLASSES: Record<string, string> = {
  ACTIVE: 'status--active',
  INACTIVE: 'status--inactive',
  BLOCKED: 'status--blocked',
};

/* ------------------------------------------------------------------ */
/*  Component                                                           */
/* ------------------------------------------------------------------ */

@Component({
  selector: 'app-users-page',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterModule,
    PageHeader,
    StatCard,
    EmptyState,
    AppDialog,
    ConfirmationDialog,
    LucideUserPlus,
    LucideSearch,
    LucideEye,
    LucidePencil,
    LucidePower,
    LucideShield,
  ],
  templateUrl: './users-page.html',
  styleUrl: './users-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsersPageComponent {
  /* ---- Dependencies -------------------------------------------------- */
  private readonly usersService = inject(UsersService);
  private readonly authService = inject(AuthService);

  /* ---- State --------------------------------------------------------- */
  readonly users = signal<UserProfile[]>([]);
  readonly loading = signal(true);
  readonly error = signal(false);

  readonly roleFilter = signal<RoleFilter>('Todos');
  readonly statusFilter = signal<StatusFilter>('Todos');
  readonly searchTerm = signal('');

  // Dialog visibility
  readonly createDialogVisible = signal(false);
  readonly statusDialogVisible = signal(false);
  readonly selectedUser = signal<UserProfile | null>(null);

  // Create dialog internal state
  readonly createLoading = signal(false);
  readonly createError = signal('');
  readonly createForm = signal({
    username: '',
    email: '',
    fullName: '',
    password: '',
  });

  /* ---- Computed: Stats ----------------------------------------------- */
  readonly totalUsers = computed(() => this.users().length);
  readonly activeUsers = computed(() => this.users().filter((u) => u.status === 'ACTIVE').length);
  readonly inactiveUsers = computed(() => this.users().filter((u) => u.status === 'INACTIVE').length);
  readonly adminUsers = computed(
    () =>
      this.users().filter((u) => u.role === 'PLATFORM_ADMIN' || u.role === 'SCHOOL_ADMIN').length,
  );

  /* ---- Computed: Filtered users -------------------------------------- */
  readonly filteredUsers = computed(() => {
    let result = this.users();

    const role = this.roleFilter();
    if (role !== 'Todos') {
      result = result.filter((u) => u.role === role);
    }

    const status = this.statusFilter();
    if (status !== 'Todos') {
      result = result.filter((u) => u.status === status);
    }

    const search = this.searchTerm().toLowerCase().trim();
    if (search) {
      result = result.filter(
        (u) =>
          u.fullName.toLowerCase().includes(search) ||
          u.email.toLowerCase().includes(search) ||
          u.username.toLowerCase().includes(search),
      );
    }

    return result;
  });

  /* ---- Status dialog computed props ---------------------------------- */
  readonly statusDialogTitle = computed(() => {
    const u = this.selectedUser();
    if (!u) return '';
    return u.status === 'ACTIVE' ? 'Desactivar usuario' : 'Activar usuario';
  });

  readonly statusDialogMessage = computed(() => {
    const u = this.selectedUser();
    if (!u) return '';
    const action = u.status === 'ACTIVE' ? 'desactivar' : 'activar';
    return `¿Estás seguro de que deseas ${action} a ${u.fullName}?`;
  });

  readonly statusDialogConfirmLabel = computed(() => {
    const u = this.selectedUser();
    if (!u) return 'Confirmar';
    return u.status === 'ACTIVE' ? 'Desactivar' : 'Activar';
  });

  readonly isSelf = computed(() => {
    const currentUser = this.authService.user();
    const sel = this.selectedUser();
    return currentUser !== null && sel !== null && currentUser.id === sel.id;
  });

  /* ---- Lifecycle ----------------------------------------------------- */
  constructor() {
    this.loadUsers();

    // Debounced search via API
    let debounceTimer: ReturnType<typeof setTimeout> | null = null;
    effect((onCleanup) => {
      const term = this.searchTerm();
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        this.loadUsers(term || undefined);
      }, 300);
      onCleanup(() => {
        if (debounceTimer) clearTimeout(debounceTimer);
      });
    });
  }

  /* ---- Data loading -------------------------------------------------- */
  loadUsers(search?: string): void {
    this.loading.set(true);
    this.error.set(false);

    this.usersService.getAll(search).subscribe({
      next: (result: UserProfile[]) => {
        this.users.set(result);
        this.loading.set(false);
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
      },
    });
  }

  /* ---- Filter handlers ----------------------------------------------- */
  setRoleFilter(value: string): void {
    this.roleFilter.set(value as RoleFilter);
  }

  setStatusFilter(value: string): void {
    this.statusFilter.set(value as StatusFilter);
  }

  onSearchInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchTerm.set(input.value);
  }

  clearSearch(): void {
    this.searchTerm.set('');
  }

  /* ---- Dialog actions ------------------------------------------------ */

  // Create dialog
  openCreateDialog(): void {
    this.createForm.set({ username: '', email: '', fullName: '', password: '' });
    this.createError.set('');
    this.createLoading.set(false);
    this.createDialogVisible.set(true);
  }

  closeCreateDialog(): void {
    this.createDialogVisible.set(false);
  }

  updateCreateForm(field: string, event: Event): void {
    const input = event.target as HTMLInputElement;
    this.createForm.update((f) => ({ ...f, [field]: input.value }));
  }

  async submitCreateUser(): Promise<void> {
    const form = this.createForm();
    if (!form.username || !form.email || !form.fullName || !form.password) {
      this.createError.set('Todos los campos son requeridos');
      return;
    }
    if (form.password.length < 8) {
      this.createError.set('La contraseña debe tener al menos 8 caracteres');
      return;
    }
    if (!form.email.includes('@')) {
      this.createError.set('Formato de email inválido');
      return;
    }

    this.createLoading.set(true);
    this.createError.set('');

    const payload: CreateUserPayload = {
      username: form.username,
      email: form.email,
      fullName: form.fullName,
      password: form.password,
    };

    try {
      await firstValueFrom(this.usersService.create(payload));
      this.createDialogVisible.set(false);
      this.loadUsers();
    } catch (err: unknown) {
      const status = (err as { status?: number }).status;
      if (status === 409) {
        this.createError.set('Email o nombre de usuario ya en uso');
      } else if (status === 403) {
        this.createError.set('Permisos insuficientes');
      } else {
        this.createError.set('Ocurrió un error');
      }
    } finally {
      this.createLoading.set(false);
    }
  }

  // Status dialog
  openStatusDialog(user: UserProfile): void {
    this.selectedUser.set(user);
    this.statusDialogVisible.set(true);
  }

  closeStatusDialog(): void {
    this.statusDialogVisible.set(false);
    this.selectedUser.set(null);
  }

  async confirmStatusChange(): Promise<void> {
    const user = this.selectedUser();
    if (!user) return;

    const newStatus = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    const payload: ChangeStatusRequest = { status: newStatus };

    try {
      await firstValueFrom(this.usersService.changeStatus(user.id, payload));
      this.statusDialogVisible.set(false);
      this.selectedUser.set(null);
      this.loadUsers();
    } catch {
      // silently fail — user retries
    }
  }

  // View user
  viewUser(_user: UserProfile): void {
    // Navigation wired externally
  }

  editUser(_user: UserProfile): void {
    // Open edit dialog — wired in future PR
  }

  /* ---- Helpers ------------------------------------------------------- */
  getInitials(name: string): string {
    const parts = name.trim().split(/\s+/);
    return parts
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() ?? '')
      .join('');
  }

  roleColor(role: string | undefined): string {
    return ROLE_COLORS[role ?? ''] ?? '#6B7280';
  }

  statusClass(status: string): string {
    return STATUS_CLASSES[status] ?? 'status--default';
  }
}
