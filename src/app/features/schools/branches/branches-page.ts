import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { BranchesService } from './services/branches';
import { SchoolsService } from '../services/schools';
import { BranchResponse } from './models/branch';
import { School } from '../models/school';
import { TableColumn, TableAction, RowActionEvent } from '../../../shared/ui/models';
import { PageHeader, DataTable, EmptyState } from '../../../shared/ui';

@Component({
  selector: 'app-branches-page',
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatButtonToggleModule,
    RouterModule,
    PageHeader,
    DataTable,
    EmptyState,
  ],
  templateUrl: './branches-page.html',
  styleUrl: './branches-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BranchesPage {
  private readonly branchesService = inject(BranchesService);
  private readonly schoolsService = inject(SchoolsService);
  private readonly route = inject(ActivatedRoute);
  private readonly dialog = inject(MatDialog);

  readonly school = signal<School | null>(null);
  private readonly _allBranches = signal<BranchResponse[]>([]);
  readonly loading = signal(true);
  readonly error = signal(false);
  readonly searchTerm = signal('');
  readonly statusFilter = signal<'all' | 'ACTIVE' | 'INACTIVE'>('all');

  readonly branches = computed(() => {
    let result = this._allBranches();
    const term = this.searchTerm().toLowerCase();
    if (term) {
      result = result.filter(
        (b) =>
          b.name.toLowerCase().includes(term) ||
          b.code.toLowerCase().includes(term)
      );
    }
    if (this.statusFilter() !== 'all') {
      result = result.filter((b) => b.status === this.statusFilter());
    }
    return result;
  });

  readonly branchColumns: TableColumn[] = [
    { key: 'name', label: 'Nombre' },
    { key: 'code', label: 'Código' },
    { key: 'address', label: 'Dirección' },
    { key: 'status', label: 'Estado' },
  ];

  readonly rowActions: TableAction[] = [
    { icon: 'pencil', label: 'Editar', action: 'edit' },
    { icon: 'trash2', label: 'Cambiar Estado', action: 'status' },
  ];

  readonly tableData = computed(() =>
    this.branches() as unknown as Record<string, unknown>[]
  );

  readonly pageTitle = computed(() => {
    const s = this.school();
    return s ? `${s.name} — Sedes` : 'Sedes';
  });

  private schoolId: string | null = null;

  constructor() {
    this.route.params.subscribe((params) => {
      this.schoolId = params['schoolId'] as string;
      if (this.schoolId) {
        this.loadData();
      }
    });
  }

  loadData(): void {
    if (!this.schoolId) return;

    this.loading.set(true);
    this.error.set(false);

    this.schoolsService.getById(this.schoolId).subscribe({
      next: (school: School) => {
        this.school.set(school);
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
      },
    });

    this.branchesService.getBySchool(this.schoolId).subscribe({
      next: (result: BranchResponse[]) => {
        this._allBranches.set(result);
        this.loading.set(false);
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
      },
    });
  }

  onSearchInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchTerm.set(input.value);
  }

  clearSearch(): void {
    this.searchTerm.set('');
  }

  setStatusFilter(value: 'all' | 'ACTIVE' | 'INACTIVE'): void {
    this.statusFilter.set(value);
  }

  onRowAction(event: RowActionEvent): void {
    const row = event.row as unknown as BranchResponse;
    if (event.action === 'edit') {
      this.openEditDialog(row);
    } else if (event.action === 'status') {
      this.openStatusDialog(row);
    }
  }

  async openCreateDialog(): Promise<void> {
    const { CreateBranchDialogComponent } = await import('./dialogs/create-branch');
    const dialogRef = this.dialog.open(CreateBranchDialogComponent, {
      width: '480px',
      data: this.schoolId,
    });
    dialogRef.afterClosed().subscribe((result: BranchResponse | undefined) => {
      if (result) {
        this.loadData();
      }
    });
  }

  async openEditDialog(branch: BranchResponse): Promise<void> {
    const { EditBranchDialogComponent } = await import('./dialogs/edit-branch');
    const dialogRef = this.dialog.open(EditBranchDialogComponent, {
      width: '480px',
      data: branch,
    });
    dialogRef.afterClosed().subscribe((result: BranchResponse | undefined) => {
      if (result) {
        this.loadData();
      }
    });
  }

  async openStatusDialog(branch: BranchResponse): Promise<void> {
    const { BranchStatusDialogComponent } = await import('./dialogs/branch-status');
    const dialogRef = this.dialog.open(BranchStatusDialogComponent, {
      width: '480px',
      data: branch,
    });
    dialogRef.afterClosed().subscribe((result: BranchResponse | undefined) => {
      if (result) {
        const all = this._allBranches();
        const index = all.findIndex((b) => b.id === result.id);
        if (index !== -1) {
          const updated = [...all];
          updated[index] = result;
          this._allBranches.set(updated);
        }
      }
    });
  }
}
