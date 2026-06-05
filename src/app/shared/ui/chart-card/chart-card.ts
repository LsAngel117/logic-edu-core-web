import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';

@Component({
  selector: 'app-chart-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './chart-card.html',
  styleUrl: './chart-card.scss',
})
export class ChartCard {
  readonly title = input.required<string>();
  readonly periods = input<string[]>([]);
  readonly activePeriod = model('');

  selectPeriod(period: string): void {
    this.activePeriod.set(period);
  }
}
