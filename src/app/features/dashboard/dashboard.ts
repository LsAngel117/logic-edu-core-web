import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  template: `<p>dashboard works</p>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent {}
