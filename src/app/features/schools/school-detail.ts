import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { SchoolsService } from './services/schools';
import { School } from './models/school';

@Component({
  selector: 'app-school-detail',
  imports: [
    MatCardModule,
    MatChipsModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    RouterModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="school-detail">
      <a routerLink="/schools" class="back-link">
        <mat-icon>arrow_back</mat-icon> Back to Schools
      </a>

      @if (loading()) {
        <div class="loading-container">
          <mat-spinner diameter="40" />
        </div>
      } @else if (error()) {
        <div class="error-state">
          <p>Failed to load school details.</p>
          <button mat-stroked-button color="primary" (click)="load()">Retry</button>
        </div>
      } @else if (school()) {
        <mat-card class="detail-card">
          <mat-card-header>
            <mat-card-title>{{ school()!.name }}</mat-card-title>
            <mat-card-subtitle>{{ school()!.code }}</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <div class="detail-row">
              <span class="label">Status</span>
              <mat-chip
                [class.status-active]="school()!.status === 'ACTIVE'"
                [class.status-inactive]="school()!.status === 'INACTIVE'"
              >
                {{ school()!.status }}
              </mat-chip>
            </div>
            <div class="detail-row">
              <span class="label">Short Name</span>
              <span>{{ school()!.shortName }}</span>
            </div>
            <div class="detail-row">
              <span class="label">Address</span>
              <span>{{ school()!.address }}</span>
            </div>
            @if (school()!.email) {
            <div class="detail-row">
              <span class="label">Email</span>
              <span>{{ school()!.email }}</span>
            </div>
            }
            @if (school()!.phone) {
            <div class="detail-row">
              <span class="label">Phone</span>
              <span>{{ school()!.phone }}</span>
            </div>
            }
            @if (school()!.description) {
            <div class="detail-row">
              <span class="label">Description</span>
              <span>{{ school()!.description }}</span>
            </div>
            }
          </mat-card-content>
          <mat-card-actions>
            <a
              mat-raised-button
              color="primary"
              [routerLink]="['/schools', school()!.id, 'branches']"
            >
              View Branches
            </a>
          </mat-card-actions>
        </mat-card>
      }
    </div>
  `,
  styles: `
    .school-detail {
      padding: 24px;
      max-width: 640px;
    }
    .back-link {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      margin-bottom: 16px;
      color: var(--mat-sys-primary);
      text-decoration: none;
    }
    .loading-container {
      display: flex;
      justify-content: center;
      padding: 48px;
    }
    .error-state {
      text-align: center;
      padding: 48px;
    }
    .detail-card {
      margin-top: 8px;
    }
    .detail-row {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 12px;
    }
    .label {
      font-weight: 500;
      min-width: 80px;
      color: var(--mat-sys-on-surface-variant);
    }
    .status-active {
      background-color: #e8f5e9 !important;
      color: #2e7d32 !important;
    }
    .status-inactive {
      background-color: #ffebee !important;
      color: #c62828 !important;
    }
  `,
})
export class SchoolDetail {
  private readonly schoolsService = inject(SchoolsService);
  private readonly route = inject(ActivatedRoute);

  readonly school = signal<School | null>(null);
  readonly loading = signal(true);
  readonly error = signal(false);

  constructor() {
    this.route.params.subscribe((params) => {
      const id = params['id'] as string;
      if (id) {
        this.load(id);
      }
    });
  }

  load(id?: string): void {
    const schoolId = id ?? this.route.snapshot.params['id'] as string;
    this.loading.set(true);
    this.error.set(false);

    this.schoolsService.getById(schoolId).subscribe({
      next: (result: School) => {
        this.school.set(result);
        this.loading.set(false);
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
      },
    });
  }
}
