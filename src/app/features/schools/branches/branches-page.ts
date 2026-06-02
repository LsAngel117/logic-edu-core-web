import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { BranchesService } from './services/branches';
import { SchoolsService } from '../services/schools';
import { Branch } from './models/branch';
import { School } from '../models/school';

@Component({
  selector: 'app-branches-page',
  imports: [
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    RouterModule,
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
  private readonly _allBranches = signal<Branch[]>([]);
  readonly loading = signal(true);
  readonly error = signal(false);
  readonly searchTerm = signal('');

  readonly branches = computed(() => {
    const term = this.searchTerm().toLowerCase();
    if (!term) {
      return this._allBranches();
    }
    return this._allBranches().filter(
      (b) =>
        b.name.toLowerCase().includes(term) ||
        b.code.toLowerCase().includes(term)
    );
  });

  readonly displayedColumns = ['name', 'code', 'address', 'status', 'actions'];

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
      next: (result: Branch[]) => {
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

  async openCreateDialog(): Promise<void> {
    const { CreateBranchDialogComponent } = await import('./dialogs/create-branch');
    const dialogRef = this.dialog.open(CreateBranchDialogComponent, {
      width: '480px',
      data: this.schoolId,
    });
    dialogRef.afterClosed().subscribe((result: Branch | undefined) => {
      if (result) {
        this.loadData();
      }
    });
  }

  async openEditDialog(branch: Branch): Promise<void> {
    const { EditBranchDialogComponent } = await import('./dialogs/edit-branch');
    const dialogRef = this.dialog.open(EditBranchDialogComponent, {
      width: '480px',
      data: branch,
    });
    dialogRef.afterClosed().subscribe((result: Branch | undefined) => {
      if (result) {
        this.loadData();
      }
    });
  }

  async openStatusDialog(branch: Branch): Promise<void> {
    const { BranchStatusDialogComponent } = await import('./dialogs/branch-status');
    const dialogRef = this.dialog.open(BranchStatusDialogComponent, {
      width: '480px',
      data: branch,
    });
    dialogRef.afterClosed().subscribe((result: Branch | undefined) => {
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
