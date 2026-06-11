import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';
import { SchoolsService } from '../services/schools';
import { BranchesService } from './services/branches';
import { BranchResponse } from './models/branch';
import { School } from '../models/school';
import { PageHeader, StatCard, EmptyState } from '../../../shared/ui';
import {
  LucideGitBranch,
  LucideSearch,
  LucideEye,
  LucideChevronLeft,
  LucideChevronRight,
  LucideArrowUp,
  LucideArrowDown,
  LucidePlus,
} from '@lucide/angular';

interface BranchRow extends BranchResponse {
  schoolName: string;
}

@Component({
  selector: 'app-branches-list',
  imports: [
    RouterModule,
    PageHeader,
    StatCard,
    EmptyState,
    LucideGitBranch,
    LucideSearch,
    LucideEye,
    LucideChevronLeft,
    LucideChevronRight,
    LucideArrowUp,
    LucideArrowDown,
    LucidePlus,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './branches-list.html',
  styles: `
    .branches-page { padding: 0; }
    .stats-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 24px; }
    @media (max-width: 768px) { .stats-row { grid-template-columns: 1fr; } }
    .table-card { background: #fff; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,.06); border: 1px solid #e5e7eb; overflow: hidden; }
    .table-toolbar { display: flex; align-items: center; gap: 12px; padding: 12px 16px; border-bottom: 1px solid #e5e7eb; }
    .search-wrapper { position: relative; flex: 1; max-width: 320px; }
    .search-icon { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); width: 16px; height: 16px; color: #9ca3af; }
    .search-input { width: 100%; height: 36px; padding: 0 12px 0 32px; border: 1.5px solid #d1d5db; border-radius: 8px; font-size: 13px; outline: none; }
    .search-input:focus { border-color: #2563eb; box-shadow: 0 0 0 2px rgba(37,99,235,.1); }
    table { width: 100%; border-collapse: collapse; }
    thead { background: #f9fafb; }
    th { padding: 10px 16px; font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; text-align: left; cursor: pointer; user-select: none; }
    th:hover { color: #2563eb; }
    td { padding: 12px 16px; font-size: 14px; border-bottom: 1px solid #f3f4f6; }
    tr:hover { background: #f9fafb; }
    .type-badge { display: inline-block; padding: 2px 10px; border-radius: 12px; font-size: 12px; font-weight: 500; }
    .type-MAIN { background: rgba(37,99,235,.1); color: #2563eb; }
    .type-SECONDARY { background: rgba(16,185,129,.1); color: #10b981; }
    .type-VIRTUAL { background: rgba(245,158,11,.1); color: #f59e0b; }
    .type-TEMPORARY { background: rgba(107,114,128,.1); color: #6b7280; }
    .status-badge { display: inline-block; padding: 2px 10px; border-radius: 12px; font-size: 12px; font-weight: 500; }
    .status-ACTIVE { background: rgba(16,185,129,.1); color: #10b981; }
    .status-INACTIVE { background: rgba(239,68,68,.1); color: #ef4444; }
    .action-btn { display: inline-flex; align-items: center; justify-content: center; width: 32px; height: 32px; border: none; background: none; border-radius: 6px; cursor: pointer; color: #6b7280; }
    .action-btn:hover { background: #f3f4f6; color: #2563eb; }
    .action-btn svg { width: 16px; height: 16px; }
    .pagination { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; border-top: 1px solid #e5e7eb; font-size: 13px; color: #6b7280; }
    .pagination-controls { display: flex; gap: 4px; }
    .page-btn { display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; border: 1px solid #d1d5db; border-radius: 6px; background: #fff; cursor: pointer; font-size: 13px; }
    .page-btn:disabled { opacity: .4; cursor: default; }
    .page-btn.active { background: #2563eb; color: #fff; border-color: #2563eb; }
    .page-btn svg { width: 14px; height: 14px; }
    .loading-state { display: flex; align-items: center; justify-content: center; padding: 48px; color: #6b7280; }
    .sort-icon { width: 12px; height: 12px; vertical-align: middle; margin-left: 2px; }
  `,
})
export class BranchesListComponent {
  private readonly schoolsService = inject(SchoolsService);
  private readonly branchesService = inject(BranchesService);

  readonly branches = signal<BranchRow[]>([]);
  readonly loading = signal(true);
  readonly error = signal(false);
  readonly searchTerm = signal('');
  readonly sortColumn = signal<string | null>(null);
  readonly sortDirection = signal<'asc' | 'desc'>('asc');
  readonly currentPage = signal(1);
  readonly pageSize = signal(10);

  readonly filteredBranches = computed(() => {
    let result = this.branches();
    const search = this.searchTerm().toLowerCase().trim();
    if (search) {
      result = result.filter(b => b.name.toLowerCase().includes(search) || b.code.toLowerCase().includes(search) || b.schoolName.toLowerCase().includes(search));
    }
    const col = this.sortColumn();
    if (col) {
      const dir = this.sortDirection() === 'asc' ? 1 : -1;
      result = [...result].sort((a: any, b: any) => String(a[col] ?? '').localeCompare(String(b[col] ?? '')) * dir);
    }
    return result;
  });

  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.filteredBranches().length / this.pageSize())));
  readonly paginatedBranches = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    return this.filteredBranches().slice(start, start + this.pageSize());
  });

  readonly totalBranches = computed(() => this.branches().length);
  readonly activeBranches = computed(() => this.branches().filter(b => b.status === 'ACTIVE').length);
  readonly inactiveBranches = computed(() => this.branches().filter(b => b.status === 'INACTIVE').length);
  readonly showingTo = computed(() => Math.min(this.currentPage() * this.pageSize(), this.filteredBranches().length));

  constructor() { this.loadData(); }

  loadData(): void {
    this.loading.set(true);
    this.schoolsService.getAll().subscribe({
      next: (schools) => {
        if (schools.length === 0) { this.branches.set([]); this.loading.set(false); return; }
        const reqs = schools.map(s => this.branchesService.getBySchool(s.id));
        forkJoin(reqs).subscribe({
          next: (results) => {
            const all: BranchRow[] = [];
            results.forEach((list, i) => list.forEach(b => all.push({ ...b, schoolName: schools[i].name })));
            this.branches.set(all);
            this.loading.set(false);
          },
          error: () => { this.error.set(true); this.loading.set(false); },
        });
      },
      error: () => { this.error.set(true); this.loading.set(false); },
    });
  }

  sortBy(col: string): void {
    if (this.sortColumn() === col) this.sortDirection.update(d => d === 'asc' ? 'desc' : 'asc');
    else { this.sortColumn.set(col); this.sortDirection.set('asc'); }
  }

  onSearch(e: Event): void { this.searchTerm.set((e.target as HTMLInputElement).value); this.currentPage.set(1); }
  prevPage(): void { if (this.currentPage() > 1) this.currentPage.update(p => p - 1); }
  nextPage(): void { if (this.currentPage() < this.totalPages()) this.currentPage.update(p => p + 1); }
  goToPage(p: number): void { this.currentPage.set(p); }

  getTypeClass(type: string): string { return 'type-' + (type || 'SECONDARY'); }
  getStatusClass(status: string): string { return 'status-' + (status || 'ACTIVE'); }
}
