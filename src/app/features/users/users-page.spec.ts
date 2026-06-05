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
      username: 'alice',
      email: 'alice@logicedu.com',
      fullName: 'Alice Johnson',
      status: 'ACTIVE',
      createdAt: '2026-01-01T00:00:00Z',
    },
    {
      id: 'u2',
      username: 'bob',
      email: 'bob@logicedu.com',
      fullName: 'Bob Smith',
      status: 'INACTIVE',
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

  it('should render loading spinner while loading', async () => {
    setupComponent();
    usersServiceMock.getAll.mockReturnValue(new Observable());

    const fixture = await TestBed.createComponent(UsersPageComponent);
    fixture.detectChanges();

    const loadingEl = fixture.nativeElement.querySelector('[data-testid="data-table-loading"]');
    expect(loadingEl).toBeTruthy();
  });

  it('should render users in data-table rows after loading', async () => {
    setupComponent();
    usersServiceMock.getAll.mockReturnValue(of(mockUsers));

    const fixture = await createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    const rows = fixture.nativeElement.querySelectorAll('table tbody tr');
    expect(rows.length).toBe(2);

    const cells0 = rows[0].querySelectorAll('td');
    expect(cells0[0].textContent).toContain('Alice Johnson');
    expect(cells0[1].textContent).toContain('alice@logicedu.com');

    const cells1 = rows[1].querySelectorAll('td');
    expect(cells1[0].textContent).toContain('Bob Smith');
    expect(cells1[1].textContent).toContain('bob@logicedu.com');
  });

  it('should show empty state when list is empty', async () => {
    setupComponent();
    usersServiceMock.getAll.mockReturnValue(of([]));

    const fixture = await createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    const title = fixture.nativeElement.querySelector('[data-testid="empty-state-title"]');
    expect(title).toBeTruthy();
    expect(title.textContent).toContain('No hay usuarios');
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

  it('should render active status in table', async () => {
    setupComponent();
    usersServiceMock.getAll.mockReturnValue(of([mockUsers[0]]));

    const fixture = await createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    const statusSpans = fixture.nativeElement.querySelectorAll('.data-table__status');
    const activeSpan = Array.from(statusSpans as Element[]).find(
      (c) => c.textContent?.trim() === 'ACTIVE'
    );
    expect(activeSpan).toBeTruthy();
  });

  it('should render inactive status in table', async () => {
    setupComponent();
    usersServiceMock.getAll.mockReturnValue(of([mockUsers[1]]));

    const fixture = await createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    const statusSpans = fixture.nativeElement.querySelectorAll('.data-table__status');
    const inactiveSpan = Array.from(statusSpans as Element[]).find(
      (c) => c.textContent?.trim() === 'INACTIVE'
    );
    expect(inactiveSpan).toBeTruthy();
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

    vi.advanceTimersByTime(300);

    expect(usersServiceMock.getAll).toHaveBeenCalledWith('alice');

    vi.useRealTimers();
  });

  it('should hide loading and show table after data loads', async () => {
    setupComponent();
    usersServiceMock.getAll.mockReturnValue(of(mockUsers));

    const fixture = await createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    const loadingEl = fixture.nativeElement.querySelector('[data-testid="data-table-loading"]');
    expect(loadingEl).toBeNull();

    const table = fixture.nativeElement.querySelector('table');
    expect(table).toBeTruthy();
  });

  it('should render action buttons for each user row', async () => {
    setupComponent();
    usersServiceMock.getAll.mockReturnValue(of(mockUsers));

    const fixture = await createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    const rows = fixture.nativeElement.querySelectorAll('table tbody tr');
    expect(rows.length).toBe(2);

    const rowElements = Array.from(rows as Element[]);
    for (const row of rowElements) {
      const buttons = row.querySelectorAll('[data-testid="action-btn"]');
      expect(buttons.length).toBeGreaterThanOrEqual(1);
    }
  });

  it('should render page header with title', async () => {
    setupComponent();
    usersServiceMock.getAll.mockReturnValue(of([]));

    const fixture = await createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    const header = fixture.nativeElement.querySelector('app-page-header h1');
    expect(header).toBeTruthy();
    expect(header.textContent).toContain('Usuarios');
  });
});
