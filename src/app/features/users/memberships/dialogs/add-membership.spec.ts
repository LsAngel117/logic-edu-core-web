import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';
import { MembershipsService } from '../services/memberships';
import { Membership, AssignMembershipRequest } from '../models/membership';
import { AddMembershipDialogComponent } from './add-membership';

describe('AddMembershipDialogComponent', () => {
  let membershipsServiceMock: { assign: ReturnType<typeof vi.fn> };
  let dialogRefMock: { close: ReturnType<typeof vi.fn> };

  const dialogData = { userId: 'u1' };

  function setupComponent() {
    membershipsServiceMock = { assign: vi.fn() };
    dialogRefMock = { close: vi.fn() };

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [AddMembershipDialogComponent],
      providers: [
        provideAnimationsAsync(),
        { provide: MembershipsService, useValue: membershipsServiceMock },
        { provide: MatDialogRef, useValue: dialogRefMock },
        { provide: MAT_DIALOG_DATA, useValue: dialogData },
      ],
    });
  }

  async function createFixture() {
    const fixture = await TestBed.createComponent(AddMembershipDialogComponent);
    fixture.detectChanges();
    return fixture;
  }

  const mockMembership: Membership = {
    id: 'm1',
    userId: 'u1',
    role: 'TEACHER',
    scopeType: 'SCHOOL',
    scopeRefId: 'school-1',
    active: true,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render form with role select and scope inputs', async () => {
    setupComponent();
    const fixture = await createFixture();

    const roleSelect = fixture.nativeElement.querySelector('mat-select[formcontrolname="role"]');
    expect(roleSelect).toBeTruthy();

    const scopeTypeSelect = fixture.nativeElement.querySelector('mat-select[formcontrolname="scopeType"]');
    expect(scopeTypeSelect).toBeTruthy();

    const scopeRefIdInput = fixture.nativeElement.querySelector('input[formcontrolname="scopeRefId"]');
    expect(scopeRefIdInput).toBeTruthy();

    const submitButton = fixture.nativeElement.querySelector('button[type="submit"]');
    expect(submitButton).toBeTruthy();
  });

  it('should show validation errors when form is submitted empty', async () => {
    setupComponent();
    const fixture = await createFixture();

    const submitButton = fixture.nativeElement.querySelector('button[type="submit"]');
    submitButton.click();
    fixture.detectChanges();

    const errors = fixture.nativeElement.querySelectorAll('mat-error');
    expect(errors.length).toBeGreaterThan(0);
    expect(membershipsServiceMock.assign).not.toHaveBeenCalled();
  });

  it('should call MembershipsService.assign with userId and payload on valid submit', async () => {
    setupComponent();
    membershipsServiceMock.assign.mockReturnValue(of(mockMembership));
    const fixture = await createFixture();

    fixture.componentInstance.form.controls.role.setValue('TEACHER');
    fixture.componentInstance.form.controls.scopeType.setValue('SCHOOL');
    fixture.componentInstance.form.controls.scopeRefId.setValue('school-1');
    fixture.detectChanges();

    const submitButton = fixture.nativeElement.querySelector('button[type="submit"]');
    submitButton.click();

    await fixture.whenStable();

    const expectedPayload: AssignMembershipRequest = {
      userId: 'u1',
      role: 'TEACHER',
      scopeType: 'SCHOOL',
      scopeRefId: 'school-1',
    };
    expect(membershipsServiceMock.assign).toHaveBeenCalledWith(expectedPayload);
    expect(dialogRefMock.close).toHaveBeenCalledWith(mockMembership);
  });

  it('should show error message when service returns 409 conflict', async () => {
    setupComponent();
    membershipsServiceMock.assign.mockReturnValue(throwError(() => ({ status: 409 })));
    const fixture = await createFixture();

    fixture.componentInstance.form.controls.role.setValue('TEACHER');
    fixture.componentInstance.form.controls.scopeType.setValue('SCHOOL');
    fixture.componentInstance.form.controls.scopeRefId.setValue('school-1');
    fixture.detectChanges();

    const submitButton = fixture.nativeElement.querySelector('button[type="submit"]');
    submitButton.click();

    await fixture.whenStable();
    fixture.detectChanges();

    expect(dialogRefMock.close).not.toHaveBeenCalled();

    const errorEl = fixture.nativeElement.querySelector('.dialog-error');
    expect(errorEl).toBeTruthy();
    expect(errorEl.textContent).toContain('already exists');
  });

  it('should show error for 403 forbidden', async () => {
    setupComponent();
    membershipsServiceMock.assign.mockReturnValue(throwError(() => ({ status: 403 })));
    const fixture = await createFixture();

    fixture.componentInstance.form.controls.role.setValue('TEACHER');
    fixture.componentInstance.form.controls.scopeType.setValue('SCHOOL');
    fixture.componentInstance.form.controls.scopeRefId.setValue('school-1');
    fixture.detectChanges();

    const submitButton = fixture.nativeElement.querySelector('button[type="submit"]');
    submitButton.click();

    await fixture.whenStable();
    fixture.detectChanges();

    expect(dialogRefMock.close).not.toHaveBeenCalled();

    const errorEl = fixture.nativeElement.querySelector('.dialog-error');
    expect(errorEl).toBeTruthy();
    expect(errorEl.textContent).toContain('Insufficient permissions');
  });

  it('should close dialog without changes on cancel', async () => {
    setupComponent();
    const fixture = await createFixture();

    const cancelButton = fixture.nativeElement.querySelector('button[type="button"]');
    cancelButton.click();

    expect(dialogRefMock.close).toHaveBeenCalled();
    expect(membershipsServiceMock.assign).not.toHaveBeenCalled();
  });
});
