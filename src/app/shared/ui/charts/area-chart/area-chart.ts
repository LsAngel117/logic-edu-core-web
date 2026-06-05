import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { ChartComponent } from 'ng-apexcharts';
import type {
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexStroke,
  ApexFill,
  ApexGrid,
  ApexMarkers,
  ApexDataLabels,
} from 'ng-apexcharts';

@Component({
  selector: 'app-area-chart',
  standalone: true,
  imports: [ChartComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (title(); as t) {
      <h3 class="area-chart__title" data-testid="area-chart-title">{{ t }}</h3>
    }
    <apx-chart
      [chart]="chartConfig"
      [series]="series()"
      [xaxis]="xaxisConfig()"
      [stroke]="strokeConfig"
      [fill]="fillConfig"
      [grid]="gridConfig"
      [markers]="markersConfig"
      [dataLabels]="dataLabelsConfig"
      [colors]="colors"
    />
  `,
  styleUrl: './area-chart.scss',
})
export class AreaChart {
  readonly series = input.required<ApexAxisChartSeries>();
  readonly categories = input.required<string[]>();
  readonly title = input<string>();

  readonly colors: string[] = ['#2563EB', '#60A5FA', '#10B981'];

  readonly chartConfig: ApexChart = {
    type: 'area',
    animations: { enabled: true },
    toolbar: { show: false },
    fontFamily: 'Roboto, sans-serif',
  };

  readonly xaxisConfig = computed(
    (): ApexXAxis => ({
      categories: this.categories(),
      labels: { style: { fontFamily: 'Roboto, sans-serif' } },
    }),
  );

  readonly strokeConfig: ApexStroke = {
    width: 2,
    curve: 'smooth',
  };

  readonly fillConfig: ApexFill = {
    type: 'gradient',
    gradient: {
      shadeIntensity: 1,
      opacityFrom: 0.45,
      opacityTo: 0.05,
      stops: [0, 100],
    },
  };

  readonly gridConfig: ApexGrid = {
    borderColor: '#E5E7EB',
  };

  readonly markersConfig: ApexMarkers = {
    size: 4,
    hover: { size: 6 },
    shape: 'circle',
  };

  readonly dataLabelsConfig: ApexDataLabels = {
    enabled: false,
  };
}
