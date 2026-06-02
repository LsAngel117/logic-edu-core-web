import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterModule } from '@angular/router';
import { UsersService } from './services/users';
import { UserProfile } from './models/user-profile';

@Component({
  selector: 'app-users-page',
  imports: [
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    RouterModule,
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

  readonly displayedColumns = ['displayName', 'email', 'status', 'roles', 'actions'];

  constructor() {
    // Initial load without debounce
    this.loadUsers();

    // Effect to debounce subsequent search changes
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

  openCreateDialog(): void {
    // Will be implemented with MatDialog wiring in PR 4
  }

  openStatusDialog(user: UserProfile): void {
    // Will be implemented when dialog is wired in PR 4
  }
}
