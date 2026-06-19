import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import {
  LucideInbox,
  LucideUsers,
  LucideBuilding2,
  LucideGitBranch,
  LucideSchool,
  LucideBookOpen,
  LucideKey,
} from '@lucide/angular';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [
    LucideInbox,
    LucideUsers,
    LucideBuilding2,
    LucideGitBranch,
    LucideSchool,
    LucideBookOpen,
    LucideKey,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './empty-state.html',
  styleUrl: './empty-state.scss',
})
export class EmptyState {
  readonly icon = input.required<string>();
  readonly title = input.required<string>();
  readonly description = input('');
  readonly actionLabel = input('');
  readonly action = output<void>();
}
