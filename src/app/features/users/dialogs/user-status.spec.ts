import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { signal, computed } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { of } from 'rxjs';
import { AuthService } from '../../../core/services/auth';
import { User } from '../../../core/models/user';
import { UsersService } from '../services/users';
import { UserProfile } from '../models/user-profile';
import { UserStatusDialogComponent } from './user-status';

describe('UserStatusDialogComponent', () => {
  let usersServiceMock: { updateStatus: ReturnType<typeof vi.fn> };
  let dialogRefMock: { close: ReturnType<typeof vi.fn> };
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

  const activeUser: UserProfile = {
    id: 'u1',
    email: 'alice@logicedu.com',
    displayName: 'Alice',
    status: 'active',
    roles: ['teacher'],
    createdAt: '2026-01-01T00:00:00Z',
  };

  const inactiveUser: UserProfile = {
    id: 'u2',
    email: 'bob@logicedu.com',
    displayName: 'Bob',
    status: 'inactive',
    roles: ['student'],
    createdAt: '2026-02-01T00:00:00Z',
  };

  function setupComponent(dialogData: UserProfile = activeUser, authUser: User | null = null) {
    usersServiceMock = { updateStatus: vi.fn() };
    dialogRefMock = { close: vi.fn() };
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
        { provide: MatDialogRef, useValue: dialogRefMock },
        { provide: MAT_DIALOG_DATA, useValue: dialogData },
        { provide: AuthService, useValue: authServiceMock },
      ],
    });
  }

  async function createFixture() {
    const fixture = await TestBed.createComponent(UserStatusDialogComponent);
    fixture.detectChanges();
    return fixture;
  }

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should display current user status', async () => {
    setupComponent(activeUser);
    const fixture = await createFixture();

    const content = fixture.nativeElement.textContent;
    expect(content).toContain('active');
    expect(content).toContain('Alice');
  });

  it('should show inactive status when user is inactive', async () => {
    setupComponent(inactiveUser);
    const fixture = await createFixture();

    const content = fixture.nativeElement.textContent;
    expect(content).toContain('inactive');
    expect(content).toContain('Bob');
  });

  it('should call updateStatus with toggled value on confirm', async () => {
    setupComponent(activeUser);
    const updatedUser: UserProfile = { ...activeUser, status: 'inactive' };
    usersServiceMock.updateStatus.mockReturnValue(of(updatedUser));
    const fixture = await createFixture();

    const confirmButton = fixture.nativeElement.querySelector('button[color="primary"]');
    expect(confirmButton).toBeTruthy();
    confirmButton.click();

    await fixture.whenStable();

    expect(usersServiceMock.updateStatus).toHaveBeenCalledWith('u1', { status: 'inactive' });
    expect(dialogRefMock.close).toHaveBeenCalledWith(updatedUser);
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
    expect(usersServiceMock.updateStatus).not.toHaveBeenCalled();
  });

  it('should disable toggle and show message when editing own status', async () => {
    const selfUser: UserProfile = {
      id: 'auth1',
      email: 'admin@logicedu.com',
      displayName: 'Admin',
      status: 'active',
      roles: ['PLATFORM_ADMIN'],
      createdAt: '2026-01-01T00:00:00Z',
    };
    setupComponent(selfUser, mockAuthUser);
    const fixture = await createFixture();
    fixture.detectChanges();

    // Check that self-disable is detected
    expect(fixture.componentInstance.isSelf()).toBe(true);

    const message = fixture.nativeElement.querySelector('.self-disable-message');
    expect(message).toBeTruthy();
    expect(message.textContent).toContain('Cannot change your own status');
  });
});
