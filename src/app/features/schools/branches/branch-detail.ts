import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  HostListener,
  inject,
  signal,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import {
  LucideChevronLeft,
  LucidePencil,
  LucideBan,
  LucideCheckCircle,
  LucideSchool,
  LucideUsers,
  LucideGitBranch,
} from '@lucide/angular';
import { BranchesService } from './services/branches';
import { SchoolsService } from '../services/schools';
import { statusLabel as getStatusLabel } from '../../../core/constants/display-labels';
import { BranchResponse } from './models/branch';
import { School } from '../models/school';
import { ConfirmationDialog } from '../../../shared/ui';
import { EditBranch } from './dialogs/edit-branch';

/* ------------------------------------------------------------------ */
/*  Constants                                                           */
/* ------------------------------------------------------------------ */

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: '#10B981',
  INACTIVE: '#EF4444',
};

const STATUS_BG: Record<string, string> = {
  ACTIVE: 'rgba(16, 185, 129, 0.12)',
  INACTIVE: 'rgba(239, 68, 68, 0.12)',
};

const TYPE_COLORS: Record<string, string> = {
  MAIN: '#2563EB',
  SECONDARY: '#3B82F6',
  VIRTUAL: '#10B981',
  TEMPORARY: '#F59E0B',
};

const TYPE_BG: Record<string, string> = {
  MAIN: 'rgba(37, 99, 235, 0.1)',
  SECONDARY: 'rgba(59, 130, 246, 0.1)',
  VIRTUAL: 'rgba(16, 185, 129, 0.1)',
  TEMPORARY: 'rgba(245, 158, 11, 0.1)',
};

/* ------------------------------------------------------------------ */
/*  Component                                                           */
/* ------------------------------------------------------------------ */

@Component({
  selector: 'app-branch-detail',
  standalone: true,
  imports: [
    RouterModule,
    DatePipe,
    ConfirmationDialog,
    EditBranch,
    LucideChevronLeft,
    LucidePencil,
    LucideBan,
    LucideCheckCircle,
    LucideSchool,
    LucideUsers,
    LucideGitBranch,
  ],
  templateUrl: './branch-detail.html',
  styleUrl: './branch-detail.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BranchDetailComponent {
  /* ---- Dependencies -------------------------------------------------- */
  private readonly route = inject(ActivatedRoute);
  private readonly branchesService = inject(BranchesService);
  private readonly schoolsService = inject(SchoolsService);
  private readonly router = inject(Router);

  /* ---- State --------------------------------------------------------- */
  readonly branch = signal<BranchResponse | null>(null);
  readonly school = signal<School | null>(null);
  readonly loading = signal(true);
  readonly error = signal(false);
  readonly notFound = signal(false);
  readonly activeTab = signal('informacion');
  readonly currentSchoolId = signal('');
  readonly currentBranchId = signal('');

  /* ---- Dialog visibility --------------------------------------------- */
  readonly editBranchVisible = signal(false);
  readonly statusDialogVisible = signal(false);

  /* ---- Computed ------------------------------------------------------ */
  readonly isActive = computed(() => this.branch()?.status === 'ACTIVE');
  readonly isInactive = computed(() => this.branch()?.status === 'INACTIVE');

  readonly statusColor = computed(
    () => STATUS_COLORS[this.branch()?.status ?? ''] ?? '#6B7280',
  );
  readonly statusBg = computed(
    () => STATUS_BG[this.branch()?.status ?? ''] ?? 'rgba(107, 114, 128, 0.1)',
  );

  readonly typeColor = computed(
    () => TYPE_COLORS[this.branch()?.type ?? ''] ?? '#6B7280',
  );
  readonly typeBg = computed(
    () => TYPE_BG[this.branch()?.type ?? ''] ?? 'rgba(107, 114, 128, 0.1)',
  );

  readonly statusDialogTitle = computed(() =>
    this.isActive() ? 'Desactivar sede' : 'Activar sede',
  );
  readonly statusDialogMessage = computed(() => {
    const b = this.branch();
    if (!b) return '';
    const action = this.isActive() ? 'desactivar' : 'activar';
    return `¿Estás seguro de que deseas ${action} a ${b.name}?`;
  });
  readonly statusConfirmLabel = computed(() =>
    this.isActive() ? 'Desactivar' : 'Activar',
  );

  /* ---- Lifecycle ----------------------------------------------------- */
  constructor() {
    this.route.params.subscribe((params) => {
      const schoolId = params['schoolId'];
      const id = params['id'];
      if (schoolId && id) {
        this.currentSchoolId.set(schoolId);
        this.currentBranchId.set(id);
      }
    });

    effect(() => {
      const schoolId = this.currentSchoolId();
      const branchId = this.currentBranchId();
      if (schoolId && branchId) {
        this.loadData(schoolId, branchId);
      }
    });
  }

  /* ---- Data loading -------------------------------------------------- */
  loadData(schoolId: string, branchId: string): void {
    this.loading.set(true);
    this.error.set(false);
    this.notFound.set(false);
    this.branch.set(null);

    // Fetch school for breadcrumb
    this.schoolsService.getById(schoolId).subscribe({
      next: (result) => {
        this.school.set(result);
      },
      error: () => {
        // Silently ignore — branch detail is the priority
      },
    });

    // Fetch branch detail
    this.branchesService.getById(schoolId, branchId).subscribe({
      next: (result) => {
        this.branch.set(result);
        this.loading.set(false);
      },
      error: (err) => {
        if (err.status === 404) {
          this.notFound.set(true);
        } else {
          this.error.set(true);
        }
        this.loading.set(false);
      },
    });
  }

  /* ---- Tab switching ------------------------------------------------- */
  setActiveTab(tab: string): void {
    this.activeTab.set(tab);
  }

  /* ---- Action: Edit -------------------------------------------------- */
  openEditDialog(): void {
    this.editBranchVisible.set(true);
  }

  onBranchSaved(updated: BranchResponse): void {
    this.editBranchVisible.set(false);
    this.branch.set(updated);
  }

  /* ---- Action: Status change ----------------------------------------- */
  openStatusDialog(): void {
    this.statusDialogVisible.set(true);
  }

  closeStatusDialog(): void {
    this.statusDialogVisible.set(false);
  }

  async confirmStatusChange(): Promise<void> {
    const b = this.branch();
    if (!b) return;

    try {
      const updated = await firstValueFrom(
        this.branchesService.updateStatus(b.schoolId, b.id),
      );
      this.branch.set(updated);
      this.statusDialogVisible.set(false);
    } catch {
      // silently fail
    }
  }

  /* ---- Helpers ------------------------------------------------------- */
  getInitials(name: string): string {
    const parts = name.trim().split(/\s+/);
    return parts
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() ?? '')
      .join('');
  }

  /* ---- Navigation ---------------------------------------------------- */
  goBack(): void {
    const schoolId = this.currentSchoolId();
    if (schoolId) {
      this.router.navigate(['/schools', schoolId]);
    }
  }

  /* ---- Close dialogs on Escape --------------------------------------- */
  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.editBranchVisible.set(false);
    this.statusDialogVisible.set(false);
  }
}
  statusLabel(s: string): string { return getStatusLabel(s); }
