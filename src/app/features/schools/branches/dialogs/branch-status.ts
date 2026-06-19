import { ChangeDetectionStrategy, Component, computed, inject, input, model, output, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { BranchesService } from '../services/branches';
import { BranchResponse } from '../models/branch';
import { ConfirmationDialog } from '../../../../shared/ui';

@Component({
  selector: 'app-branch-status',
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
export class BranchStatusDialog {
  private readonly branchesService = inject(BranchesService);

  readonly visible = model(false);
  readonly branch = input.required<BranchResponse>();
  readonly statusChanged = output<BranchResponse>();

  readonly loading = signal(false);

  readonly statusTitle = computed(() => {
    const b = this.branch();
    if (!b) return '';
    return b.status === 'ACTIVE' ? 'Desactivar sede' : 'Activar sede';
  });

  readonly statusMessage = computed(() => {
    const b = this.branch();
    if (!b) return '';
    const action = b.status === 'ACTIVE' ? 'desactivar' : 'activar';
    return `¿Estás seguro de que deseas ${action} a ${b.name}?`;
  });

  readonly confirmLabel = computed(() => {
    const b = this.branch();
    if (!b) return 'Confirmar';
    return b.status === 'ACTIVE' ? 'Desactivar' : 'Activar';
  });

  async onConfirm(): Promise<void> {
    const b = this.branch();
    if (!b) return;

    this.loading.set(true);

    try {
      const result = await firstValueFrom(this.branchesService.updateStatus(b.schoolId, b.id));
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
