import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ToastService } from '../../../core/services/toast';
import { LucideCheckCircle, LucideXCircle, LucideAlertTriangle, LucideInfo, LucideX } from '@lucide/angular';

@Component({
  selector: 'app-toast',
  imports: [LucideCheckCircle, LucideXCircle, LucideAlertTriangle, LucideInfo, LucideX],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="toast-container">
      @for (toast of toastService.toasts(); track toast.id) {
        <div class="toast" [class]="'toast toast--' + toast.type">
          <span class="toast__icon">
            @switch (toast.type) {
              @case ('success') { <svg lucideCheckCircle></svg> }
              @case ('error') { <svg lucideXCircle></svg> }
              @case ('warning') { <svg lucideAlertTriangle></svg> }
              @case ('info') { <svg lucideInfo></svg> }
            }
          </span>
          <span class="toast__message">{{ toast.message }}</span>
          <button class="toast__close" (click)="toastService.dismiss(toast.id)">
            <svg lucideX></svg>
          </button>
        </div>
      }
    </div>
  `,
  styles: `
    .toast-container {
      position: fixed;
      top: 24px;
      right: 24px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 12px;
      max-width: 380px;
    }

    .toast {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 14px 16px;
      border-radius: 8px;
      background: #fff;
      box-shadow: 0 4px 16px rgba(0,0,0,.08), 0 0 0 1px rgba(0,0,0,.04);
      animation: slideIn 0.25s ease;
      font-family: Roboto, sans-serif;
      font-size: 14px;
    }

    .toast--success { background: #f0fdf4; }
    .toast--error { background: #fef2f2; }
    .toast--warning { background: #fffbeb; }
    .toast--info { background: #eff6ff; }

    .toast__icon {
      display: flex;
      flex-shrink: 0;
      padding-top: 1px;
      svg { width: 20px; height: 20px; }
    }
    .toast--success .toast__icon svg { color: #16a34a; }
    .toast--error .toast__icon svg { color: #dc2626; }
    .toast--warning .toast__icon svg { color: #d97706; }
    .toast--info .toast__icon svg { color: #2563eb; }

    .toast__message {
      flex: 1;
      color: #1f2937;
      font-weight: 400;
      line-height: 1.5;
    }

    .toast__close {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      border: none;
      background: none;
      cursor: pointer;
      border-radius: 4px;
      color: #9ca3af;
      flex-shrink: 0;
      margin-top: -2px;
      &:hover { background: rgba(0,0,0,.06); color: #4b5563; }
      svg { width: 16px; height: 16px; }
    }

    @keyframes slideIn {
      from { opacity: 0; transform: translateX(40px); }
      to { opacity: 1; transform: translateX(0); }
    }
  `,
})
export class ToastComponent {
  readonly toastService = inject(ToastService);
}
