import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { of, throwError } from 'rxjs';
import { MembershipsService } from '../services/memberships';
import { Membership, AssignMembershipRequest } from '../models/membership';
import { AddMembershipDialogComponent } from './add-membership';

describe('AddMembershipDialogComponent', () => {
  let membershipsServiceMock: { assign: ReturnType<typeof vi.fn> };
  let fixture: ComponentFixture<AddMembershipDialogComponent>;

  const mockMembership: Membership = {
    id: 'm1',
    userId: 'u1',
    role: 'TEACHER',
    scopeType: 'SCHOOL',
    scopeRefId: 'school-1',
    active: true,
  };

  function setupComponent() {
    membershipsServiceMock = { assign: vi.fn() };

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [AddMembershipDialogComponent],
      providers: [
        provideAnimationsAsync(),
        { provide: MembershipsService, useValue: membershipsServiceMock },
      ],
    });
    fixture = TestBed.createComponent(AddMembershipDialogComponent);
  }

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ======================================================================
  //  RENDERING
  // ======================================================================
  describe('rendering', () => {
    it('should not render dialog when visible is false', () => {
      setupComponent();
      fixture.detectChanges();

      const overlay = fixture.nativeElement.querySelector('[data-testid="app-dialog-overlay"]');
      expect(overlay).toBeFalsy();
    });

    it('should render dialog with title and form when visible is true', () => {
      setupComponent();
      fixture.componentRef.setInput('userId', 'u1');
      fixture.componentInstance.visible.set(true);
      fixture.detectChanges();

      const title = fixture.nativeElement.querySelector('[data-testid="app-dialog-title"]');
      expect(title).toBeTruthy();
      expect(title.textContent).toContain('Agregar Membresía');
    });

    it('should render form fields: role, scopeType, scopeRefId', () => {
      setupComponent();
      fixture.componentRef.setInput('userId', 'u1');
      fixture.componentInstance.visible.set(true);
      fixture.detectChanges();

      // After refactor, uses native selects (not mat-select)
      const roleSelect = fixture.nativeElement.querySelector('select[formcontrolname="role"]');
      expect(roleSelect).toBeTruthy();

      const scopeTypeSelect = fixture.nativeElement.querySelector('select[formcontrolname="scopeType"]');
      expect(scopeTypeSelect).toBeTruthy();

      const scopeRefIdInput = fixture.nativeElement.querySelector('input[formcontrolname="scopeRefId"]');
      expect(scopeRefIdInput).toBeTruthy();

      const confirmBtn = fixture.nativeElement.querySelector('[data-testid="app-dialog-confirm"]');
      expect(confirmBtn).toBeTruthy();

      const cancelBtn = fixture.nativeElement.querySelector('[data-testid="app-dialog-cancel"]');
      expect(cancelBtn).toBeTruthy();
    });
  });

  // ======================================================================
  //  VALIDATION
  // ======================================================================
  describe('validation', () => {
    beforeEach(() => {
      setupComponent();
      fixture.componentRef.setInput('userId', 'u1');
      fixture.componentInstance.visible.set(true);
      fixture.detectChanges();
    });

    it('should mark form as invalid when submitted empty', () => {
      const confirmBtn = fixture.nativeElement.querySelector('[data-testid="app-dialog-confirm"]') as HTMLElement;
      confirmBtn.click();
      fixture.detectChanges();

      expect(membershipsServiceMock.assign).not.toHaveBeenCalled();
    });
  });

  // ======================================================================
  //  SUCCESSFUL SUBMISSION
  // ======================================================================
  describe('successful submission', () => {
    it('should call MembershipsService.assign with userId and payload on valid submit', async () => {
      setupComponent();
      fixture.componentRef.setInput('userId', 'u1');
      membershipsServiceMock.assign.mockReturnValue(of(mockMembership));
      fixture.componentInstance.visible.set(true);
      fixture.detectChanges();

      fixture.componentInstance.form.controls.role.setValue('TEACHER');
      fixture.componentInstance.form.controls.scopeType.setValue('SCHOOL');
      fixture.componentInstance.form.controls.scopeRefId.setValue('school-1');
      fixture.detectChanges();

      const confirmBtn = fixture.nativeElement.querySelector('[data-testid="app-dialog-confirm"]') as HTMLElement;
      confirmBtn.click();

      await fixture.whenStable();

      const expectedPayload: AssignMembershipRequest = {
        userId: 'u1',
        role: 'TEACHER',
        scopeType: 'SCHOOL',
        scopeRefId: 'school-1',
      };
      expect(membershipsServiceMock.assign).toHaveBeenCalledWith(expectedPayload);
    });

    it('should emit created and close dialog on success', async () => {
      setupComponent();
      fixture.componentRef.setInput('userId', 'u1');
      membershipsServiceMock.assign.mockReturnValue(of(mockMembership));
      fixture.componentInstance.visible.set(true);
      fixture.detectChanges();

      const createdSpy = vi.fn();
      const sub = fixture.componentInstance.created.subscribe(createdSpy);

      fixture.componentInstance.form.controls.role.setValue('TEACHER');
      fixture.componentInstance.form.controls.scopeType.setValue('SCHOOL');
      fixture.componentInstance.form.controls.scopeRefId.setValue('school-1');
      fixture.detectChanges();

      const confirmBtn = fixture.nativeElement.querySelector('[data-testid="app-dialog-confirm"]') as HTMLElement;
      confirmBtn.click();

      await fixture.whenStable();
      fixture.detectChanges();

      expect(createdSpy).toHaveBeenCalled();
      expect(fixture.componentInstance.visible()).toBe(false);
      sub.unsubscribe();
    });
  });

  // ======================================================================
  //  ERROR HANDLING
  // ======================================================================
  describe('error handling', () => {
    it('should show error message when service returns 409 conflict', async () => {
      setupComponent();
      fixture.componentRef.setInput('userId', 'u1');
      membershipsServiceMock.assign.mockReturnValue(throwError(() => ({ status: 409 })));
      fixture.componentInstance.visible.set(true);
      fixture.detectChanges();

      fixture.componentInstance.form.controls.role.setValue('TEACHER');
      fixture.componentInstance.form.controls.scopeType.setValue('SCHOOL');
      fixture.componentInstance.form.controls.scopeRefId.setValue('school-1');
      fixture.detectChanges();

      const confirmBtn = fixture.nativeElement.querySelector('[data-testid="app-dialog-confirm"]') as HTMLElement;
      confirmBtn.click();

      await fixture.whenStable();
      fixture.detectChanges();

      expect(fixture.componentInstance.visible()).toBe(true); // stays open
      const errorEl = fixture.nativeElement.querySelector('.field-error');
      expect(errorEl).toBeTruthy();
      expect(errorEl.textContent).toContain('ya existe');
    });

    it('should show error for 403 forbidden', async () => {
      setupComponent();
      fixture.componentRef.setInput('userId', 'u1');
      membershipsServiceMock.assign.mockReturnValue(throwError(() => ({ status: 403 })));
      fixture.componentInstance.visible.set(true);
      fixture.detectChanges();

      fixture.componentInstance.form.controls.role.setValue('TEACHER');
      fixture.componentInstance.form.controls.scopeType.setValue('SCHOOL');
      fixture.componentInstance.form.controls.scopeRefId.setValue('school-1');
      fixture.detectChanges();

      const confirmBtn = fixture.nativeElement.querySelector('[data-testid="app-dialog-confirm"]') as HTMLElement;
      confirmBtn.click();

      await fixture.whenStable();
      fixture.detectChanges();

      const errorEl = fixture.nativeElement.querySelector('.field-error');
      expect(errorEl).toBeTruthy();
      expect(errorEl.textContent?.toLowerCase()).toContain('permisos');
    });
  });

  // ======================================================================
  //  CANCEL
  // ======================================================================
  describe('cancel', () => {
    it('should close dialog without calling service on cancel', () => {
      setupComponent();
      fixture.componentRef.setInput('userId', 'u1');
      fixture.componentInstance.visible.set(true);
      fixture.detectChanges();

      const cancelBtn = fixture.nativeElement.querySelector('[data-testid="app-dialog-cancel"]') as HTMLElement;
      cancelBtn.click();
      fixture.detectChanges();

      expect(membershipsServiceMock.assign).not.toHaveBeenCalled();
      expect(fixture.componentInstance.visible()).toBe(false);
    });
  });
});
