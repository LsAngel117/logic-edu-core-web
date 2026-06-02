import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog } from '@angular/material/dialog';
import { MembershipsService } from './services/memberships';
import { Membership } from './models/membership';
import { AddMembershipDialogComponent } from './dialogs/add-membership';
import { RemoveMembershipDialogComponent } from './dialogs/remove-membership';

@Component({
  selector: 'app-memberships-panel',
  imports: [
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './memberships-panel.html',
  styleUrl: './memberships-panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MembershipsPanelComponent {
  private readonly membershipsService = inject(MembershipsService);
  private readonly dialog = inject(MatDialog);

  readonly userId = input.required<string>();

  readonly memberships = signal<Membership[]>([]);
  readonly loading = signal(true);
  readonly error = signal(false);

  constructor() {
    effect(() => {
      const id = this.userId();
      this.loadMemberships(id);
    });
  }

  loadMemberships(userId: string): void {
    this.loading.set(true);
    this.error.set(false);

    this.membershipsService.getByUser(userId).subscribe({
      next: (result) => {
        this.memberships.set(result);
        this.loading.set(false);
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
      },
    });
  }

  openAddDialog(): void {
    const dialogRef = this.dialog.open(AddMembershipDialogComponent, {
      data: { userId: this.userId() },
      width: '400px',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadMemberships(this.userId());
      }
    });
  }

  openRemoveDialog(membership: Membership): void {
    const dialogRef = this.dialog.open(RemoveMembershipDialogComponent, {
      data: {
        userId: this.userId(),
        membershipId: membership.id,
        role: membership.role,
      },
      width: '400px',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadMemberships(this.userId());
      }
    });
  }
}
