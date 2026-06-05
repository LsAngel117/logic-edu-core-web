import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import {
  LucideSchool,
  LucideSettings,
  LucideWrench,
  LucideBarChart3,
  LucideShield,
  LucideBell,
  LucideLayoutDashboard,
} from '@lucide/angular';

@Component({
  selector: 'app-top-navbar',
  imports: [
    LucideSchool,
    LucideSettings,
    LucideWrench,
    LucideBarChart3,
    LucideShield,
    LucideBell,
    LucideLayoutDashboard,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './top-navbar.html',
  styleUrl: './top-navbar.scss',
})
export class TopNavBar {
  readonly sections = input.required<{ id: string; label: string; icon: string }[]>();
  readonly activeSection = model<string>('');

  selectSection(id: string): void {
    this.activeSection.set(id);
  }
}
