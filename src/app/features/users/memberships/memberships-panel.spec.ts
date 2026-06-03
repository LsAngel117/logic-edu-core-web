import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { MatDialog } from '@angular/material/dialog';
import { of, throwError, Observable } from 'rxjs';
import { MembershipsService } from './services/memberships';
import { Membership } from './models/membership';
import { MembershipsPanelComponent } from './memberships-panel';

describe('MembershipsPanelComponent', () => {
  let membershipsServiceMock: { getByUser: ReturnType<typeof vi.fn> };
  let dialogMock: { open: ReturnType<typeof vi.fn> };

  const mockMemberships: Membership[] = [
    {
      id: 'm1',
      userId: 'u1',
      role: 'TEACHER',
      scopeType: 'SCHOOL',
      scopeRefId: 'school-1',
      active: true,
    },
    {
      id: 'm2',
      userId: 'u1',
      role: 'STUDENT',
      scopeType: 'BRANCH',
      scopeRefId: 'branch-5a',
      active: true,
    },
  ];

  function setupComponent(userId: string = 'u1') {
    membershipsServiceMock = { getByUser: vi.fn() };
    dialogMock = {
      open: vi.fn().mockReturnValue({ afterClosed: () => of(undefined) }),
    };

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [MembershipsPanelComponent],
      providers: [
        provideAnimationsAsync(),
        { provide: MembershipsService, useValue: membershipsServiceMock },
        { provide: MatDialog, useValue: dialogMock },
      ],
    });
  }

  async function createFixture(userId: string = 'u1') {
    const fixture = await TestBed.createComponent(MembershipsPanelComponent);
    fixture.componentRef.setInput('userId', userId);
    fixture.detectChanges();
    return fixture;
  }

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should show loading spinner while fetching memberships', async () => {
    setupComponent();
    membershipsServiceMock.getByUser.mockReturnValue(new Observable());

    const fixture = await createFixture();

    const spinner = fixture.nativeElement.querySelector('mat-spinner');
    expect(spinner).toBeTruthy();
  });

  it('should render memberships in a list after loading', async () => {
    setupComponent();
    membershipsServiceMock.getByUser.mockReturnValue(of(mockMemberships));

    const fixture = await createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    const rows = fixture.nativeElement.querySelectorAll('.membership-row');
    expect(rows.length).toBe(2);

    const firstRow = rows[0].textContent;
    expect(firstRow).toContain('TEACHER');
    expect(firstRow).toContain('SCHOOL');
    expect(firstRow).toContain('school-1');
  });

  it('should display "No memberships assigned" when empty', async () => {
    setupComponent();
    membershipsServiceMock.getByUser.mockReturnValue(of([]));

    const fixture = await createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    const emptyEl = fixture.nativeElement.querySelector('.empty-state');
    expect(emptyEl).toBeTruthy();
    expect(emptyEl.textContent).toContain('No memberships assigned');
  });

  it('should show error message when fetch fails', async () => {
    setupComponent();
    membershipsServiceMock.getByUser.mockReturnValue(
      throwError(() => new Error('Network error'))
    );

    const fixture = await createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    const errorEl = fixture.nativeElement.querySelector('.error-state');
    expect(errorEl).toBeTruthy();
    expect(errorEl.textContent).toContain('Failed to load memberships');
  });

  it('should have an "Add Membership" button', async () => {
    setupComponent();
    membershipsServiceMock.getByUser.mockReturnValue(of(mockMemberships));

    const fixture = await createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    const addButton = fixture.nativeElement.querySelector('.add-membership-btn');
    expect(addButton).toBeTruthy();
  });

  it('should have a "Remove" button for each membership row', async () => {
    setupComponent();
    membershipsServiceMock.getByUser.mockReturnValue(of(mockMemberships));

    const fixture = await createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    const removeButtons = fixture.nativeElement.querySelectorAll('.remove-btn');
    expect(removeButtons.length).toBe(2);
  });
});
