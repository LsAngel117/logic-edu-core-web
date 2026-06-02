import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { of, throwError, Observable } from 'rxjs';
import { UsersService } from './services/users';
import { UserProfile } from './models/user-profile';
import { UsersPageComponent } from './users-page';

describe('UsersPageComponent', () => {
  let usersServiceMock: { getAll: ReturnType<typeof vi.fn> };

  function setupComponent() {
    usersServiceMock = { getAll: vi.fn() };
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [UsersPageComponent],
      providers: [
        provideRouter([]),
        provideAnimationsAsync(),
        { provide: UsersService, useValue: usersServiceMock },
      ],
    });
  }

  const mockUsers: UserProfile[] = [
    {
      id: 'u1',
      email: 'alice@logicedu.com',
      displayName: 'Alice',
      status: 'active',
      roles: ['teacher'],
      createdAt: '2026-01-01T00:00:00Z',
    },
    {
      id: 'u2',
      email: 'bob@logicedu.com',
      displayName: 'Bob',
      status: 'inactive',
      roles: ['student'],
      createdAt: '2026-02-01T00:00:00Z',
    },
  ];

  async function createFixture() {
    const fixture = await TestBed.createComponent(UsersPageComponent);
    fixture.detectChanges();
    return fixture;
  }

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render mat-spinner while loading', async () => {
    setupComponent();
    // Return an Observable that never emits to keep loading state
    usersServiceMock.getAll.mockReturnValue(new Observable());

    const fixture = await TestBed.createComponent(UsersPageComponent);
    fixture.detectChanges();

    const spinner = fixture.nativeElement.querySelector('mat-spinner');
    expect(spinner).toBeTruthy();
  });

  it('should render users in mat-table rows after loading', async () => {
    setupComponent();
    usersServiceMock.getAll.mockReturnValue(of(mockUsers));

    const fixture = await createFixture();

    // Advance past debounce and wait for Observable
    await fixture.whenStable();
    fixture.detectChanges();

    const rows = fixture.nativeElement.querySelectorAll('tr.mat-mdc-row');
    expect(rows.length).toBe(2);

    // Verify first row has user data
    const cells0 = rows[0].querySelectorAll('td');
    expect(cells0[0].textContent).toContain('Alice');
    expect(cells0[1].textContent).toContain('alice@logicedu.com');

    // Verify second row has user data
    const cells1 = rows[1].querySelectorAll('td');
    expect(cells1[0].textContent).toContain('Bob');
    expect(cells1[1].textContent).toContain('bob@logicedu.com');
  });

  it('should show "No users found" when list is empty', async () => {
    setupComponent();
    usersServiceMock.getAll.mockReturnValue(of([]));

    const fixture = await createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    const message = fixture.nativeElement.querySelector('.empty-state');
    expect(message).toBeTruthy();
    expect(message.textContent).toContain('No users found');
  });

  it('should show error message when loading fails', async () => {
    setupComponent();
    usersServiceMock.getAll.mockReturnValue(throwError(() => new Error('Network error')));

    const fixture = await createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    const error = fixture.nativeElement.querySelector('.error-state');
    expect(error).toBeTruthy();
    expect(error.textContent).toContain('Failed to load users');
  });

  it('should render green status chip for active users', async () => {
    setupComponent();
    usersServiceMock.getAll.mockReturnValue(of([mockUsers[0]]));

    const fixture = await createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    const chips = fixture.nativeElement.querySelectorAll('mat-chip');
    const activeChip = Array.from(chips as Element[]).find(
      (c) => c.textContent?.trim() === 'active'
    );
    expect(activeChip).toBeTruthy();
  });

  it('should render red status chip for inactive users', async () => {
    setupComponent();
    usersServiceMock.getAll.mockReturnValue(of([mockUsers[1]]));

    const fixture = await createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    const chips = fixture.nativeElement.querySelectorAll('mat-chip');
    const inactiveChip = Array.from(chips as Element[]).find(
      (c) => c.textContent?.trim() === 'inactive'
    );
    expect(inactiveChip).toBeTruthy();
  });

  it('should call service.getAll with search term after debounce', async () => {
    vi.useFakeTimers();
    setupComponent();
    usersServiceMock.getAll.mockReturnValue(of([]));

    const fixture = await createFixture();
    usersServiceMock.getAll.mockClear();

    const searchInput = fixture.nativeElement.querySelector('input[type="search"]');
    expect(searchInput).toBeTruthy();

    searchInput.value = 'alice';
    searchInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    // Advance debounce timer (300ms) — the callback runs synchronously
    vi.advanceTimersByTime(300);

    expect(usersServiceMock.getAll).toHaveBeenCalledWith('alice');

    vi.useRealTimers();
  });

  it('should hide spinner and show table after data loads', async () => {
    setupComponent();
    usersServiceMock.getAll.mockReturnValue(of(mockUsers));

    const fixture = await createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    const spinner = fixture.nativeElement.querySelector('mat-spinner');
    expect(spinner).toBeNull();

    const table = fixture.nativeElement.querySelector('table');
    expect(table).toBeTruthy();
  });

  it('should display roles as comma-separated text', async () => {
    setupComponent();
    const multiRoleUser: UserProfile = {
      ...mockUsers[0],
      roles: ['PLATFORM_ADMIN', 'TEACHER'],
    };
    usersServiceMock.getAll.mockReturnValue(of([multiRoleUser]));

    const fixture = await createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    const rolesCell = fixture.nativeElement.querySelectorAll('td')[3];
    expect(rolesCell.textContent).toContain('PLATFORM_ADMIN, TEACHER');
  });

  it('should render action buttons for each user row', async () => {
    setupComponent();
    usersServiceMock.getAll.mockReturnValue(of(mockUsers));

    const fixture = await createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    const rows = fixture.nativeElement.querySelectorAll('tr.mat-mdc-row');
    expect(rows.length).toBe(2);

    const rowElements = Array.from(rows as Element[]);
    for (const row of rowElements) {
      const buttons = row.querySelectorAll('button');
      expect(buttons.length).toBeGreaterThanOrEqual(1);
    }
  });
});
