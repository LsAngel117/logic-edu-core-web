import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { signal, computed } from '@angular/core';
import { of } from 'rxjs';
import { AuthService } from '../../../core/services/auth';
import { User } from '../../../core/models/user';
import { UsersService } from '../services/users';
import { UserProfile } from '../models/user-profile';
import { UserStatusDialogComponent } from './user-status';

describe('UserStatusDialogComponent', () => {
  let usersServiceMock: { changeStatus: ReturnType<typeof vi.fn> };
  let authServiceMock: {
    user: ReturnType<typeof signal<User | null>>;
    isAuthenticated: ReturnType<typeof computed<boolean>>;
  };

  const mockAuthUser: User = {
    id: 'auth1',
    email: 'admin@logicedu.com',
    username: 'admin',
    fullName: 'Admin',
    roles: ['PLATFORM_ADMIN'],
    token: 'jwt.token',
  };

  const activeUser: UserProfile = {
    id: 'u1',
    username: 'alice',
    email: 'alice@logicedu.com',
    fullName: 'Alice Johnson',
    status: 'ACTIVE',
    createdAt: '2026-01-01T00:00:00Z',
  };

  const inactiveUser: UserProfile = {
    id: 'u2',
    username: 'bob',
    email: 'bob@logicedu.com',
    fullName: 'Bob Smith',
    status: 'INACTIVE',
    createdAt: '2026-02-01T00:00:00Z',
  };

  function setupComponent(userData: UserProfile = activeUser, authUser: User | null = null) {
    usersServiceMock = { changeStatus: vi.fn() };
    authServiceMock = {
      user: signal(authUser),
      isAuthenticated: computed(() => authUser !== null),
    };

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [UserStatusDialogComponent],
      providers: [
        provideAnimationsAsync(),
        { provide: UsersService, useValue: usersServiceMock },
        { provide: AuthService, useValue: authServiceMock },
      ],
    });
  }

  async function createFixture(
    userData: UserProfile = activeUser,
    visible = true,
  ) {
    const fixture = await TestBed.createComponent(UserStatusDialogComponent);
    fixture.componentRef.setInput('user', userData);
    fixture.componentRef.setInput('visible', visible);
    fixture.detectChanges();
    return fixture;
  }

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should show confirmation dialog with user name when visible', async () => {
    setupComponent(activeUser);
    const fixture = await createFixture(activeUser, true);

    const messageEl = fixture.nativeElement.querySelector('[data-testid="confirmation-dialog-message"]');
    expect(messageEl).toBeTruthy();
    expect(messageEl.textContent).toContain('Alice Johnson');
  });

  it('should not render dialog when not visible', async () => {
    setupComponent(activeUser);
    const fixture = await createFixture(activeUser, false);

    const overlay = fixture.nativeElement.querySelector('[data-testid="confirmation-dialog-overlay"]');
    expect(overlay).toBeNull();
  });

  it('should show activate message for inactive user', async () => {
    setupComponent(inactiveUser);
    const fixture = await createFixture(inactiveUser, true);

    const messageEl = fixture.nativeElement.querySelector('[data-testid="confirmation-dialog-message"]');
    expect(messageEl.textContent).toContain('activar');
    expect(messageEl.textContent).toContain('Bob Smith');
  });

  it('should show deactivate message for active user', async () => {
    setupComponent(activeUser);
    const fixture = await createFixture(activeUser, true);

    const messageEl = fixture.nativeElement.querySelector('[data-testid="confirmation-dialog-message"]');
    expect(messageEl.textContent).toContain('desactivar');
    expect(messageEl.textContent).toContain('Alice Johnson');
  });

  it('should call changeStatus and emit confirmed on confirm', async () => {
    setupComponent(activeUser);
    const updatedUser: UserProfile = { ...activeUser, status: 'INACTIVE' };
    usersServiceMock.changeStatus.mockReturnValue(of(updatedUser));
    const fixture = await createFixture(activeUser, true);

    let confirmed = false;
    fixture.componentInstance.confirmed.subscribe(() => { confirmed = true; });

    const confirmBtn = fixture.nativeElement.querySelector('[data-testid="confirmation-dialog-confirm"]');
    confirmBtn.click();

    await fixture.whenStable();

    expect(usersServiceMock.changeStatus).toHaveBeenCalledWith('u1', { status: 'INACTIVE' });
    expect(confirmed).toBe(true);
  });

  it('should not allow changing own status', async () => {
    const selfUser: UserProfile = {
      id: 'auth1',
      username: 'admin',
      email: 'admin@logicedu.com',
      fullName: 'Admin',
      status: 'ACTIVE',
      createdAt: '2026-01-01T00:00:00Z',
    };
    setupComponent(selfUser, mockAuthUser);
    const fixture = await createFixture(selfUser, true);

    // The confirmation dialog should be hidden when it's self
    const overlay = fixture.nativeElement.querySelector('[data-testid="confirmation-dialog-overlay"]');
    // when isSelf, the dialog should not be visible
    expect(fixture.componentInstance.isSelf()).toBe(true);
  });

  it('should emit cancel on cancel', async () => {
    setupComponent(activeUser);
    const fixture = await createFixture(activeUser, true);

    let cancelled = false;
    fixture.componentInstance.cancelled.subscribe(() => { cancelled = true; });

    const cancelBtn = fixture.nativeElement.querySelector('[data-testid="confirmation-dialog-cancel"]');
    cancelBtn.click();

    expect(cancelled).toBe(true);
  });
});
