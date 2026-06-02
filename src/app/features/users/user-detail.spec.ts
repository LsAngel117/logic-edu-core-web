import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { ActivatedRoute } from '@angular/router';
import { of, throwError, Observable, BehaviorSubject } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { UsersService } from './services/users';
import { UserProfile } from './models/user-profile';
import { UserDetailComponent } from './user-detail';

describe('UserDetailComponent', () => {
  let usersServiceMock: { getById: ReturnType<typeof vi.fn> };
  let paramsSubject: BehaviorSubject<{ id: string }>;

  const mockUser: UserProfile = {
    id: 'u1',
    email: 'alice@logicedu.com',
    displayName: 'Alice',
    status: 'active',
    roles: ['TEACHER', 'STUDENT'],
    createdAt: '2026-06-01T12:00:00Z',
  };

  function setupComponent(userId: string = 'u1') {
    usersServiceMock = { getById: vi.fn() };
    paramsSubject = new BehaviorSubject({ id: userId });

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [UserDetailComponent],
      providers: [
        provideRouter([]),
        provideAnimationsAsync(),
        { provide: UsersService, useValue: usersServiceMock },
        {
          provide: ActivatedRoute,
          useValue: { params: paramsSubject.asObservable() },
        },
        {
          provide: MatDialog,
          useValue: {
            open: vi.fn().mockReturnValue({ afterClosed: () => of(undefined) }),
          },
        },
      ],
    });
  }

  async function createFixture() {
    const fixture = await TestBed.createComponent(UserDetailComponent);
    fixture.detectChanges();
    return fixture;
  }

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should show loading spinner while fetching user', async () => {
    setupComponent();
    usersServiceMock.getById.mockReturnValue(new Observable());

    const fixture = await createFixture();

    const spinner = fixture.nativeElement.querySelector('mat-spinner');
    expect(spinner).toBeTruthy();
  });

  it('should render user display name, email, and status after loading', async () => {
    setupComponent();
    usersServiceMock.getById.mockReturnValue(of(mockUser));

    const fixture = await createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    const content = fixture.nativeElement.textContent;
    expect(content).toContain('Alice');
    expect(content).toContain('alice@logicedu.com');
    expect(content).toContain('active');
  });

  it('should render role chips for each role', async () => {
    setupComponent();
    usersServiceMock.getById.mockReturnValue(of(mockUser));

    const fixture = await createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    // Scope to role chips only (inside the Roles row)
    const rolesRow = fixture.nativeElement.querySelector('.info-row:nth-child(3)');
    const chips = rolesRow.querySelectorAll('mat-chip');
    expect(chips.length).toBe(2);

    const chipTexts = Array.from(chips as Element[]).map((c) => c.textContent?.trim());
    expect(chipTexts).toContain('TEACHER');
    expect(chipTexts).toContain('STUDENT');
  });

  it('should render createdAt date', async () => {
    setupComponent();
    usersServiceMock.getById.mockReturnValue(of(mockUser));

    const fixture = await createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    const content = fixture.nativeElement.textContent;
    expect(content).toContain('2026-06-01');
  });

  it('should show "User not found" on 404', async () => {
    setupComponent();
    usersServiceMock.getById.mockReturnValue(throwError(() => ({ status: 404 })));

    const fixture = await createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    const content = fixture.nativeElement.textContent;
    expect(content).toContain('User not found');
  });

  it('should show error with retry button on network failure', async () => {
    setupComponent();
    usersServiceMock.getById.mockReturnValue(throwError(() => ({ status: 0 })));

    const fixture = await createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    const errorEl = fixture.nativeElement.querySelector('.error-state');
    expect(errorEl).toBeTruthy();

    const retryButton = fixture.nativeElement.querySelector('.retry-btn');
    expect(retryButton).toBeTruthy();
  });

  it('should have a "Change Password" button', async () => {
    setupComponent();
    usersServiceMock.getById.mockReturnValue(of(mockUser));

    const fixture = await createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    const btn = fixture.nativeElement.querySelector('.change-password-btn');
    expect(btn).toBeTruthy();
  });

  it('should have a back button', async () => {
    setupComponent();
    usersServiceMock.getById.mockReturnValue(of(mockUser));

    const fixture = await createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    const backBtn = fixture.nativeElement.querySelector('.back-btn');
    expect(backBtn).toBeTruthy();
  });

  it('should embed memberships panel', async () => {
    setupComponent();
    usersServiceMock.getById.mockReturnValue(of(mockUser));

    const fixture = await createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    const panel = fixture.nativeElement.querySelector('app-memberships-panel');
    expect(panel).toBeTruthy();
  });
});
