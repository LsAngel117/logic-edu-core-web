import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import {
  LucidePlus,
  LucideSearch,
  LucideArrowLeft,
  LucidePencil,
  LucidePower,
  LucideShield,
  LucideChevronLeft,
  LucideChevronRight,
  LucideArrowUp,
  LucideArrowDown,
} from '@lucide/angular';
import { BranchesService } from './services/branches';
import { SchoolsService } from '../services/schools';
import { statusLabel as getStatusLabel } from '../../../core/constants/display-labels';
import { BranchResponse } from './models/branch';
import { School } from '../models/school';
import { PageHeader, StatCard, EmptyState, ConfirmationDialog } from '../../../shared/ui';
import { CreateBranchDialogComponent } from './dialogs/create-branch';
import { EditBranch } from './dialogs/edit-branch';

/* ------------------------------------------------------------------ */
/*  Filter types                                                        */
/* ------------------------------------------------------------------ */

type StatusFilter = 'Todos' | 'ACTIVE' | 'INACTIVE';
type PageSize = 10 | 25 | 50;

/* ------------------------------------------------------------------ */
/*  Type display helpers                                                */
/* ------------------------------------------------------------------ */

const TYPE_COLORS: Record<string, string> = {
  MAIN: '#2563EB',
  SECONDARY: '#3B82F6',
  VIRTUAL: '#8B5CF6',
};

const TYPE_BG: Record<string, string> = {
  MAIN: 'rgba(37, 99, 235, 0.1)',
  SECONDARY: 'rgba(59, 130, 246, 0.1)',
  VIRTUAL: 'rgba(139, 92, 246, 0.1)',
};

const STATUS_CLASSES: Record<string, string> = {
  ACTIVE: 'status--active',
  INACTIVE: 'status--inactive',
};

/* ------------------------------------------------------------------ */
/*  Component                                                           */
/* ------------------------------------------------------------------ */

@Component({
  selector: 'app-branches-page',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterModule,
    PageHeader,
    StatCard,
    EmptyState,
    ConfirmationDialog,
    LucidePlus,
    LucideSearch,
    LucideArrowLeft,
    LucidePencil,
    LucidePower,
    LucideShield,
    LucideChevronLeft,
    LucideChevronRight,
    LucideArrowUp,
    LucideArrowDown,
    CreateBranchDialogComponent,
    EditBranch,
  ],
  templateUrl: './branches-page.html',
  styleUrl: './branches-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BranchesPage {
  /* ---- Dependencies -------------------------------------------------- */
  private readonly branchesService = inject(BranchesService);
  private readonly schoolsService = inject(SchoolsService);
  private readonly route = inject(ActivatedRoute);

  /* ---- State --------------------------------------------------------- */
  readonly school = signal<School | null>(null);
  readonly branches = signal<BranchResponse[]>([]);
  readonly loading = signal(true);
  readonly error = signal(false);

  readonly statusFilter = signal<StatusFilter>('Todos');
  readonly searchTerm = signal('');
  readonly sortColumn = signal<string | null>(null);
  readonly sortDirection = signal<'asc' | 'desc'>('asc');

  // Pagination
  readonly currentPage = signal(1);
  readonly pageSize = signal<PageSize>(10);

  // Dialog visibility
  readonly editBranchVisible = signal(false);
  readonly statusDialogVisible = signal(false);
  readonly selectedBranch = signal<BranchResponse | null>(null);
  readonly editingBranch = signal<BranchResponse | null>(null);

  /* ---- Computed: Stats ----------------------------------------------- */
  readonly totalBranches = computed(() => this.branches().length);
  readonly activeBranches = computed(() => this.branches().filter((b) => b.status === 'ACTIVE').length);
  readonly inactiveBranches = computed(() => this.branches().filter((b) => b.status === 'INACTIVE').length);

  /* ---- Computed: Filtered branches ----------------------------------- */
  readonly filteredBranches = computed(() => {
    let result = this.branches();

    const status = this.statusFilter();
    if (status !== 'Todos') {
      result = result.filter((b) => b.status === status);
    }

    const search = this.searchTerm().toLowerCase().trim();
    if (search) {
      result = result.filter(
        (b) =>
          b.name.toLowerCase().includes(search) ||
          b.code.toLowerCase().includes(search),
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
    const total = this.filteredBranches().length;
    const size = this.pageSize();
    return Math.max(1, Math.ceil(total / size));
  });

  readonly paginatedBranches = computed(() => {
    const page = this.currentPage();
    const size = this.pageSize();
    const start = (page - 1) * size;
    return this.filteredBranches().slice(start, start + size);
  });

  readonly showingFrom = computed(() => {
    const total = this.filteredBranches().length;
    if (total === 0) return 0;
    return (this.currentPage() - 1) * this.pageSize() + 1;
  });

  readonly showingTo = computed(() => {
    const total = this.filteredBranches().length;
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

  /* ---- Page header computed ------------------------------------------ */
  readonly pageTitle = computed(() => {
    const s = this.school();
    return s ? `${s.name} — Sedes` : 'Sedes';
  });

  /* ---- Status dialog computed props ---------------------------------- */
  readonly statusDialogTitle = computed(() => {
    const b = this.selectedBranch();
    if (!b) return '';
    return b.status === 'ACTIVE' ? 'Desactivar sede' : 'Activar sede';
  });

  readonly statusDialogMessage = computed(() => {
    const b = this.selectedBranch();
    if (!b) return '';
    const action = b.status === 'ACTIVE' ? 'desactivar' : 'activar';
    return `¿Estás seguro de que deseas ${action} a ${b.name}?`;
  });

  readonly statusDialogConfirmLabel = computed(() => {
    const b = this.selectedBranch();
    if (!b) return 'Confirmar';
    return b.status === 'ACTIVE' ? 'Desactivar' : 'Activar';
  });

  /* ---- Route data ---------------------------------------------------- */
  readonly schoolId = signal('');

  /* ---- Lifecycle ----------------------------------------------------- */
  constructor() {
    this.route.params.subscribe((params) => {
      const id = params['schoolId'] as string;
      this.schoolId.set(id);
      if (id) {
        this.loadData();
      }
    });
  }

  /* ---- Data loading -------------------------------------------------- */
  loadData(): void {
    if (!this.schoolId()) return;
    this.loading.set(true);
    this.error.set(false);

    this.schoolsService.getById(this.schoolId()).subscribe({
      next: (school: School) => {
        this.school.set(school);
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
      },
    });

    this.branchesService.getBySchool(this.schoolId()).subscribe({
      next: (result: BranchResponse[]) => {
        this.branches.set(result);
        this.currentPage.set(1);
        this.loading.set(false);
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
      },
    });
  }

  /* ---- Filter handlers ----------------------------------------------- */
  setStatusFilter(value: string): void {
    this.statusFilter.set(value as StatusFilter);
    this.currentPage.set(1);
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

  readonly createDialogVisible = signal(false);

  onBranchCreated(): void {
    this.loadData();
  }

  async openEditDialog(branch: BranchResponse): Promise<void> {
    this.editingBranch.set(branch);
    this.editBranchVisible.set(true);
  }

  onBranchSaved(): void {
    this.editBranchVisible.set(false);
    this.editingBranch.set(null);
    this.loadData();
  }

  // Status dialog
  openStatusDialog(branch: BranchResponse): void {
    this.selectedBranch.set(branch);
    this.statusDialogVisible.set(true);
  }

  closeStatusDialog(): void {
    this.statusDialogVisible.set(false);
    this.selectedBranch.set(null);
  }

  async confirmStatusChange(): Promise<void> {
    const branch = this.selectedBranch();
    if (!branch || !this.schoolId()) return;

    try {
      await firstValueFrom(this.branchesService.updateStatus(this.schoolId(), branch.id));
      this.statusDialogVisible.set(false);
      this.selectedBranch.set(null);
      this.loadData();
    } catch {
      // silently fail — user retries
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

  typeColor(type: string): string {
    return TYPE_COLORS[type] ?? '#6B7280';
  }

  typeBg(type: string): string {
    return TYPE_BG[type] ?? 'rgba(107, 114, 128, 0.1)';
  }

  statusClass(status: string): string {
    return STATUS_CLASSES[status] ?? 'status--default';
  }

  statusLabel(s: string): string { return getStatusLabel(s); }
}
