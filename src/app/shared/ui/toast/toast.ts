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
      gap: 10px;
      max-width: 380px;
    }

    .toast {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 16px;
      border-radius: 12px;
      background: #fff;
      box-shadow: 0 8px 24px rgba(0,0,0,.12);
      border: 1px solid #e5e7eb;
      animation: slideIn 0.3s ease;
      font-family: Roboto, sans-serif;
      font-size: 14px;
    }

    .toast--success { border-left: 4px solid #10b981; }
    .toast--success .toast__icon svg { color: #10b981; }
    .toast--error { border-left: 4px solid #ef4444; }
    .toast--error .toast__icon svg { color: #ef4444; }
    .toast--warning { border-left: 4px solid #f59e0b; }
    .toast--warning .toast__icon svg { color: #f59e0b; }
    .toast--info { border-left: 4px solid #2563eb; }
    .toast--info .toast__icon svg { color: #2563eb; }

    .toast__icon {
      display: flex;
      flex-shrink: 0;
      svg { width: 20px; height: 20px; }
    }

    .toast__message {
      flex: 1;
      color: #111827;
      font-weight: 500;
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
      border-radius: 6px;
      color: #9ca3af;
      flex-shrink: 0;
      &:hover { background: #f3f4f6; color: #111827; }
      svg { width: 14px; height: 14px; }
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
