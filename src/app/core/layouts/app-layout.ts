import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { Sidebar } from './sidebar';
import { Header } from './header';

@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, MatSidenavModule, Sidebar, Header],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './app-layout.html',
  styleUrl: './app-layout.scss',
})
export class AppLayout {
  readonly collapsed = signal(false);

  toggleSidebar(): void {
    this.collapsed.update(v => !v);
  }
}
