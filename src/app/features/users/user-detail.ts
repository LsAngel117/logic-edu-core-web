import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  signal,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { UsersService } from './services/users';
import { UserProfile } from './models/user-profile';
import { MembershipsPanelComponent } from './memberships/memberships-panel';
import { PasswordDialogComponent } from './dialogs/password';

@Component({
  selector: 'app-user-detail',
  imports: [
    RouterModule,
    MatButtonModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatIconModule,
    DatePipe,
    MembershipsPanelComponent,
  ],
  templateUrl: './user-detail.html',
  styleUrl: './user-detail.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserDetailComponent {
  private readonly usersService = inject(UsersService);
  private readonly route = inject(ActivatedRoute);
  private readonly dialog = inject(MatDialog);

  readonly user = signal<UserProfile | null>(null);
  readonly loading = signal(true);
  readonly notFound = signal(false);
  readonly error = signal(false);
  readonly currentId = signal('');

  constructor() {
    // Read route param into a signal, then effect reacts to changes
    this.route.params.subscribe((params) => {
      const id = params['id'];
      if (id) {
        this.currentId.set(id);
      }
    });

    effect(() => {
      const id = this.currentId();
      if (id) {
        this.loadUser(id);
      }
    });
  }

  loadUser(id: string): void {
    this.loading.set(true);
    this.notFound.set(false);
    this.error.set(false);
    this.user.set(null);

    this.usersService.getById(id).subscribe({
      next: (result) => {
        this.user.set(result);
        this.loading.set(false);
      },
      error: (err) => {
        if (err.status === 404) {
          this.notFound.set(true);
        } else {
          this.error.set(true);
        }
        this.loading.set(false);
      },
    });
  }

  openPasswordDialog(): void {
    const u = this.user();
    if (!u) return;

    this.dialog.open(PasswordDialogComponent, {
      data: { userId: u.id },
      width: '400px',
    });
  }
}
