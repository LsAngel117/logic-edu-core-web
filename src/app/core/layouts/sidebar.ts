import { ChangeDetectionStrategy, Component, computed, inject, input, output, signal } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { filter } from 'rxjs';
import {
  LucideLayoutDashboard,
  LucideUsers,
  LucideBuilding2,
  LucideGitBranch,
  LucideChevronLeft,
  LucideChevronRight,
  LucideChevronDown,
  LucideKey,
  LucideSchool,
} from '@lucide/angular';
import { NavItem } from './nav-items';

type SidebarMode = 'expanded' | 'peek' | 'collapsed';

@Component({
  selector: 'app-sidebar',
  imports: [
    RouterModule,
    LucideLayoutDashboard,
    LucideUsers,
    LucideBuilding2,
    LucideGitBranch,
    LucideChevronLeft,
    LucideChevronRight,
    LucideChevronDown,
    LucideKey,
    LucideSchool,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class Sidebar {
  readonly navItems = input<NavItem[]>([]);
  readonly showBranding = input(true);
  readonly widthChange = output<number>();

  private readonly router = inject(Router);

  readonly activeRoute = signal(this.router.url);

  /** Tracks which parent nav items are expanded (showing children). */
  readonly expandedItems = signal<Set<string>>(new Set());

  readonly isParentActive = (item: NavItem): boolean => {
    if (!item.children) return false;
    return item.children.some((c) => this.isActive(c.route ?? ''));
  };

  toggleExpand(label: string): void {
    this.expandedItems.update((set) => {
      const next = new Set(set);
      if (next.has(label)) {
        next.delete(label);
      } else {
        next.add(label);
      }
      return next;
    });
  }

  /** expanded(260) → peek(hover 260/64) → collapsed(64) → expanded */
  readonly mode = signal<SidebarMode>('expanded');

  readonly isCollapsed = computed(() => this.mode() !== 'expanded');
  readonly isPeek = computed(() => this.mode() === 'peek');
  readonly isHovered = signal(false);

  readonly sidebarWidth = computed(() => {
    if (this.mode() === 'expanded') return 260;
    if (this.mode() === 'peek' && this.isHovered()) return 260;
    return 64;
  });

  constructor() {
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((e) => {
        this.activeRoute.set(e.urlAfterRedirects);
      });
  }

  readonly isActive = (route: string): boolean => {
    return this.activeRoute().startsWith(route);
  };

  toggle(): void {
    const next: Record<SidebarMode, SidebarMode> = {
      expanded: 'peek',
      peek: 'collapsed',
      collapsed: 'expanded',
    };
    this.mode.set(next[this.mode()]);
    this.isHovered.set(false);
    this.widthChange.emit(this.sidebarWidth());
  }

  onMouseEnter(): void {
    if (this.mode() === 'peek') {
      this.isHovered.set(true);
      this.widthChange.emit(260);
    }
  }

  onMouseLeave(): void {
    if (this.mode() === 'peek') {
      this.isHovered.set(false);
      this.widthChange.emit(64);
    }
  }
}
