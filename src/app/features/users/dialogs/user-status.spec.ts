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
  let usersServiceMock: { changeStatus: ReturnType<typeof vi.fn> };
  let dialogRefMock: { close: ReturnType<typeof vi.fn> };
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

  function setupComponent(dialogData: UserProfile = activeUser, authUser: User | null = null) {
    usersServiceMock = { changeStatus: vi.fn() };
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
    expect(content).toContain('ACTIVE');
    expect(content).toContain('Alice Johnson');
  });

  it('should show inactive status when user is inactive', async () => {
    setupComponent(inactiveUser);
    const fixture = await createFixture();

    const content = fixture.nativeElement.textContent;
    expect(content).toContain('INACTIVE');
    expect(content).toContain('Bob Smith');
  });

  it('should call changeStatus with toggled value on confirm', async () => {
    setupComponent(activeUser);
    const updatedUser: UserProfile = { ...activeUser, status: 'INACTIVE' };
    usersServiceMock.changeStatus.mockReturnValue(of(updatedUser));
    const fixture = await createFixture();

    const confirmButton = fixture.nativeElement.querySelector('button[color="primary"]');
    expect(confirmButton).toBeTruthy();
    confirmButton.click();

    await fixture.whenStable();

    expect(usersServiceMock.changeStatus).toHaveBeenCalledWith('u1', { status: 'INACTIVE' });
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
    expect(usersServiceMock.changeStatus).not.toHaveBeenCalled();
  });

  it('should disable toggle and show message when editing own status', async () => {
    const selfUser: UserProfile = {
      id: 'auth1',
      username: 'admin',
      email: 'admin@logicedu.com',
      fullName: 'Admin',
      status: 'ACTIVE',
      createdAt: '2026-01-01T00:00:00Z',
    };
    setupComponent(selfUser, mockAuthUser);
    const fixture = await createFixture();
    fixture.detectChanges();

    expect(fixture.componentInstance.isSelf()).toBe(true);

    const message = fixture.nativeElement.querySelector('.self-disable-message');
    expect(message).toBeTruthy();
    expect(message.textContent).toContain('Cannot change your own status');
  });
});
