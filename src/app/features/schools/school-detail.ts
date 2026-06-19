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
  LucideEye,
  LucidePower,
  LucideBan,
  LucideCheckCircle,
  LucideBuilding2,
  LucideUsers,
  LucideSchool,
  LucideGitBranch,
  LucidePlus,
} from '@lucide/angular';
import { SchoolsService } from './services/schools';
import { BranchesService } from './branches/services/branches';
import { School } from './models/school';
import { BranchResponse } from './branches/models/branch';
import { EditSchool } from './dialogs/edit-school';
import { EditBranch } from './branches/dialogs/edit-branch';
import { CreateBranchDialogComponent } from './branches/dialogs/create-branch';
import { StatCard, ConfirmationDialog } from '../../shared/ui';

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

const BRANCH_TYPE_COLORS: Record<string, string> = {
  MAIN: '#2563EB',
  SECONDARY: '#3B82F6',
  VIRTUAL: '#10B981',
  TEMPORARY: '#F59E0B',
};

const BRANCH_TYPE_BG: Record<string, string> = {
  MAIN: 'rgba(37, 99, 235, 0.1)',
  SECONDARY: 'rgba(59, 130, 246, 0.1)',
  VIRTUAL: 'rgba(16, 185, 129, 0.1)',
  TEMPORARY: 'rgba(245, 158, 11, 0.1)',
};

/* ------------------------------------------------------------------ */
/*  Component                                                           */
/* ------------------------------------------------------------------ */

@Component({
  selector: 'app-school-detail',
  standalone: true,
  imports: [
    RouterModule,
    DatePipe,
    StatCard,
    ConfirmationDialog,
    EditSchool,
    EditBranch,
    CreateBranchDialogComponent,
    LucideChevronLeft,
    LucidePencil,
    LucideEye,
    LucidePower,
    LucideBan,
    LucideCheckCircle,
    LucideBuilding2,
    LucideUsers,
    LucideSchool,
    LucideGitBranch,
    LucidePlus,
  ],
  templateUrl: './school-detail.html',
  styleUrl: './school-detail.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SchoolDetail {
  /* ---- Dependencies -------------------------------------------------- */
  private readonly route = inject(ActivatedRoute);
  private readonly schoolsService = inject(SchoolsService);
  private readonly branchesService = inject(BranchesService);
  private readonly router = inject(Router);

  /* ---- State --------------------------------------------------------- */
  readonly school = signal<School | null>(null);
  readonly branches = signal<BranchResponse[]>([]);
  readonly loading = signal(true);
  readonly error = signal(false);
  readonly notFound = signal(false);
  readonly activeTab = signal('informacion');
  readonly currentId = signal('');
  readonly branchesLoading = signal(false);

  /* ---- Dialog visibility --------------------------------------------- */
  readonly editSchoolVisible = signal(false);
  readonly statusDialogVisible = signal(false);
  readonly createBranchVisible = signal(false);
  readonly editBranchVisible = signal(false);
  readonly deactivateBranchVisible = signal(false);
  readonly selectedBranch = signal<BranchResponse | null>(null);

  /* ---- Computed ------------------------------------------------------ */
  readonly isActive = computed(() => this.school()?.status === 'ACTIVE');
  readonly isInactive = computed(() => this.school()?.status === 'INACTIVE');

  readonly statusColor = computed(
    () => STATUS_COLORS[this.school()?.status ?? ''] ?? '#6B7280',
  );
  readonly statusBg = computed(
    () => STATUS_BG[this.school()?.status ?? ''] ?? 'rgba(107, 114, 128, 0.1)',
  );

  readonly statusDialogTitle = computed(() =>
    this.isActive() ? 'Desactivar institución' : 'Activar institución',
  );
  readonly statusDialogMessage = computed(() => {
    const s = this.school();
    if (!s) return '';
    const action = this.isActive() ? 'desactivar' : 'activar';
    return `¿Estás seguro de que deseas ${action} a ${s.name}?`;
  });
  readonly statusConfirmLabel = computed(() =>
    this.isActive() ? 'Desactivar' : 'Activar',
  );

  /* ---- Branch stats -------------------------------------------------- */
  readonly totalBranches = computed(() => this.branches().length);
  readonly activeBranches = computed(
    () => this.branches().filter((b) => b.status === 'ACTIVE').length,
  );
  readonly inactiveBranches = computed(
    () => this.branches().filter((b) => b.status === 'INACTIVE').length,
  );

  /* ---- Lifecycle ----------------------------------------------------- */
  constructor() {
    this.route.params.subscribe((params) => {
      const id = params['id'];
      if (id) {
        this.currentId.set(id);
      }
    });

    effect(() => {
      const id = this.currentId();
      if (id) {
        this.loadSchool(id);
      }
    });
  }

  /* ---- Data loading -------------------------------------------------- */
  loadSchool(id: string): void {
    this.loading.set(true);
    this.error.set(false);
    this.notFound.set(false);
    this.school.set(null);

    this.schoolsService.getById(id).subscribe({
      next: (result) => {
        this.school.set(result);
        this.loading.set(false);
        this.loadBranches(id);
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

  loadBranches(schoolId: string): void {
    this.branchesLoading.set(true);
    this.branchesService.getBySchool(schoolId).subscribe({
      next: (result) => {
        this.branches.set(result);
        this.branchesLoading.set(false);
      },
      error: () => {
        this.branches.set([]);
        this.branchesLoading.set(false);
      },
    });
  }

  /* ---- Tab switching ------------------------------------------------- */
  setActiveTab(tab: string): void {
    this.activeTab.set(tab);
  }

  /* ---- Action: Edit -------------------------------------------------- */
  openEditDialog(): void {
    const current = this.school();
    if (!current) return;

    this.editSchoolVisible.set(true);
  }

  onSchoolSaved(updated: School): void {
    this.editSchoolVisible.set(false);
    this.school.set(updated);
    this.loadBranches(this.currentId());
  }

  /* ---- Action: Status change ----------------------------------------- */
  openStatusDialog(): void {
    this.statusDialogVisible.set(true);
  }

  closeStatusDialog(): void {
    this.statusDialogVisible.set(false);
  }

  async confirmStatusChange(): Promise<void> {
    const s = this.school();
    if (!s) return;

    try {
      const updated = await firstValueFrom(
        this.schoolsService.updateStatus(s.id),
      );
      this.school.set(updated);
      this.statusDialogVisible.set(false);
    } catch {
      // silently fail
    }
  }

  /* ---- Action: Create Branch ----------------------------------------- */
  openCreateBranchDialog(): void {
    this.createBranchVisible.set(true);
  }

  onBranchCreated(): void {
    this.loadBranches(this.currentId());
  }

  /* ---- Helpers ------------------------------------------------------- */
  getInitials(name: string): string {
    const parts = name.trim().split(/\s+/);
    return parts
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() ?? '')
      .join('');
  }

  branchTypeColor(type: string): string {
    return BRANCH_TYPE_COLORS[type] ?? '#6B7280';
  }

  branchTypeBg(type: string): string {
    return BRANCH_TYPE_BG[type] ?? 'rgba(107, 114, 128, 0.1)';
  }

  /* ---- Branch actions ------------------------------------------------- */

  viewBranch(branch: BranchResponse): void {
    this.router.navigate(['/schools', branch.schoolId, 'branches', branch.id]);
  }

  editBranch(branch: BranchResponse): void {
    this.selectedBranch.set(branch);
    this.editBranchVisible.set(true);
  }

  deactivateBranch(branch: BranchResponse): void {
    this.selectedBranch.set(branch);
    this.deactivateBranchVisible.set(true);
  }

  async confirmDeactivateBranch(): Promise<void> {
    const branch = this.selectedBranch();
    if (!branch) return;
    try {
      await firstValueFrom(this.branchesService.updateStatus(branch.schoolId, branch.id));
      this.deactivateBranchVisible.set(false);
      this.loadBranches(this.currentId());
    } catch { /* error handled by interceptor */ }
  }

  onBranchEdited(): void {
    this.editBranchVisible.set(false);
    this.loadBranches(this.currentId());
  }

  /* ---- Close dialogs on Escape --------------------------------------- */
  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.editSchoolVisible.set(false);
    this.statusDialogVisible.set(false);
    this.createBranchVisible.set(false);
  }

  statusLabel(s: string): string { const labels: Record<string, string> = { ACTIVE: 'Activo', INACTIVE: 'Inactivo', BLOCKED: 'Bloqueado' }; return labels[s] ?? s; }
  typeLabel(t: string): string { const labels: Record<string,string>={MAIN:"Principal",SECONDARY:"Secundaria",VIRTUAL:"Virtual",TEMPORARY:"Temporal"}; return labels[t]??t; }
}
