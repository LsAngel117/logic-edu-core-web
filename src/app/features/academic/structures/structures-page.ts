import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import {
  LucidePlus,
  LucideSearch,
  LucidePencil,
  LucidePower,
  LucideShield,
  LucideChevronLeft,
  LucideChevronRight,
  LucideArrowUp,
  LucideArrowDown,
  LucideSchool,
} from '@lucide/angular';
import { StructuresService } from './services/structures';
import { SchoolsService } from '../../schools/services/schools';
import { School } from '../../schools/models/school';
import { AcademicStructureResponse } from './models/structure';
import { PageHeader, StatCard, ConfirmationDialog } from '../../../shared/ui';
import { CreateStructureDialogComponent } from './dialogs/create-structure';

/* ------------------------------------------------------------------ */
/*  Filter types                                                        */
/* ------------------------------------------------------------------ */

type StatusFilter = 'Todos' | 'ACTIVE' | 'INACTIVE';
type PageSize = 10 | 25 | 50;

/* ------------------------------------------------------------------ */
/*  Structure type display helpers                                      */
/* ------------------------------------------------------------------ */

const STRUCTURE_TYPE_LABELS: Record<string, string> = {
  PRIMARIA: 'Primaria',
  SECUNDARIA: 'Secundaria',
  MEDIA: 'Media',
  UNIVERSITARIA: 'Universitaria',
  PERSONALIZADA: 'Personalizada',
};

const TYPE_COLORS: Record<string, string> = {
  PRIMARIA: '#2563EB',
  SECUNDARIA: '#3B82F6',
  MEDIA: '#10B981',
  UNIVERSITARIA: '#8B5CF6',
  PERSONALIZADA: '#F59E0B',
};

const TYPE_BG: Record<string, string> = {
  PRIMARIA: 'rgba(37, 99, 235, 0.1)',
  SECUNDARIA: 'rgba(59, 130, 246, 0.1)',
  MEDIA: 'rgba(16, 185, 129, 0.1)',
  UNIVERSITARIA: 'rgba(139, 92, 246, 0.1)',
  PERSONALIZADA: 'rgba(245, 158, 11, 0.1)',
};

const STATUS_CLASSES: Record<string, string> = {
  ACTIVE: 'status--active',
  INACTIVE: 'status--inactive',
};

/* ------------------------------------------------------------------ */
/*  Component                                                           */
/* ------------------------------------------------------------------ */

@Component({
  selector: 'app-structures-page',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterModule,
    PageHeader,
    StatCard,
    ConfirmationDialog,
    LucidePlus,
    LucideSearch,
    LucidePencil,
    LucidePower,
    LucideShield,
    LucideChevronLeft,
    LucideChevronRight,
    LucideArrowUp,
    LucideArrowDown,
    LucideSchool,
    CreateStructureDialogComponent,
  ],
  templateUrl: './structures-page.html',
  styleUrl: './structures-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StructuresPageComponent {
  /* ---- Dependencies -------------------------------------------------- */
  private readonly structuresService = inject(StructuresService);
  private readonly schoolsService = inject(SchoolsService);

  /* ---- State --------------------------------------------------------- */
  readonly schools = signal<School[]>([]);
  readonly selectedSchoolId = signal<string | null>(null);
  readonly structures = signal<AcademicStructureResponse[]>([]);
  readonly loading = signal(false);
  readonly error = signal(false);

  readonly statusFilter = signal<StatusFilter>('Todos');
  readonly searchTerm = signal('');
  readonly sortColumn = signal<string | null>(null);
  readonly sortDirection = signal<'asc' | 'desc'>('asc');

  // Pagination
  readonly currentPage = signal(1);
  readonly pageSize = signal<PageSize>(10);

  // Dialog visibility
  readonly createDialogVisible = signal(false);
  readonly statusDialogVisible = signal(false);
  readonly selectedStructure = signal<AcademicStructureResponse | null>(null);

  /* ---- Computed: Selected school name -------------------------------- */
  readonly selectedSchoolName = computed(() => {
    const id = this.selectedSchoolId();
    if (!id) return '';
    const school = this.schools().find((s) => s.id === id);
    return school?.name ?? '';
  });

  /* ---- Computed: Stats ----------------------------------------------- */
  readonly totalStructures = computed(() => this.structures().length);
  readonly activeStructures = computed(() => this.structures().filter((s) => s.active).length);
  readonly inactiveStructures = computed(() => this.structures().filter((s) => !s.active).length);

  /* ---- Computed: Filtered structures --------------------------------- */
  readonly filteredStructures = computed(() => {
    let result = this.structures();

    const status = this.statusFilter();
    if (status !== 'Todos') {
      const isActive = status === 'ACTIVE';
      result = result.filter((s) => s.active === isActive);
    }

    const search = this.searchTerm().toLowerCase().trim();
    if (search) {
      result = result.filter(
        (s) =>
          STRUCTURE_TYPE_LABELS[s.structureType]?.toLowerCase().includes(search) ||
          s.structureType.toLowerCase().includes(search),
      );
    }

    // Sort
    const col = this.sortColumn();
    if (col) {
      const dir = this.sortDirection() === 'asc' ? 1 : -1;
      result = [...result].sort((a, b) => {
        const va = (a as unknown as Record<string, unknown>)[col] ?? '';
        const vb = (b as unknown as Record<string, unknown>)[col] ?? '';
        if (typeof va === 'number' && typeof vb === 'number') {
          return (va - vb) * dir;
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
    const total = this.filteredStructures().length;
    const size = this.pageSize();
    return Math.max(1, Math.ceil(total / size));
  });

  readonly paginatedStructures = computed(() => {
    const page = this.currentPage();
    const size = this.pageSize();
    const start = (page - 1) * size;
    return this.filteredStructures().slice(start, start + size);
  });

  readonly showingFrom = computed(() => {
    const total = this.filteredStructures().length;
    if (total === 0) return 0;
    return (this.currentPage() - 1) * this.pageSize() + 1;
  });

  readonly showingTo = computed(() => {
    const total = this.filteredStructures().length;
    if (total === 0) return 0;
    return Math.min(this.currentPage() * this.pageSize(), total);
  });

  readonly isFirstPage = computed(() => this.currentPage() <= 1);
  readonly isLastPage = computed(() => this.currentPage() >= this.totalPages());

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
    const s = this.selectedStructure();
    if (!s) return '';
    return s.active ? 'Desactivar estructura' : 'Activar estructura';
  });

  readonly statusDialogMessage = computed(() => {
    const s = this.selectedStructure();
    if (!s) return '';
    const action = s.active ? 'desactivar' : 'activar';
    const typeLabel = STRUCTURE_TYPE_LABELS[s.structureType] ?? s.structureType;
    return `¿Estás seguro de que deseas ${action} la estructura "${typeLabel}"?`;
  });

  readonly statusDialogConfirmLabel = computed(() => {
    const s = this.selectedStructure();
    if (!s) return 'Confirmar';
    return s.active ? 'Desactivar' : 'Activar';
  });

  /* ---- Lifecycle ----------------------------------------------------- */
  constructor() {
    this.loadSchools();
  }

  /* ---- Data loading -------------------------------------------------- */
  loadSchools(): void {
    this.schoolsService.getAll().subscribe((result: School[]) => {
      this.schools.set(result);
    });
  }

  selectSchool(schoolId: string): void {
    this.selectedSchoolId.set(schoolId);
    this.loadStructures();
  }

  loadStructures(): void {
    const schoolId = this.selectedSchoolId();
    if (!schoolId) return;

    this.loading.set(true);
    this.error.set(false);

    this.structuresService.getBySchool(schoolId).subscribe({
      next: (result: AcademicStructureResponse[]) => {
        this.structures.set(result);
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

  onStructureCreated(): void {
    this.loadStructures();
  }

  openStatusDialog(structure: AcademicStructureResponse): void {
    this.selectedStructure.set(structure);
    this.statusDialogVisible.set(true);
  }

  closeStatusDialog(): void {
    this.statusDialogVisible.set(false);
    this.selectedStructure.set(null);
  }

  async confirmStatusChange(): Promise<void> {
    const structure = this.selectedStructure();
    const schoolId = this.selectedSchoolId();
    if (!structure || !schoolId) return;

    try {
      if (structure.active) {
        await firstValueFrom(this.structuresService.deactivate(schoolId, structure.id));
      }
      // For activation, there's no API endpoint defined - just reload
      this.statusDialogVisible.set(false);
      this.selectedStructure.set(null);
      this.loadStructures();
    } catch {
      // silently fail
    }
  }

  /* ---- Helpers ------------------------------------------------------- */
  structureTypeLabel(type: string): string {
    return STRUCTURE_TYPE_LABELS[type] ?? type;
  }

  typeColor(type: string): string {
    return TYPE_COLORS[type] ?? '#6B7280';
  }

  typeBg(type: string): string {
    return TYPE_BG[type] ?? 'rgba(107, 114, 128, 0.1)';
  }

  statusLabel(active: boolean): string {
    return active ? 'Activo' : 'Inactivo';
  }

  statusClass(active: boolean): string {
    return active ? 'status--active' : 'status--inactive';
  }
}
