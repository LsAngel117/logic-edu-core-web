import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { of, throwError } from 'rxjs';
import { BranchesService } from '../services/branches';
import { SchoolsService } from '../../services/schools';
import { BranchResponse, CreateBranchRequest } from '../models/branch';
import { School } from '../../models/school';
import { CreateBranchDialogComponent } from './create-branch';

describe('CreateBranchDialogComponent', () => {
  let branchesServiceMock: { create: ReturnType<typeof vi.fn> };
  let schoolsServiceMock: { getAll: ReturnType<typeof vi.fn> };

  const mockSchools: School[] = [
    {
      id: 's1',
      name: 'North Academy',
      code: 'NAC-001',
      shortName: 'North',
      description: '',
      email: '',
      phone: '',
      address: '123 Main St',
      status: 'ACTIVE',
      createdAt: '2026-01-01T00:00:00Z',
    },
    {
      id: 's2',
      name: 'South School',
      code: 'SOS-002',
      shortName: 'South',
      description: '',
      email: '',
      phone: '',
      address: '456 Oak Ave',
      status: 'ACTIVE',
      createdAt: '2026-02-01T00:00:00Z',
    },
  ];

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

  function setupComponent() {
    branchesServiceMock = { create: vi.fn() };
    schoolsServiceMock = { getAll: vi.fn().mockReturnValue(of(mockSchools)) };

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [CreateBranchDialogComponent],
      providers: [
        provideAnimationsAsync(),
        { provide: BranchesService, useValue: branchesServiceMock },
        { provide: SchoolsService, useValue: schoolsServiceMock },
      ],
    });
  }

  async function createFixture() {
    const fixture = await TestBed.createComponent(CreateBranchDialogComponent);
    fixture.detectChanges();
    return fixture;
  }

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // --- Form fields ---

  it('should render form with school selector, name, code fields', async () => {
    setupComponent();
    const fixture = await createFixture();
    await fixture.whenStable();
    fixture.componentInstance.visible.set(true);
    fixture.detectChanges();

    const schoolSelect = fixture.nativeElement.querySelector('select[formcontrolname="schoolId"]');
    const nameInput = fixture.nativeElement.querySelector('input[formcontrolname="name"]');
    const codeInput = fixture.nativeElement.querySelector('input[formcontrolname="code"]');

    expect(schoolSelect).toBeTruthy();
    expect(nameInput).toBeTruthy();
    expect(codeInput).toBeTruthy();
  });

  it('should render school options from SchoolsService', async () => {
    setupComponent();
    const fixture = await createFixture();
    await fixture.whenStable();
    fixture.componentInstance.visible.set(true);
    fixture.detectChanges();

    const schoolSelect = fixture.nativeElement.querySelector('select[formcontrolname="schoolId"]');
    const options = schoolSelect.querySelectorAll('option');
    // First option is placeholder, then 2 schools
    expect(options.length).toBe(3);
    expect(options[1].textContent?.trim()).toBe('North Academy');
    expect(options[2].textContent?.trim()).toBe('South School');
  });

  // --- Validation ---

  it('should mark form as invalid when submitted empty', async () => {
    setupComponent();
    const fixture = await createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    // Set visible to true so the form is rendered and we can interact
    fixture.componentInstance.visible.set(true);
    fixture.detectChanges();

    const submitButton = fixture.nativeElement.querySelector('button[type="confirm"]');
    // AppDialog uses a custom confirm button — find it by text
    const confirmBtn = Array.from(
      fixture.nativeElement.querySelectorAll('button')
    ).find((el: any) => el.textContent?.trim() === 'Crear');
    if (confirmBtn) {
      (confirmBtn as HTMLButtonElement).click();
      fixture.detectChanges();
    }

    expect(branchesServiceMock.create).not.toHaveBeenCalled();
  });

  // --- Successful submit ---

  it('should call BranchesService.create with selected schoolId and close dialog on valid submit', async () => {
    setupComponent();
    branchesServiceMock.create.mockReturnValue(of(mockCreatedBranch));
    const fixture = await createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    fixture.componentInstance.visible.set(true);
    fixture.detectChanges();

    // Fill school selector
    const schoolSelect = fixture.nativeElement.querySelector('select[formcontrolname="schoolId"]');
    schoolSelect.value = 's1';
    schoolSelect.dispatchEvent(new Event('change'));

    // Fill name
    const nameInput = fixture.nativeElement.querySelector('input[formcontrolname="name"]');
    nameInput.value = 'East Wing';
    nameInput.dispatchEvent(new Event('input'));

    // Fill shortName
    const shortNameInput = fixture.nativeElement.querySelector('input[formcontrolname="shortName"]');
    shortNameInput.value = 'East';
    shortNameInput.dispatchEvent(new Event('input'));

    // Fill code
    const codeInput = fixture.nativeElement.querySelector('input[formcontrolname="code"]');
    codeInput.value = 'EW-003';
    codeInput.dispatchEvent(new Event('input'));

    // Fill address
    const addressInput = fixture.nativeElement.querySelector('input[formcontrolname="address"]');
    addressInput.value = '789 East Rd';
    addressInput.dispatchEvent(new Event('input'));

    fixture.detectChanges();

    // Submit
    const confirmBtn = Array.from(
      fixture.nativeElement.querySelectorAll('button')
    ).find((el: any) => el.textContent?.trim() === 'Crear') as HTMLButtonElement;

    if (confirmBtn) {
      confirmBtn.click();
    }

    await fixture.whenStable();
    fixture.detectChanges();

    expect(branchesServiceMock.create).toHaveBeenCalledWith('s1', {
      name: 'East Wing',
      code: 'EW-003',
      shortName: 'East',
      type: 'MAIN',
      description: undefined,
      email: undefined,
      phone: undefined,
      address: '789 East Rd',
      city: undefined,
      country: undefined,
    } as CreateBranchRequest);

    // Dialog should close after success
    expect(fixture.componentInstance.visible()).toBe(false);
  });

  // --- Error handling ---

  it('should show error message when service fails', async () => {
    setupComponent();
    branchesServiceMock.create.mockReturnValue(throwError(() => ({ status: 409, message: 'already exists' })));
    const fixture = await createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    fixture.componentInstance.visible.set(true);
    fixture.detectChanges();

    // Fill form with minimum required fields
    const schoolSelect = fixture.nativeElement.querySelector('select[formcontrolname="schoolId"]');
    schoolSelect.value = 's1';
    schoolSelect.dispatchEvent(new Event('change'));

    const nameInput = fixture.nativeElement.querySelector('input[formcontrolname="name"]');
    nameInput.value = 'Existing Branch';
    nameInput.dispatchEvent(new Event('input'));

    const shortNameInput = fixture.nativeElement.querySelector('input[formcontrolname="shortName"]');
    shortNameInput.value = 'Existing';
    shortNameInput.dispatchEvent(new Event('input'));

    const codeInput = fixture.nativeElement.querySelector('input[formcontrolname="code"]');
    codeInput.value = 'EXISTING';
    codeInput.dispatchEvent(new Event('input'));

    const addressInput = fixture.nativeElement.querySelector('input[formcontrolname="address"]');
    addressInput.value = '123 St';
    addressInput.dispatchEvent(new Event('input'));

    fixture.detectChanges();

    const confirmBtn = Array.from(
      fixture.nativeElement.querySelectorAll('button')
    ).find((el: any) => el.textContent?.trim() === 'Crear') as HTMLButtonElement;
    if (confirmBtn) {
      confirmBtn.click();
    }

    await fixture.whenStable();
    fixture.detectChanges();

    // Error message should be visible
    const errorEl = fixture.nativeElement.querySelector('.field-error');
    expect(errorEl).toBeTruthy();
    expect(errorEl.textContent).toContain('already exists');

    // Dialog should NOT close on error
    expect(fixture.componentInstance.visible()).toBe(true);
  });
});
