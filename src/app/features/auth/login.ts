import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  template: `<p>login works</p>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {}
