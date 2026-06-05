import { ChangeDetectionStrategy, Component, input, model, output } from '@angular/core';
import { LucideTriangleAlert } from '@lucide/angular';

@Component({
  selector: 'app-confirmation-dialog',
  standalone: true,
  imports: [LucideTriangleAlert],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './confirmation-dialog.html',
  styleUrl: './confirmation-dialog.scss',
})
export class ConfirmationDialog {
  readonly title = input.required<string>();
  readonly message = input.required<string>();
  readonly confirmLabel = input('Eliminar');
  readonly loading = input(false);
  readonly visible = model(false);

  readonly confirm = output<void>();
  readonly cancel = output<void>();
}
