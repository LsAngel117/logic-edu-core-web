import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { signal, computed } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { of } from 'rxjs';
import { AuthService } from '../../../core/services/auth';
import { MembershipsService } from '../../users/memberships/services/memberships';
import { User } from '../../../core/models/user';
import { SchoolsService } from '../services/schools';
import { School } from '../models/school';
import { Membership } from '../../users/memberships/models/membership';
import { SchoolStatusDialogComponent } from './school-status';

describe('SchoolStatusDialogComponent', () => {
  let schoolsServiceMock: { updateStatus: ReturnType<typeof vi.fn> };
  let dialogRefMock: { close: ReturnType<typeof vi.fn> };
  let membershipsServiceMock: { getByUser: ReturnType<typeof vi.fn> };
  let authServiceMock: {
    user: ReturnType<typeof signal<User | null>>;
    isAuthenticated: ReturnType<typeof computed<boolean>>;
  };

  const mockAuthUser: User = {
    id: 'auth1',
    email: 'admin@logicedu.com',
    displayName: 'Admin',
    roles: ['PLATFORM_ADMIN'],
    token: 'jwt.token',
  };

  const activeSchool: School = {
    id: 's1',
    name: 'North Academy',
    code: 'NAC-001',
    address: '123 Main St',
    status: 'active',
    branchCount: 3,
    createdAt: '2026-01-01T00:00:00Z',
  };

  const inactiveSchool: School = {
    id: 's2',
    name: 'South School',
    code: 'SOS-002',
    address: '456 Oak Ave',
    status: 'inactive',
    branchCount: 0,
    createdAt: '2026-02-01T00:00:00Z',
  };

  function setupComponent(dialogData: School = activeSchool, authUser: User | null = null) {
    schoolsServiceMock = { updateStatus: vi.fn() };
    dialogRefMock = { close: vi.fn() };
    membershipsServiceMock = { getByUser: vi.fn().mockReturnValue(of([])) };
    authServiceMock = {
      user: signal(authUser),
      isAuthenticated: computed(() => authUser !== null),
    };

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [SchoolStatusDialogComponent],
      providers: [
        provideNoopAnimations(),
        { provide: SchoolsService, useValue: schoolsServiceMock },
        { provide: MatDialogRef, useValue: dialogRefMock },
        { provide: MAT_DIALOG_DATA, useValue: dialogData },
        { provide: AuthService, useValue: authServiceMock },
        { provide: MembershipsService, useValue: membershipsServiceMock },
      ],
    });
  }

  async function createFixture() {
    const fixture = await TestBed.createComponent(SchoolStatusDialogComponent);
    fixture.detectChanges();
    return fixture;
  }

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should display current school name and status', async () => {
    setupComponent(activeSchool);
    const fixture = await createFixture();

    const content = fixture.nativeElement.textContent;
    expect(content).toContain('North Academy');
    expect(content).toContain('active');
  });

  it('should show inactive status when school is inactive', async () => {
    setupComponent(inactiveSchool);
    const fixture = await createFixture();

    const content = fixture.nativeElement.textContent;
    expect(content).toContain('South School');
    expect(content).toContain('inactive');
  });

  it('should call updateStatus with toggled value on confirm', async () => {
    setupComponent(activeSchool);
    const updatedSchool: School = { ...activeSchool, status: 'inactive' };
    schoolsServiceMock.updateStatus.mockReturnValue(of(updatedSchool));
    const fixture = await createFixture();

    const confirmButton = fixture.nativeElement.querySelector('button[color="primary"]');
    expect(confirmButton).toBeTruthy();
    confirmButton.click();

    await fixture.whenStable();

    expect(schoolsServiceMock.updateStatus).toHaveBeenCalledWith('s1', { status: 'inactive' });
    expect(dialogRefMock.close).toHaveBeenCalledWith(updatedSchool);
  });

  it('should show cascade warning when school has branches', async () => {
    setupComponent(activeSchool);
    const fixture = await createFixture();

    // The activeSchool has branchCount: 3
    const warning = fixture.nativeElement.querySelector('.cascade-warning');
    expect(warning).toBeTruthy();
    expect(warning.textContent).toContain('3 active branches');
    expect(warning.textContent).toContain('Deactivating it will also deactivate all branches');
  });

  it('should not show cascade warning when school has no branches', async () => {
    const noBranchSchool: School = { ...activeSchool, branchCount: 0 };
    setupComponent(noBranchSchool);
    const fixture = await createFixture();

    const warning = fixture.nativeElement.querySelector('.cascade-warning');
    expect(warning).toBeNull();
  });

  it('should close dialog without changes on cancel', async () => {
    setupComponent();
    const fixture = await createFixture();

    const buttons = fixture.nativeElement.querySelectorAll('button');
    const cancelButton = Array.from(buttons as Element[]).find(
      (b) => b.textContent?.trim() === 'Cancel'
    );
    expect(cancelButton).toBeTruthy();
    (cancelButton as HTMLButtonElement).click();

    expect(dialogRefMock.close).toHaveBeenCalled();
    expect(schoolsServiceMock.updateStatus).not.toHaveBeenCalled();
  });

  it('should disable toggle when self-school detected', async () => {
    const selfSchool: School = { ...activeSchool, id: 'auth1' };
    const selfMembership: Membership = {
      id: 'm1',
      userId: 'auth1',
      role: 'SCHOOL_ADMIN',
      scope: 'auth1',
      effectivePermissions: [],
    };
    setupComponent(selfSchool, mockAuthUser);
    membershipsServiceMock.getByUser.mockReturnValue(of([selfMembership]));
    const fixture = await createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.componentInstance.isSelfSchool()).toBe(true);

    const message = fixture.nativeElement.querySelector('.self-disable-message');
    expect(message).toBeTruthy();
  });
});
