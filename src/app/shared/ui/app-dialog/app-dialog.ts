import { ChangeDetectionStrategy, Component, input, model, output } from '@angular/core';

@Component({
  selector: 'app-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './app-dialog.html',
  styleUrl: './app-dialog.scss',
})
export class AppDialog {
  readonly title = input.required<string>();
  readonly confirmLabel = input('Confirmar');
  readonly cancelLabel = input('Cancelar');
  readonly loading = input(false);
  readonly visible = model(false);

  readonly confirm = output<void>();
  readonly cancel = output<void>();
}
