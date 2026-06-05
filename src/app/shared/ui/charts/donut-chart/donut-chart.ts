import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { ChartComponent } from 'ng-apexcharts';
import type {
  ApexNonAxisChartSeries,
  ApexChart,
  ApexPlotOptions,
  ApexDataLabels,
  ApexLegend,
  ApexStroke,
  ApexFill,
} from 'ng-apexcharts';

@Component({
  selector: 'app-donut-chart',
  standalone: true,
  imports: [ChartComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <apx-chart
      [chart]="chartConfig"
      [series]="series()"
      [labels]="labels()"
      [plotOptions]="plotOptions"
      [dataLabels]="dataLabelsConfig"
      [legend]="legendConfig"
      [stroke]="strokeConfig"
      [fill]="fillConfig"
      [colors]="colors"
    />
  `,
  styleUrl: './donut-chart.scss',
})
export class DonutChart {
  readonly series = input.required<ApexNonAxisChartSeries>();
  readonly labels = input.required<string[]>();

  readonly colors: string[] = ['#2563EB', '#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

  readonly chartConfig: ApexChart = {
    type: 'donut',
    fontFamily: 'Roboto, sans-serif',
    animations: { enabled: true },
    toolbar: { show: false },
  };

  readonly plotOptions: ApexPlotOptions = {
    pie: {
      donut: {
        size: '75%',
        labels: {
          show: true,
          total: {
            show: true,
            label: 'Total',
            fontFamily: 'Roboto, sans-serif',
            fontSize: '16px',
            fontWeight: 600,
            color: '#111827',
            formatter: (w: any): string => {
              const totals = w.globals?.seriesTotals ?? [];
              const sum: number = totals.reduce((a: number, b: number) => a + b, 0);
              return String(sum);
            },
          },
        },
      },
    },
  };

  readonly dataLabelsConfig: ApexDataLabels = {
    enabled: false,
  };

  readonly legendConfig: ApexLegend = {
    show: true,
    position: 'bottom',
    fontFamily: 'Roboto, sans-serif',
    labels: { colors: '#374151' },
  };

  readonly strokeConfig: ApexStroke = {
    width: 2,
  };

  readonly fillConfig: ApexFill = {
    type: 'solid',
  };
}
