import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { UsersService } from './services/users';
import { UserProfile } from './models/user-profile';
import { TableColumn, TableAction, RowActionEvent } from '../../shared/ui/models';
import { PageHeader, DataTable, EmptyState } from '../../shared/ui';

@Component({
  selector: 'app-users-page',
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    RouterModule,
    PageHeader,
    DataTable,
    EmptyState,
  ],
  templateUrl: './users-page.html',
  styleUrl: './users-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsersPageComponent {
  private readonly usersService = inject(UsersService);

  readonly users = signal<UserProfile[]>([]);
  readonly loading = signal(true);
  readonly error = signal(false);
  readonly searchTerm = signal('');

  readonly userColumns: TableColumn[] = [
    { key: 'fullName', label: 'Nombre' },
    { key: 'email', label: 'Email' },
    { key: 'status', label: 'Estado' },
  ];

  readonly rowActions: TableAction[] = [
    { icon: 'pencil', label: 'Cambiar Estado', action: 'status' },
    { icon: 'eye', label: 'Ver Usuario', action: 'view' },
  ];

  readonly tableData = computed(() =>
    this.users() as unknown as Record<string, unknown>[]
  );

  constructor() {
    this.loadUsers();

    let debounceTimer: ReturnType<typeof setTimeout> | null = null;

    effect((onCleanup) => {
      const term = this.searchTerm();
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
      debounceTimer = setTimeout(() => {
        this.loadUsers(term || undefined);
      }, 300);
      onCleanup(() => {
        if (debounceTimer) clearTimeout(debounceTimer);
      });
    });
  }

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

  onSearchInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchTerm.set(input.value);
  }

  clearSearch(): void {
    this.searchTerm.set('');
  }

  onRowAction(event: RowActionEvent): void {
    // Will be implemented with dialog/navigation wiring in future PR
  }

  openCreateDialog(): void {
    // Will be implemented with MatDialog wiring in PR 4
  }

  openStatusDialog(_user: UserProfile): void {
    // Will be implemented when dialog is wired in PR 4
  }
}
