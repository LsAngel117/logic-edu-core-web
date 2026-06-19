import { ChangeDetectionStrategy, Component, computed, inject, input, model, output, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { SchoolsService } from '../services/schools';
import { AuthService } from '../../../core/services/auth';
import { MembershipsService } from '../../users/memberships/services/memberships';
import { School } from '../models/school';
import { ConfirmationDialog } from '../../../shared/ui';

@Component({
  selector: 'app-school-status',
  imports: [ConfirmationDialog],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-confirmation-dialog
      [title]="statusTitle()"
      [message]="statusMessage()"
      [confirmLabel]="confirmLabel()"
      [loading]="loading()"
      [(visible)]="visible"
      (confirm)="onConfirm()"
      (cancel)="onCancel()"
    />
  `,
})
export class SchoolStatusDialog {
  private readonly schoolsService = inject(SchoolsService);
  private readonly authService = inject(AuthService);
  private readonly membershipsService = inject(MembershipsService);

  readonly visible = model(false);
  readonly school = input.required<School>();
  readonly statusChanged = output<School>();

  readonly loading = signal(false);
  readonly isSelfSchool = signal(false);
  private membershipsChecked = false;

  readonly statusTitle = computed(() => {
    const s = this.school();
    if (!s) return '';
    return s.status === 'ACTIVE' ? 'Desactivar institución' : 'Activar institución';
  });

  readonly statusMessage = computed(() => {
    const s = this.school();
    if (!s) return '';
    if (this.isSelfSchool()) {
      return `No puedes ${s.status === 'ACTIVE' ? 'desactivar' : 'activar'} tu propia institución.`;
    }
    const action = s.status === 'ACTIVE' ? 'desactivar' : 'activar';
    return `¿Estás seguro de que deseas ${action} a ${s.name}?`;
  });

  readonly confirmLabel = computed(() => {
    const s = this.school();
    if (!s) return 'Confirmar';
    return s.status === 'ACTIVE' ? 'Desactivar' : 'Activar';
  });

  checkSelfSchool(): void {
    if (this.membershipsChecked) return;
    this.membershipsChecked = true;

    const s = this.school();
    const user = this.authService.user();
    if (!user || !s) return;

    this.membershipsService.getByUser(user.id).subscribe({
      next: (memberships) => {
        const belongsToSchool = memberships.some((m) => m.scopeRefId === s.id);
        this.isSelfSchool.set(belongsToSchool);
      },
      error: () => {
        this.isSelfSchool.set(false);
      },
    });
  }

  async onConfirm(): Promise<void> {
    this.checkSelfSchool();
    if (this.isSelfSchool()) return;
    const s = this.school();
    if (!s) return;

    this.loading.set(true);

    try {
      const result = await firstValueFrom(this.schoolsService.updateStatus(s.id));
      this.visible.set(false);
      this.statusChanged.emit(result);
    } catch {
      this.loading.set(false);
    }
  }

  onCancel(): void {
    this.visible.set(false);
  }
}
