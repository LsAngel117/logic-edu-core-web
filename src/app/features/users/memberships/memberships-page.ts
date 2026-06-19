import { ChangeDetectionStrategy, Component, computed, HostListener, inject, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { firstValueFrom, forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import {
  LucideKey,
  LucideSearch,
  LucideEye,
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
import { UsersService } from '../services/users';
import { MembershipsService } from './services/memberships';
import { Membership } from './models/membership';
import { roleLabel as getRoleLabel } from '../../../core/constants/role-labels';
import { PageHeader, StatCard, EmptyState, ConfirmationDialog } from '../../../shared/ui';
import { AddMembershipDialogComponent } from './dialogs/add-membership';

/* ------------------------------------------------------------------ */
/*  Row model                                                           */
/* ------------------------------------------------------------------ */

interface MembershipRow {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  role: string;
  scopeType: string;
  scopeRefId: string;
  active: boolean;
}

/* ------------------------------------------------------------------ */
/*  Filter types                                                        */
/* ------------------------------------------------------------------ */

type RoleFilter = 'Todos' | 'PLATFORM_ADMIN' | 'SCHOOL_ADMIN' | 'BRANCH_ADMIN' | 'TEACHER' | 'STUDENT';
type StatusFilter = 'Todos' | 'Activo' | 'Inactivo';
type PageSize = 10 | 25 | 50;

/* ------------------------------------------------------------------ */
/*  Display helpers                                                     */
/* ------------------------------------------------------------------ */

const ROLE_COLORS: Record<string, string> = {
  PLATFORM_ADMIN: '#2563EB',
  SCHOOL_ADMIN: '#3B82F6',
  BRANCH_ADMIN: '#8B5CF6',
  TEACHER: '#10B981',
  STUDENT: '#F59E0B',
};

const ROLE_BG: Record<string, string> = {
  PLATFORM_ADMIN: 'rgba(37, 99, 235, 0.1)',
  SCHOOL_ADMIN: 'rgba(59, 130, 246, 0.1)',
  BRANCH_ADMIN: 'rgba(139, 92, 246, 0.1)',
  TEACHER: 'rgba(16, 185, 129, 0.1)',
  STUDENT: 'rgba(245, 158, 11, 0.1)',
};

const SCOPE_COLORS: Record<string, string> = {
  PLATFORM: '#6366F1',
  SCHOOL: '#3B82F6',
  BRANCH: '#8B5CF6',
  COURSE: '#10B981',
};

const SCOPE_BG: Record<string, string> = {
  PLATFORM: 'rgba(99, 102, 241, 0.1)',
  SCHOOL: 'rgba(59, 130, 246, 0.1)',
  BRANCH: 'rgba(139, 92, 246, 0.1)',
  COURSE: 'rgba(16, 185, 129, 0.1)',
};

/* ------------------------------------------------------------------ */
/*  Component                                                           */
/* ------------------------------------------------------------------ */

@Component({
  selector: 'app-memberships-page',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterModule,
    PageHeader,
    StatCard,
    EmptyState,
    ConfirmationDialog,
    AddMembershipDialogComponent,
    LucideKey,
    LucideSearch,
    LucideEye,
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
  ],
  templateUrl: './memberships-page.html',
  styleUrl: './memberships-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MembershipsPageComponent {
  /* ---- Dependencies -------------------------------------------------- */
  private readonly usersService = inject(UsersService);
  private readonly membershipsService = inject(MembershipsService);
  private readonly router = inject(Router);

  /* ---- State --------------------------------------------------------- */
  readonly rows = signal<MembershipRow[]>([]);
  readonly loading = signal(true);
  readonly error = signal(false);

  readonly roleFilter = signal<RoleFilter>('Todos');
  readonly statusFilter = signal<StatusFilter>('Todos');
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
  readonly selectedMembership = signal<MembershipRow | null>(null);

  /* ---- Computed: Stats ----------------------------------------------- */
  readonly totalRows = computed(() => this.rows().length);
  readonly activeRows = computed(() => this.rows().filter((r) => r.active).length);
  readonly inactiveRows = computed(() => this.rows().filter((r) => !r.active).length);

  /* ---- Computed: Filtered rows --------------------------------------- */
  readonly filteredRows = computed(() => {
    let result = this.rows();

    const role = this.roleFilter();
    if (role !== 'Todos') {
      result = result.filter((r) => r.role === role);
    }

    const status = this.statusFilter();
    if (status === 'Activo') {
      result = result.filter((r) => r.active);
    } else if (status === 'Inactivo') {
      result = result.filter((r) => !r.active);
    }

    const search = this.searchTerm().toLowerCase().trim();
    if (search) {
      result = result.filter(
        (r) =>
          r.userName.toLowerCase().includes(search) ||
          r.userEmail.toLowerCase().includes(search) ||
          r.role.toLowerCase().includes(search),
      );
    }

    // Sort
    const col = this.sortColumn();
    if (col) {
      const dir = this.sortDirection() === 'asc' ? 1 : -1;
      result = [...result].sort((a, b) => {
        const va = (a as unknown as Record<string, unknown>)[col] ?? '';
        const vb = (b as unknown as Record<string, unknown>)[col] ?? '';
        if (typeof va === 'boolean') {
          return ((va ? 1 : 0) - (vb ? 1 : 0)) * dir;
        }
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
    const total = this.filteredRows().length;
    const size = this.pageSize();
    return Math.max(1, Math.ceil(total / size));
  });

  readonly paginatedRows = computed(() => {
    const page = this.currentPage();
    const size = this.pageSize();
    const start = (page - 1) * size;
    return this.filteredRows().slice(start, start + size);
  });

  readonly showingFrom = computed(() => {
    const total = this.filteredRows().length;
    if (total === 0) return 0;
    return (this.currentPage() - 1) * this.pageSize() + 1;
  });

  readonly showingTo = computed(() => {
    const total = this.filteredRows().length;
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
    const r = this.selectedMembership();
    if (!r) return '';
    return r.active ? 'Desactivar membresía' : 'Activar membresía';
  });

  readonly statusDialogMessage = computed(() => {
    const r = this.selectedMembership();
    if (!r) return '';
    const action = r.active ? 'desactivar' : 'activar';
    return `¿Estás seguro de que deseas ${action} la membresía de ${r.userName} (${this.roleLabel(r.role)})?`;
  });

  readonly statusDialogConfirmLabel = computed(() => {
    const r = this.selectedMembership();
    if (!r) return 'Confirmar';
    return r.active ? 'Desactivar' : 'Activar';
  });

  /* ---- Lifecycle ----------------------------------------------------- */
  constructor() {
    this.loadData();
  }

  /* ---- Data loading -------------------------------------------------- */
  loadData(): void {
    this.loading.set(true);
    this.error.set(false);

    this.usersService.getAll().subscribe({
      next: (users) => {
        if (users.length === 0) {
          this.rows.set([]);
          this.loading.set(false);
          return;
        }

        const requests = users.map((user) =>
          this.membershipsService.getByUser(user.id).pipe(
            map((memberships) =>
              memberships.map((m: Membership) => ({
                id: m.id,
                userId: m.userId,
                userName: user.fullName,
                userEmail: user.email,
                role: m.role,
                scopeType: m.scopeType,
                scopeRefId: m.scopeRefId,
                active: m.active,
              } as MembershipRow)),
            ),
            catchError(() => of([] as MembershipRow[])),
          ),
        );

        forkJoin(requests).subscribe((results) => {
          const flat = results.flat();
          this.rows.set(flat);
          this.currentPage.set(1);
          this.loading.set(false);
        });
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
    this.currentPage.set(1);
  }

  setStatusFilter(value: string): void {
    this.statusFilter.set(value as StatusFilter);
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

  // Create dialog
  openCreateDialog(): void {
    this.createDialogVisible.set(true);
  }

  closeCreateDialog(): void {
    this.createDialogVisible.set(false);
  }

  onMembershipCreated(): void {
    this.loadData();
  }

  // Status dialog
  openStatusDialog(row: MembershipRow): void {
    this.selectedMembership.set(row);
    this.statusDialogVisible.set(true);
  }

  closeStatusDialog(): void {
    this.statusDialogVisible.set(false);
    this.selectedMembership.set(null);
  }

  async confirmStatusChange(): Promise<void> {
    const row = this.selectedMembership();
    if (!row) return;

    try {
      if (row.active) {
        await firstValueFrom(this.membershipsService.deactivate(row.id));
      } else {
        await firstValueFrom(this.membershipsService.activate(row.id));
      }
      this.statusDialogVisible.set(false);
      this.selectedMembership.set(null);
      this.loadData();
    } catch {
      // silently fail
    }
  }

  // View user
  viewUser(row: MembershipRow): void {
    this.router.navigate(['/users', row.userId]);
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

  scopeColor(scopeType: string | undefined): string {
    return SCOPE_COLORS[scopeType ?? ''] ?? '#6B7280';
  }

  scopeBg(scopeType: string | undefined): string {
    return SCOPE_BG[scopeType ?? ''] ?? 'rgba(107, 114, 128, 0.1)';
  }

  scopeLabel(scopeType: string | undefined): string {
    const labels: Record<string, string> = {
      PLATFORM: 'Plataforma',
      SCHOOL: 'Escuela',
      BRANCH: 'Sede',
      COURSE: 'Curso',
    };
    return labels[scopeType ?? ''] ?? scopeType ?? '—';
  }

  statusLabel(active: boolean): string {
    return active ? 'Activo' : 'Inactivo';
  }

  typeLabel(scopeType: string): string {
    const labels: Record<string, string> = {
      PLATFORM: 'Plataforma',
      SCHOOL: 'Escuela',
      BRANCH: 'Sede',
      COURSE: 'Curso',
    };
    return labels[scopeType] ?? scopeType;
  }
}
