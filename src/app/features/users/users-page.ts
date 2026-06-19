import { ChangeDetectionStrategy, Component, computed, HostListener, inject, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { firstValueFrom, forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import {
  LucideUserPlus,
  LucideSearch,
  LucideEye,
  LucidePencil,
  LucidePower,
  LucideShield,
  LucideDownload,
  LucideFileText,
  LucideFileSpreadsheet,
  LucideFileType,
  LucideChevronLeft,
  LucideChevronRight,
  LucideArrowUp,
  LucideArrowDown,
} from '@lucide/angular';
import { UsersService } from './services/users';
import { MembershipsService } from './memberships/services/memberships';
import { AuthService } from '../../core/services/auth';
import { UserProfile, ChangeStatusRequest } from './models/user-profile';
import { roleLabel as getRoleLabel } from '../../core/constants/role-labels';
import { PageHeader, StatCard, EmptyState, ConfirmationDialog } from '../../shared/ui';
import { CreateUserDialogComponent } from './dialogs/create-user';
import { EditUser } from './dialogs/edit-user';

/* ------------------------------------------------------------------ */
/*  Filter types                                                        */
/* ------------------------------------------------------------------ */

type RoleFilter = 'Todos' | 'PLATFORM_ADMIN' | 'SCHOOL_ADMIN' | 'TEACHER' | 'STUDENT';
type StatusFilter = 'Todos' | 'ACTIVE' | 'INACTIVE';
type PageSize = 10 | 25 | 50;

/* ------------------------------------------------------------------ */
/*  Role → display helpers                                              */
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
    /*PageHeader,*/
    StatCard,
    EmptyState,
    ConfirmationDialog,
    CreateUserDialogComponent,
    EditUser,
    LucideUserPlus,
    LucideSearch,
    LucideEye,
    LucidePencil,
    LucidePower,
    LucideShield,
    LucideDownload,
    LucideFileText,
    LucideFileSpreadsheet,
    LucideFileType,
    LucideChevronLeft,
    LucideChevronRight,
    LucideEye,
    LucidePencil,
    LucidePower,
    LucideShield,
    LucideChevronLeft,
    LucideChevronRight,
    LucideArrowUp,
    LucideArrowDown,
  ],
  templateUrl: './users-page.html',
  styleUrl: './users-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsersPageComponent {
  /* ---- Dependencies -------------------------------------------------- */
  private readonly usersService = inject(UsersService);
  private readonly membershipsService = inject(MembershipsService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  /* ---- State --------------------------------------------------------- */
  readonly users = signal<UserProfile[]>([]);
  readonly loading = signal(true);
  readonly error = signal(false);

  readonly roleFilter = signal<RoleFilter>('Todos');
  readonly statusFilter = signal<StatusFilter>('Todos');
  readonly institutionFilter = signal('');
  readonly searchTerm = signal('');
  readonly exportMenuOpen = signal(false);
  readonly sortColumn = signal<string | null>(null);
  readonly sortDirection = signal<'asc' | 'desc'>('asc');

  // Pagination
  readonly currentPage = signal(1);
  readonly pageSize = signal<PageSize>(10);

  // Dialog visibility
  readonly createDialogVisible = signal(false);
  readonly statusDialogVisible = signal(false);
  readonly selectedUser = signal<UserProfile | null>(null);

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

    const institution = this.institutionFilter().toLowerCase().trim();
    if (institution) {
      result = result.filter((u) => (u.institution ?? '').toLowerCase().includes(institution));
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

    // Sort
    const col = this.sortColumn();
    if (col) {
      const dir = this.sortDirection() === 'asc' ? 1 : -1;
      result = [...result].sort((a, b) => {
        const va = (a as unknown as Record<string, unknown>)[col] ?? '';
        const vb = (b as unknown as Record<string, unknown>)[col] ?? '';
        return String(va).localeCompare(String(vb)) * dir;
      });
    }

    return result;
  });

  sortBy(column: string): void {
    if (this.sortColumn() === column) {
      this.sortDirection.update((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      this.sortColumn.set(column);
      this.sortDirection.set('asc');
    }
  }

  /* ---- Computed: Pagination ------------------------------------------ */
  readonly totalPages = computed(() => {
    const total = this.filteredUsers().length;
    const size = this.pageSize();
    return Math.max(1, Math.ceil(total / size));
  });

  readonly paginatedUsers = computed(() => {
    const page = this.currentPage();
    const size = this.pageSize();
    const start = (page - 1) * size;
    return this.filteredUsers().slice(start, start + size);
  });

  readonly showingFrom = computed(() => {
    const total = this.filteredUsers().length;
    if (total === 0) return 0;
    return (this.currentPage() - 1) * this.pageSize() + 1;
  });

  readonly showingTo = computed(() => {
    const total = this.filteredUsers().length;
    if (total === 0) return 0;
    return Math.min(this.currentPage() * this.pageSize(), total);
  });

  readonly isFirstPage = computed(() => this.currentPage() <= 1);
  readonly isLastPage = computed(() => this.currentPage() >= this.totalPages());

  /* ---- Page numbers for display ------------------------------------- */
  readonly pageNumbers = computed(() => {
    const total = this.totalPages();
    const current = this.currentPage();
    const pages: number[] = [];
    const maxVisible = 5;

    let start = Math.max(1, current - Math.floor(maxVisible / 2));
    let end = Math.min(total, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
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
  }

  /* ---- Data loading -------------------------------------------------- */
  loadUsers(search?: string): void {
    this.loading.set(true);
    this.error.set(false);

    this.usersService.getAll(search).subscribe({
      next: (result: UserProfile[]) => {
        this.users.set(result);
        this.currentPage.set(1);
        this.loading.set(false);
        // Fetch roles from memberships for each user
        this.loadRoles(result);
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
      },
    });
  }

  private loadRoles(users: UserProfile[]): void {
    if (users.length === 0) return;

    const requests = users.map((user) =>
      this.membershipsService.getByUser(user.id).pipe(
        map((memberships) => ({
          userId: user.id,
          roles: memberships.filter((m) => m.active).map((m) => m.role),
        })),
        catchError(() => of({ userId: user.id, roles: [] as string[] })),
      ),
    );

    forkJoin(requests).subscribe((results) => {
      const roleMap = new Map(results.map((r) => [r.userId, r.roles]));
      this.users.update((current) =>
        current.map((u) => ({
          ...u,
          role: roleMap.get(u.id)?.[0] ?? u.role,
        })),
      );
    });
  }

  /* ---- Filter handlers ----------------------------------------------- */
  setRoleFilter(value: string): void {
    this.roleFilter.set(value as RoleFilter);
    this.currentPage.set(1);
  }

  setStatusFilter(value: string): void {
    this.statusFilter.set(value as StatusFilter);
    this.currentPage.set(1);
  }

  setInstitutionFilter(value: string): void {
    this.institutionFilter.set(value);
    this.currentPage.set(1);
  }

  toggleExportMenu(): void {
    this.exportMenuOpen.update((v) => !v);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.export-dropdown')) {
      this.exportMenuOpen.set(false);
    }
  }

  exportData(format: string): void {
    this.exportMenuOpen.set(false);
    // TODO: implement actual export
    console.log(`Exporting as ${format}`);
  }

  onSearchInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchTerm.set(input.value);
  }

  clearSearch(input: HTMLInputElement): void {
    this.searchTerm.set('');
    input.value = '';
    input.focus();
  }

  /* ---- Pagination handlers ------------------------------------------- */
  setPageSize(value: string): void {
    this.pageSize.set(Number(value) as PageSize);
    this.currentPage.set(1);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  nextPage(): void {
    if (!this.isLastPage()) {
      this.currentPage.update((p) => p + 1);
    }
  }

  prevPage(): void {
    if (!this.isFirstPage()) {
      this.currentPage.update((p) => p - 1);
    }
  }

  /* ---- Dialog actions ------------------------------------------------ */

  // Create dialog — uses standalone CreateUserDialogComponent
  openCreateDialog(): void {
    this.createDialogVisible.set(true);
  }

  closeCreateDialog(): void {
    this.createDialogVisible.set(false);
  }

  onUserCreated(): void {
    this.loadUsers();
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
  viewUser(user: UserProfile): void {
    this.router.navigate(['/users', user.id]);
  }

  readonly editDialogVisible = signal(false);
  readonly editUserData = signal<UserProfile | null>(null);

  editUser(user: UserProfile): void {
    this.editUserData.set(user);
    this.editDialogVisible.set(true);
  }

  onUserEdited(user: UserProfile): void {
    this.users.update((list) => list.map((u) => (u.id === user.id ? user : u)));
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

  roleBg(role: string | undefined): string {
    return ROLE_BG[role ?? ''] ?? 'rgba(107, 114, 128, 0.1)';
  }

  roleLabel(role: string | undefined): string {
    return getRoleLabel(role);
  }

  statusLabel(status: string): string {
    const labels: Record<string, string> = { ACTIVE: 'Activo', INACTIVE: 'Inactivo', BLOCKED: 'Bloqueado' };
    return labels[status] ?? status;
  }

  statusClass(status: string): string {
    return STATUS_CLASSES[status] ?? 'status--default';
  }
}
