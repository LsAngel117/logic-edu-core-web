import { ChangeDetectionStrategy, Component, effect, inject, signal, computed } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatDialog } from '@angular/material/dialog';
import { RouterModule } from '@angular/router';
import { SchoolsService } from './services/schools';
import { School } from './models/school';

@Component({
  selector: 'app-schools-page',
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
    MatButtonToggleModule,
    RouterModule,
  ],
  templateUrl: './schools-page.html',
  styleUrl: './schools-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SchoolsPageComponent {
  private readonly schoolsService = inject(SchoolsService);
  private readonly dialog = inject(MatDialog);

  private readonly _allSchools = signal<School[]>([]);
  readonly loading = signal(true);
  readonly error = signal(false);
  readonly searchTerm = signal('');
  readonly statusFilter = signal<'all' | 'ACTIVE' | 'INACTIVE'>('all');

  readonly schools = computed(() => {
    let result = this._allSchools();
    if (this.statusFilter() !== 'all') {
      result = result.filter((s) => s.status === this.statusFilter());
    }
    return result;
  });

  readonly displayedColumns = ['name', 'code', 'status', 'actions'];

  constructor() {
    this.loadSchools();

    let debounceTimer: ReturnType<typeof setTimeout> | null = null;

    effect((onCleanup) => {
      const term = this.searchTerm();
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
      debounceTimer = setTimeout(() => {
        this.loadSchools(term || undefined);
      }, 300);
      onCleanup(() => {
        if (debounceTimer) clearTimeout(debounceTimer);
      });
    });
  }

  loadSchools(search?: string): void {
    this.loading.set(true);
    this.error.set(false);

    this.schoolsService.getAll(search).subscribe({
      next: (result: School[]) => {
        this._allSchools.set(result);
        this.loading.set(false);
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
      },
    });
  }

  setStatusFilter(value: 'all' | 'ACTIVE' | 'INACTIVE'): void {
    this.statusFilter.set(value);
  }

  onSearchInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchTerm.set(input.value);
  }

  clearSearch(): void {
    this.searchTerm.set('');
  }

  async openCreateDialog(): Promise<void> {
    const { CreateSchoolDialogComponent } = await import('./dialogs/create-school');
    const dialogRef = this.dialog.open(CreateSchoolDialogComponent, { width: '480px' });
    dialogRef.afterClosed().subscribe((result: School | undefined) => {
      if (result) {
        this.loadSchools();
      }
    });
  }

  async openEditDialog(school: School): Promise<void> {
    const { EditSchoolDialogComponent } = await import('./dialogs/edit-school');
    const dialogRef = this.dialog.open(EditSchoolDialogComponent, {
      width: '480px',
      data: school,
    });
    dialogRef.afterClosed().subscribe((result: School | undefined) => {
      if (result) {
        this.loadSchools();
      }
    });
  }

  async openStatusDialog(school: School): Promise<void> {
    const { SchoolStatusDialogComponent } = await import('./dialogs/school-status');
    const dialogRef = this.dialog.open(SchoolStatusDialogComponent, {
      width: '480px',
      data: school,
    });
    dialogRef.afterClosed().subscribe((result: School | undefined) => {
      if (result) {
        const all = this._allSchools();
        const index = all.findIndex((s) => s.id === result.id);
        if (index !== -1) {
          const updated = [...all];
          updated[index] = result;
          this._allSchools.set(updated);
        }
      }
    });
  }
}
