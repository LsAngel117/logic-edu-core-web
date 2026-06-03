import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';
import { BranchesService } from '../services/branches';
import { BranchResponse, CreateBranchRequest } from '../models/branch';
import { CreateBranchDialogComponent } from './create-branch';

describe('CreateBranchDialogComponent', () => {
  let branchesServiceMock: { create: ReturnType<typeof vi.fn> };
  let dialogRefMock: { close: ReturnType<typeof vi.fn> };

  function setupComponent() {
    branchesServiceMock = { create: vi.fn() };
    dialogRefMock = { close: vi.fn() };

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [CreateBranchDialogComponent],
      providers: [
        provideAnimationsAsync(),
        { provide: BranchesService, useValue: branchesServiceMock },
        { provide: MatDialogRef, useValue: dialogRefMock },
        { provide: MAT_DIALOG_DATA, useValue: 's1' },
      ],
    });
  }

  async function createFixture() {
    const fixture = await TestBed.createComponent(CreateBranchDialogComponent);
    fixture.detectChanges();
    return fixture;
  }

  const mockCreatedBranch: BranchResponse = {
    id: 'new1',
    schoolId: 's1',
    name: 'East Wing',
    code: 'EW-003',
    shortName: 'East',
    description: '',
    email: '',
    phone: '',
    address: '789 East Rd',
    type: 'SECONDARY',
    status: 'ACTIVE',
    createdAt: '2026-03-01T00:00:00Z',
    updatedAt: '2026-03-01T00:00:00Z',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render form with name, code, and address fields', async () => {
    setupComponent();
    const fixture = await createFixture();

    const nameInput = fixture.nativeElement.querySelector('input[formcontrolname="name"]');
    const codeInput = fixture.nativeElement.querySelector('input[formcontrolname="code"]');
    const addressInput = fixture.nativeElement.querySelector('textarea[formcontrolname="address"]');
    const submitButton = fixture.nativeElement.querySelector('button[type="submit"]');
    const shortNameInput = fixture.nativeElement.querySelector('input[formcontrolname="shortName"]');

    expect(nameInput).toBeTruthy();
    expect(codeInput).toBeTruthy();
    expect(addressInput).toBeTruthy();
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
    expect(branchesServiceMock.create).not.toHaveBeenCalled();
  });

  it('should show code format error for invalid code', async () => {
    setupComponent();
    const fixture = await createFixture();

    const nameInput = fixture.nativeElement.querySelector('input[formcontrolname="name"]');
    nameInput.value = 'Test Branch';
    nameInput.dispatchEvent(new Event('input'));

    const shortNameInput = fixture.nativeElement.querySelector('input[formcontrolname="shortName"]');
    shortNameInput.value = 'Test';
    shortNameInput.dispatchEvent(new Event('input'));

    const codeInput = fixture.nativeElement.querySelector('input[formcontrolname="code"]');
    codeInput.value = 'invalid code!';
    codeInput.dispatchEvent(new Event('input'));

    const addressInput = fixture.nativeElement.querySelector('textarea[formcontrolname="address"]');
    addressInput.value = '123 Test St';
    addressInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const submitButton = fixture.nativeElement.querySelector('button[type="submit"]');
    submitButton.click();
    fixture.detectChanges();

    const errors = fixture.nativeElement.querySelectorAll('mat-error');
    const codeError = Array.from(errors as Element[]).find(
      (e) => e.textContent?.includes('Invalid code format')
    );
    expect(codeError).toBeTruthy();
    expect(branchesServiceMock.create).not.toHaveBeenCalled();
  });

  it('should call BranchesService.create with schoolId and close dialog on valid submit', async () => {
    setupComponent();
    branchesServiceMock.create.mockReturnValue(of(mockCreatedBranch));
    const fixture = await createFixture();

    const nameInput = fixture.nativeElement.querySelector('input[formcontrolname="name"]');
    nameInput.value = 'East Wing';
    nameInput.dispatchEvent(new Event('input'));

    const shortNameInput = fixture.nativeElement.querySelector('input[formcontrolname="shortName"]');
    shortNameInput.value = 'East';
    shortNameInput.dispatchEvent(new Event('input'));

    const codeInput = fixture.nativeElement.querySelector('input[formcontrolname="code"]');
    codeInput.value = 'EW-003';
    codeInput.dispatchEvent(new Event('input'));

    const addressInput = fixture.nativeElement.querySelector('textarea[formcontrolname="address"]');
    addressInput.value = '789 East Rd';
    addressInput.dispatchEvent(new Event('input'));

    fixture.detectChanges();

    const submitButton = fixture.nativeElement.querySelector('button[type="submit"]');
    submitButton.click();

    await fixture.whenStable();

    expect(branchesServiceMock.create).toHaveBeenCalledWith('s1', {
      name: 'East Wing',
      code: 'EW-003',
      shortName: 'East',
      description: undefined,
      email: undefined,
      phone: undefined,
      address: '789 East Rd',
    } as CreateBranchRequest);
    expect(dialogRefMock.close).toHaveBeenCalledWith(mockCreatedBranch);
  });

  it('should show error message when service returns 409 conflict', async () => {
    setupComponent();
    branchesServiceMock.create.mockReturnValue(throwError(() => ({ status: 409 })));
    const fixture = await createFixture();

    const nameInput = fixture.nativeElement.querySelector('input[formcontrolname="name"]');
    nameInput.value = 'Existing Branch';
    nameInput.dispatchEvent(new Event('input'));

    const shortNameInput = fixture.nativeElement.querySelector('input[formcontrolname="shortName"]');
    shortNameInput.value = 'Existing';
    shortNameInput.dispatchEvent(new Event('input'));

    const codeInput = fixture.nativeElement.querySelector('input[formcontrolname="code"]');
    codeInput.value = 'EXISTING';
    codeInput.dispatchEvent(new Event('input'));

    const addressInput = fixture.nativeElement.querySelector('textarea[formcontrolname="address"]');
    addressInput.value = '123 St';
    addressInput.dispatchEvent(new Event('input'));

    fixture.detectChanges();

    const submitButton = fixture.nativeElement.querySelector('button[type="submit"]');
    submitButton.click();

    await fixture.whenStable();
    fixture.detectChanges();

    expect(dialogRefMock.close).not.toHaveBeenCalled();

    const errorEl = fixture.nativeElement.querySelector('.dialog-error');
    expect(errorEl).toBeTruthy();
    expect(errorEl.textContent).toContain('already exists in this school');
  });

  it('should close dialog without result on cancel', async () => {
    setupComponent();
    const fixture = await createFixture();

    const cancelButton = fixture.nativeElement.querySelector('button[type="button"]');
    expect(cancelButton).toBeTruthy();
    cancelButton.click();

    expect(dialogRefMock.close).toHaveBeenCalled();
    expect(branchesServiceMock.create).not.toHaveBeenCalled();
  });
});
