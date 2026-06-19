import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { signal } from '@angular/core';
import { of } from 'rxjs';
import { AuthService } from '../../../core/services/auth';
import { MembershipsService } from '../../users/memberships/services/memberships';
import { User } from '../../../core/models/user';
import { SchoolsService } from '../services/schools';
import { School } from '../models/school';
import { Membership } from '../../users/memberships/models/membership';
import { SchoolStatusDialog } from './school-status';

describe('SchoolStatusDialog', () => {
  let schoolsServiceMock: { updateStatus: ReturnType<typeof vi.fn> };
  let membershipsServiceMock: { getByUser: ReturnType<typeof vi.fn> };
  let authServiceMock: any;

  const mockAuthUser: User = {
    id: 'auth1',
    email: 'admin@logicedu.com',
    fullName: 'Admin',
    username: 'admin',
    roles: ['PLATFORM_ADMIN'],
    token: 'jwt.token',
  };

  const activeSchool: School = {
    id: 's1',
    name: 'North Academy',
    code: 'NAC-001',
    shortName: 'North',
    description: 'A school of excellence',
    email: 'north@school.edu',
    phone: '1234567890',
    address: '123 Main St',
    status: 'ACTIVE',
    createdAt: '2026-01-01T00:00:00Z',
  };

  const inactiveSchool: School = {
    ...activeSchool,
    id: 's2',
    name: 'South School',
    code: 'SOS-002',
    status: 'INACTIVE',
  };

  function setupComponent(dialogData: School = activeSchool, authUser: User | null = null) {
    schoolsServiceMock = { updateStatus: vi.fn() };
    membershipsServiceMock = { getByUser: vi.fn().mockReturnValue(of([])) };
    authServiceMock = { user: signal(authUser) };

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [SchoolStatusDialog],
      providers: [
        provideAnimationsAsync(),
        { provide: SchoolsService, useValue: schoolsServiceMock },
        { provide: AuthService, useValue: authServiceMock },
        { provide: MembershipsService, useValue: membershipsServiceMock },
      ],
    });
  }

  async function createFixture(school: School = activeSchool) {
    const fixture = await TestBed.createComponent(SchoolStatusDialog);
    fixture.componentRef.setInput('school', school);
    fixture.detectChanges();
    return fixture;
  }

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should compute correct title and message for ACTIVE school', async () => {
    setupComponent(activeSchool);
    const fixture = await createFixture(activeSchool);

    const comp = fixture.componentInstance;
    expect(comp.statusTitle()).toBe('Desactivar institución');
    expect(comp.statusMessage()).toContain('desactivar');
    expect(comp.statusMessage()).toContain('North Academy');
    expect(comp.confirmLabel()).toBe('Desactivar');
  });

  it('should compute correct title and message for INACTIVE school', async () => {
    setupComponent(inactiveSchool);
    const fixture = await createFixture(inactiveSchool);

    const comp = fixture.componentInstance;
    expect(comp.statusTitle()).toBe('Activar institución');
    expect(comp.statusMessage()).toContain('activar');
    expect(comp.statusMessage()).toContain('South School');
    expect(comp.confirmLabel()).toBe('Activar');
  });

  it('should call updateStatus with school id on confirm', async () => {
    setupComponent(activeSchool);
    const updatedSchool: School = { ...activeSchool, status: 'INACTIVE' };
    schoolsServiceMock.updateStatus.mockReturnValue(of(updatedSchool));
    const fixture = await createFixture(activeSchool);

    const comp = fixture.componentInstance;
    comp.visible.set(true);
    fixture.detectChanges();

    await comp.onConfirm();
    await fixture.whenStable();

    expect(schoolsServiceMock.updateStatus).toHaveBeenCalledWith('s1');
  });

  it('should detect self-school and disable confirmation', async () => {
    const selfSchool: School = { ...activeSchool, id: 'auth1' };
    const selfMembership: Membership = {
      id: 'm1',
      userId: 'auth1',
      role: 'SCHOOL_ADMIN',
      scopeType: 'SCHOOL',
      scopeRefId: 'auth1',
      active: true,
    };
    setupComponent(selfSchool, mockAuthUser);
    membershipsServiceMock.getByUser.mockReturnValue(of([selfMembership]));
    const fixture = await createFixture(selfSchool);

    const comp = fixture.componentInstance;
    comp.checkSelfSchool();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(comp.isSelfSchool()).toBe(true);
    expect(comp.statusMessage()).toContain('No puedes');
  });

  it('should close dialog without changes on cancel', async () => {
    setupComponent(activeSchool);
    const fixture = await createFixture(activeSchool);

    const comp = fixture.componentInstance;
    comp.visible.set(true);
    fixture.detectChanges();

    comp.onCancel();

    expect(comp.visible()).toBe(false);
    expect(schoolsServiceMock.updateStatus).not.toHaveBeenCalled();
  });
});
