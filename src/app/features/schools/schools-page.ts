import { ChangeDetectionStrategy, Component, computed, HostListener, inject, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import {
  LucidePlus,
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
import { SchoolsService } from './services/schools';
import { School } from './models/school';
import { PageHeader, StatCard, EmptyState, ConfirmationDialog } from '../../shared/ui';

/* ------------------------------------------------------------------ */
/*  Filter types                                                        */
/* ------------------------------------------------------------------ */

type StatusFilter = 'Todos' | 'ACTIVE' | 'INACTIVE';
type PageSize = 10 | 25 | 50;

/* ------------------------------------------------------------------ */
/*  Status display helpers                                              */
/* ------------------------------------------------------------------ */

const STATUS_CLASSES: Record<string, string> = {
  ACTIVE: 'status--active',
  INACTIVE: 'status--inactive',
};

/* ------------------------------------------------------------------ */
/*  Component                                                           */
/* ------------------------------------------------------------------ */

@Component({
  selector: 'app-schools-page',
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
  ],
  templateUrl: './schools-page.html',
  styleUrl: './schools-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SchoolsPageComponent {
  /* ---- Dependencies -------------------------------------------------- */
  private readonly schoolsService = inject(SchoolsService);
  private readonly router = inject(Router);

  /* ---- State --------------------------------------------------------- */
  readonly schools = signal<School[]>([]);
  readonly loading = signal(true);
  readonly error = signal(false);

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
  readonly selectedSchool = signal<School | null>(null);

  /* ---- Computed: Stats ----------------------------------------------- */
  readonly totalSchools = computed(() => this.schools().length);
  readonly activeSchools = computed(() => this.schools().filter((s) => s.status === 'ACTIVE').length);
  readonly inactiveSchools = computed(() => this.schools().filter((s) => s.status === 'INACTIVE').length);
  readonly branchesCount = computed(() => 0); // TODO: wire branch count when API supports it

  /* ---- Computed: Filtered schools ------------------------------------ */
  readonly filteredSchools = computed(() => {
    let result = this.schools();

    const status = this.statusFilter();
    if (status !== 'Todos') {
      result = result.filter((s) => s.status === status);
    }

    const search = this.searchTerm().toLowerCase().trim();
    if (search) {
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(search) ||
          s.code.toLowerCase().includes(search),
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
    const total = this.filteredSchools().length;
    const size = this.pageSize();
    return Math.max(1, Math.ceil(total / size));
  });

  readonly paginatedSchools = computed(() => {
    const page = this.currentPage();
    const size = this.pageSize();
    const start = (page - 1) * size;
    return this.filteredSchools().slice(start, start + size);
  });

  readonly showingFrom = computed(() => {
    const total = this.filteredSchools().length;
    if (total === 0) return 0;
    return (this.currentPage() - 1) * this.pageSize() + 1;
  });

  readonly showingTo = computed(() => {
    const total = this.filteredSchools().length;
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
    const s = this.selectedSchool();
    if (!s) return '';
    return s.status === 'ACTIVE' ? 'Desactivar institución' : 'Activar institución';
  });

  readonly statusDialogMessage = computed(() => {
    const s = this.selectedSchool();
    if (!s) return '';
    const action = s.status === 'ACTIVE' ? 'desactivar' : 'activar';
    return `¿Estás seguro de que deseas ${action} a ${s.name}?`;
  });

  readonly statusDialogConfirmLabel = computed(() => {
    const s = this.selectedSchool();
    if (!s) return 'Confirmar';
    return s.status === 'ACTIVE' ? 'Desactivar' : 'Activar';
  });

  /* ---- Lifecycle ----------------------------------------------------- */
  constructor() {
    this.loadSchools();
  }

  /* ---- Data loading -------------------------------------------------- */
  loadSchools(): void {
    this.loading.set(true);
    this.error.set(false);

    this.schoolsService.getAll().subscribe({
      next: (result: School[]) => {
        this.schools.set(result);
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

  // Create dialog
  async openCreateDialog(): Promise<void> {
    const { CreateSchoolDialogComponent } = await import('./dialogs/create-school');
    // Material dialog fallback — will be replaced with app-dialog in future
    const { MatDialog } = await import('@angular/material/dialog');
    const dialog = inject(MatDialog);
    const dialogRef = dialog.open(CreateSchoolDialogComponent, { width: '480px' });
    dialogRef.afterClosed().subscribe((result: School | undefined) => {
      if (result) {
        this.loadSchools();
      }
    });
  }

  async openEditDialog(school: School): Promise<void> {
    const { EditSchoolDialogComponent } = await import('./dialogs/edit-school');
    const { MatDialog } = await import('@angular/material/dialog');
    const dialog = inject(MatDialog);
    const dialogRef = dialog.open(EditSchoolDialogComponent, {
      width: '480px',
      data: school,
    });
    dialogRef.afterClosed().subscribe((result: School | undefined) => {
      if (result) {
        this.loadSchools();
      }
    });
  }

  // Status dialog
  openStatusDialog(school: School): void {
    this.selectedSchool.set(school);
    this.statusDialogVisible.set(true);
  }

  closeStatusDialog(): void {
    this.statusDialogVisible.set(false);
    this.selectedSchool.set(null);
  }

  async confirmStatusChange(): Promise<void> {
    const school = this.selectedSchool();
    if (!school) return;

    try {
      await firstValueFrom(this.schoolsService.updateStatus(school.id));
      this.statusDialogVisible.set(false);
      this.selectedSchool.set(null);
      this.loadSchools();
    } catch {
      // silently fail — user retries
    }
  }

  // View school / branches
  viewBranches(school: School): void {
    this.router.navigate(['/schools', school.id, 'branches']);
  }

  /* ---- Helpers ------------------------------------------------------- */
  getInitials(name: string): string {
    const parts = name.trim().split(/\s+/);
    return parts
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() ?? '')
      .join('');
  }

  statusClass(status: string): string {
    return STATUS_CLASSES[status] ?? 'status--default';
  }
}
