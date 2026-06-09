import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import {
  LucideUsers,
  LucideUserCheck,
  LucideUserX,
  LucideShield,
  LucideBuilding2,
  LucideGitBranch,
  LucideInbox,
  LucideSchool,
  LucideBookOpen,
  LucideTrendingUp,
  LucideTrendingDown,
} from '@lucide/angular';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [
    LucideUsers,
    LucideUserCheck,
    LucideUserX,
    LucideShield,
    LucideBuilding2,
    LucideGitBranch,
    LucideInbox,
    LucideSchool,
    LucideBookOpen,
    LucideTrendingUp,
    LucideTrendingDown,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './stat-card.html',
  styleUrl: './stat-card.scss',
})
export class StatCard {
  readonly icon = input.required<string>();
  readonly label = input.required<string>();
  readonly value = input.required<number | string>();
  readonly trend = input<number>();
}
