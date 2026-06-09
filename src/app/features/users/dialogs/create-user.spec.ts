import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { of, throwError } from 'rxjs';
import { UsersService } from '../services/users';
import { UserProfile, CreateUserPayload } from '../models/user-profile';
import { CreateUserDialogComponent } from './create-user';

describe('CreateUserDialogComponent', () => {
  let usersServiceMock: { create: ReturnType<typeof vi.fn> };

  function setupComponent() {
    usersServiceMock = { create: vi.fn() };

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [CreateUserDialogComponent],
      providers: [
        provideAnimationsAsync(),
        { provide: UsersService, useValue: usersServiceMock },
      ],
    });
  }

  async function createFixture(visible = true) {
    const fixture = await TestBed.createComponent(CreateUserDialogComponent);
    fixture.componentRef.setInput('visible', visible);
    fixture.detectChanges();
    return fixture;
  }

  const mockCreatedUser: UserProfile = {
    id: 'new1',
    username: 'charlie',
    email: 'charlie@logicedu.com',
    fullName: 'Charlie Brown',
    status: 'ACTIVE',
    createdAt: '2026-03-01T00:00:00Z',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Helper: fill all required fields
  function fillRequiredFields(fixture: any) {
    const setInput = (selector: string, value: string) => {
      const el = fixture.nativeElement.querySelector(selector);
      if (el) {
        el.value = value;
        el.dispatchEvent(new Event('input'));
      }
    };
    const setSelect = (selector: string, value: string) => {
      const el = fixture.nativeElement.querySelector(selector);
      if (el) {
        el.value = value;
        el.dispatchEvent(new Event('change'));
      }
    };

    setInput('[data-testid="create-email"]', 'charlie@logicedu.com');
    setInput('[data-testid="create-password"]', 'password123');
    setInput('[data-testid="create-firstGivenName"]', 'Charlie');
    setInput('[data-testid="create-firstFamilyName"]', 'Brown');
    setSelect('[data-testid="create-sex"]', 'MALE');
    setInput('[data-testid="create-birthDate"]', '2000-05-15');
    setSelect('[data-testid="create-documentType"]', 'CC');
    setInput('[data-testid="create-documentValue"]', '1234567890');
    setSelect('[data-testid="create-role"]', 'TEACHER');
    setSelect('[data-testid="create-scopeType"]', 'ALL');
  }

  // --- Rendering ---

  it('should render all form fields when visible', async () => {
    setupComponent();
    const fixture = await createFixture(true);

    expect(fixture.nativeElement.querySelector('[data-testid="create-email"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('[data-testid="create-password"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('[data-testid="create-firstGivenName"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('[data-testid="create-secondGivenName"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('[data-testid="create-firstFamilyName"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('[data-testid="create-secondFamilyName"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('[data-testid="create-sex"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('[data-testid="create-birthDate"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('[data-testid="create-documentType"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('[data-testid="create-documentValue"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('[data-testid="create-role"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('[data-testid="create-scopeType"]')).toBeTruthy();
  });

  it('should not render form when not visible', async () => {
    setupComponent();
    const fixture = await createFixture(false);

    const overlay = fixture.nativeElement.querySelector('[data-testid="app-dialog-overlay"]');
    expect(overlay).toBeNull();
  });

  // --- Validation ---

  it('should show validation error when required fields are empty', async () => {
    setupComponent();
    const fixture = await createFixture(true);

    const confirmBtn = fixture.nativeElement.querySelector('[data-testid="app-dialog-confirm"]');
    confirmBtn.click();
    fixture.detectChanges();

    const errorEl = fixture.nativeElement.querySelector('.dialog-error');
    expect(errorEl).toBeTruthy();
    expect(errorEl.textContent).toContain('requeridos');
    expect(usersServiceMock.create).not.toHaveBeenCalled();
  });

  it('should show password length error when password < 8 chars', async () => {
    setupComponent();
    const fixture = await createFixture(true);

    // Fill all required fields but with short password
    fillRequiredFields(fixture);
    const pwdInput = fixture.nativeElement.querySelector('[data-testid="create-password"]');
    pwdInput.value = '123';
    pwdInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const confirmBtn = fixture.nativeElement.querySelector('[data-testid="app-dialog-confirm"]');
    confirmBtn.click();
    fixture.detectChanges();

    const errorEl = fixture.nativeElement.querySelector('.dialog-error');
    expect(errorEl).toBeTruthy();
    expect(errorEl.textContent).toContain('8 caracteres');
  });

  // --- Successful submit ---

  it('should call UsersService.create with correct payload on valid submit', async () => {
    setupComponent();
    usersServiceMock.create.mockReturnValue(of(mockCreatedUser));
    const fixture = await createFixture(true);

    fillRequiredFields(fixture);
    fixture.detectChanges();

    const confirmBtn = fixture.nativeElement.querySelector('[data-testid="app-dialog-confirm"]');
    confirmBtn.click();

    await fixture.whenStable();

    const expectedPayload: CreateUserPayload = {
      email: 'charlie@logicedu.com',
      rawPassword: 'password123',
      firstGivenName: 'Charlie',
      secondGivenName: undefined,
      firstFamilyName: 'Brown',
      secondFamilyName: undefined,
      sex: 'MALE',
      birthDate: '2000-05-15',
      documentType: 'CC',
      documentValue: '1234567890',
      role: 'TEACHER',
      scopeType: 'ALL',
      scopeRefId: undefined,
    };

    expect(usersServiceMock.create).toHaveBeenCalledWith(expectedPayload);
  });

  it('should include optional fields in payload when provided', async () => {
    setupComponent();
    usersServiceMock.create.mockReturnValue(of(mockCreatedUser));
    const fixture = await createFixture(true);

    fillRequiredFields(fixture);

    // Fill optional fields
    const secondName = fixture.nativeElement.querySelector('[data-testid="create-secondGivenName"]');
    secondName.value = 'Andrés';
    secondName.dispatchEvent(new Event('input'));

    const secondFamily = fixture.nativeElement.querySelector('[data-testid="create-secondFamilyName"]');
    secondFamily.value = 'López';
    secondFamily.dispatchEvent(new Event('input'));

    // Set scopeType to SCHOOL and fill scopeRefId
    const scopeSelect = fixture.nativeElement.querySelector('[data-testid="create-scopeType"]');
    scopeSelect.value = 'SCHOOL';
    scopeSelect.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    const scopeRef = fixture.nativeElement.querySelector('[data-testid="create-scopeRefId"]');
    scopeRef.value = 'school-123';
    scopeRef.dispatchEvent(new Event('input'));

    fixture.detectChanges();

    const confirmBtn = fixture.nativeElement.querySelector('[data-testid="app-dialog-confirm"]');
    confirmBtn.click();

    await fixture.whenStable();

    const expectedPayload: CreateUserPayload = {
      email: 'charlie@logicedu.com',
      rawPassword: 'password123',
      firstGivenName: 'Charlie',
      secondGivenName: 'Andrés',
      firstFamilyName: 'Brown',
      secondFamilyName: 'López',
      sex: 'MALE',
      birthDate: '2000-05-15',
      documentType: 'CC',
      documentValue: '1234567890',
      role: 'TEACHER',
      scopeType: 'SCHOOL',
      scopeRefId: 'school-123',
    };

    expect(usersServiceMock.create).toHaveBeenCalledWith(expectedPayload);
  });

  // --- Error handling ---

  it('should show error message on 409 conflict', async () => {
    setupComponent();
    usersServiceMock.create.mockReturnValue(throwError(() => ({ status: 409 })));
    const fixture = await createFixture(true);

    fillRequiredFields(fixture);
    fixture.detectChanges();

    const confirmBtn = fixture.nativeElement.querySelector('[data-testid="app-dialog-confirm"]');
    confirmBtn.click();

    await fixture.whenStable();
    fixture.detectChanges();

    const errorEl = fixture.nativeElement.querySelector('.dialog-error');
    expect(errorEl).toBeTruthy();
    expect(errorEl.textContent).toContain('ya en uso');
  });

  // --- Cancel ---

  it('should emit cancel on cancel click', async () => {
    setupComponent();
    const fixture = await createFixture(true);

    let cancelled = false;
    fixture.componentInstance.cancel.subscribe(() => { cancelled = true; });

    const cancelBtn = fixture.nativeElement.querySelector('[data-testid="app-dialog-cancel"]');
    cancelBtn.click();

    expect(cancelled).toBe(true);
  });

  // --- scopeRefId visibility ---

  it('should show scopeRefId input when scopeType is SCHOOL or BRANCH', async () => {
    setupComponent();
    const fixture = await createFixture(true);

    // Default is ALL, scopeRefId should not be visible
    let scopeRefEl = fixture.nativeElement.querySelector('[data-testid="create-scopeRefId"]');
    expect(scopeRefEl).toBeNull();

    // Change to SCHOOL
    const scopeSelect = fixture.nativeElement.querySelector('[data-testid="create-scopeType"]');
    scopeSelect.value = 'SCHOOL';
    scopeSelect.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    scopeRefEl = fixture.nativeElement.querySelector('[data-testid="create-scopeRefId"]');
    expect(scopeRefEl).toBeTruthy();
  });
});
