import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';
import { SchoolsService } from '../services/schools';
import { School, CreateSchoolPayload } from '../models/school';
import { CreateSchoolDialogComponent } from './create-school';

describe('CreateSchoolDialogComponent', () => {
  let schoolsServiceMock: { create: ReturnType<typeof vi.fn> };
  let dialogRefMock: { close: ReturnType<typeof vi.fn> };

  function setupComponent() {
    schoolsServiceMock = { create: vi.fn() };
    dialogRefMock = { close: vi.fn() };

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [CreateSchoolDialogComponent],
      providers: [
        provideAnimationsAsync(),
        { provide: SchoolsService, useValue: schoolsServiceMock },
        { provide: MatDialogRef, useValue: dialogRefMock },
        { provide: MAT_DIALOG_DATA, useValue: null },
      ],
    });
  }

  async function createFixture() {
    const fixture = await TestBed.createComponent(CreateSchoolDialogComponent);
    fixture.detectChanges();
    return fixture;
  }

  const mockCreatedSchool: School = {
    id: 'new1',
    name: 'East Academy',
    code: 'EAC-003',
    address: '789 Pine Rd',
    status: 'active',
    branchCount: 0,
    createdAt: '2026-03-01T00:00:00Z',
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
    expect(schoolsServiceMock.create).not.toHaveBeenCalled();
  });

  it('should show code format error for invalid code', async () => {
    setupComponent();
    const fixture = await createFixture();

    const nameInput = fixture.nativeElement.querySelector('input[formcontrolname="name"]');
    nameInput.value = 'Test School';
    nameInput.dispatchEvent(new Event('input'));

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
    expect(schoolsServiceMock.create).not.toHaveBeenCalled();
  });

  it('should call SchoolsService.create and close dialog on valid submit', async () => {
    setupComponent();
    schoolsServiceMock.create.mockReturnValue(of(mockCreatedSchool));
    const fixture = await createFixture();

    const nameInput = fixture.nativeElement.querySelector('input[formcontrolname="name"]');
    nameInput.value = 'East Academy';
    nameInput.dispatchEvent(new Event('input'));

    const codeInput = fixture.nativeElement.querySelector('input[formcontrolname="code"]');
    codeInput.value = 'EAC-003';
    codeInput.dispatchEvent(new Event('input'));

    const addressInput = fixture.nativeElement.querySelector('textarea[formcontrolname="address"]');
    addressInput.value = '789 Pine Rd';
    addressInput.dispatchEvent(new Event('input'));

    fixture.detectChanges();

    const submitButton = fixture.nativeElement.querySelector('button[type="submit"]');
    submitButton.click();

    await fixture.whenStable();

    expect(schoolsServiceMock.create).toHaveBeenCalledWith({
      name: 'East Academy',
      code: 'EAC-003',
      address: '789 Pine Rd',
    } as CreateSchoolPayload);
    expect(dialogRefMock.close).toHaveBeenCalledWith(mockCreatedSchool);
  });

  it('should show error message when service returns 409 conflict', async () => {
    setupComponent();
    schoolsServiceMock.create.mockReturnValue(throwError(() => ({ status: 409 })));
    const fixture = await createFixture();

    const nameInput = fixture.nativeElement.querySelector('input[formcontrolname="name"]');
    nameInput.value = 'Existing School';
    nameInput.dispatchEvent(new Event('input'));

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
    expect(errorEl.textContent).toContain('A school with this name or code already exists');
  });

  it('should close dialog without result on cancel', async () => {
    setupComponent();
    const fixture = await createFixture();

    const cancelButton = fixture.nativeElement.querySelector('button[type="button"]');
    expect(cancelButton).toBeTruthy();
    cancelButton.click();

    expect(dialogRefMock.close).toHaveBeenCalled();
    expect(schoolsServiceMock.create).not.toHaveBeenCalled();
  });
});
