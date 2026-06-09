import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { of, throwError, Observable } from 'rxjs';
import { UsersService } from './services/users';
import { UserProfile } from './models/user-profile';
import { UsersPageComponent } from './users-page';

describe('UsersPageComponent', () => {
  let usersServiceMock: { getAll: ReturnType<typeof vi.fn>; create: ReturnType<typeof vi.fn> };

  function setupComponent() {
    usersServiceMock = { getAll: vi.fn(), create: vi.fn() };
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
      role: 'PLATFORM_ADMIN',
      createdAt: '2026-01-01T00:00:00Z',
    },
    {
      id: 'u2',
      username: 'bob',
      email: 'bob@logicedu.com',
      fullName: 'Bob Smith',
      status: 'INACTIVE',
      role: 'TEACHER',
      createdAt: '2026-02-01T00:00:00Z',
    },
    {
      id: 'u3',
      username: 'carol',
      email: 'carol@logicedu.com',
      fullName: 'Carol Davis',
      status: 'ACTIVE',
      role: 'SCHOOL_ADMIN',
      createdAt: '2026-03-01T00:00:00Z',
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

  // --- Stat Cards ---

  it('should render 4 stat cards with correct values when users load', async () => {
    setupComponent();
    usersServiceMock.getAll.mockReturnValue(of(mockUsers));

    const fixture = await createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    const statCards = fixture.nativeElement.querySelectorAll('app-stat-card');
    expect(statCards.length).toBe(4);

    const cardTexts = Array.from(statCards as Element[]).map(
      (el) => el.textContent?.trim() ?? ''
    );

    expect(cardTexts.some((t) => t.includes('Total Usuarios'))).toBe(true);
    expect(cardTexts.some((t) => t.includes('3'))).toBe(true);
    expect(cardTexts.some((t) => t.includes('Usuarios Activos'))).toBe(true);
    expect(cardTexts.some((t) => t.includes('2'))).toBe(true);
    expect(cardTexts.some((t) => t.includes('Usuarios Inactivos'))).toBe(true);
    expect(cardTexts.some((t) => t.includes('1'))).toBe(true);
    expect(cardTexts.some((t) => t.includes('Administradores'))).toBe(true);
  });

  // --- Loading ---

  it('should show loading state while data is loading', async () => {
    setupComponent();
    usersServiceMock.getAll.mockReturnValue(new Observable());

    const fixture = await TestBed.createComponent(UsersPageComponent);
    fixture.detectChanges();

    const loadingEl = fixture.nativeElement.querySelector('[data-testid="users-loading"]');
    expect(loadingEl).toBeTruthy();
  });

  // --- Error ---

  it('should show error state when loading fails', async () => {
    setupComponent();
    usersServiceMock.getAll.mockReturnValue(throwError(() => new Error('Network error')));

    const fixture = await createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    const errorEl = fixture.nativeElement.querySelector('[data-testid="users-error"]');
    expect(errorEl).toBeTruthy();
    expect(errorEl.textContent).toContain('Error al cargar usuarios');
  });

  it('should have a retry button in error state', async () => {
    setupComponent();
    usersServiceMock.getAll.mockReturnValue(throwError(() => new Error('Network error')));

    const fixture = await createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    const retryBtn = fixture.nativeElement.querySelector('[data-testid="users-retry"]');
    expect(retryBtn).toBeTruthy();
  });

  // --- Empty State ---

  it('should show empty state when no users exist', async () => {
    setupComponent();
    usersServiceMock.getAll.mockReturnValue(of([]));

    const fixture = await createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    const emptyEl = fixture.nativeElement.querySelector('[data-testid="empty-state-title"]');
    expect(emptyEl).toBeTruthy();
    expect(emptyEl.textContent).toContain('No hay usuarios registrados');
  });

  // --- Filters inside table card (Fix 4) ---

  it('should render filters inside table card toolbar', async () => {
    setupComponent();
    usersServiceMock.getAll.mockReturnValue(of(mockUsers));

    const fixture = await createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    // Filters are now inside the table card toolbar, not a separate card
    const tableCard = fixture.nativeElement.querySelector('.table-card');
    expect(tableCard).toBeTruthy();

    const roleSelect = tableCard.querySelector('[data-testid="role-filter"]');
    expect(roleSelect).toBeTruthy();

    const statusSelect = tableCard.querySelector('[data-testid="status-filter"]');
    expect(statusSelect).toBeTruthy();

    const searchInput = tableCard.querySelector('[data-testid="users-search"]');
    expect(searchInput).toBeTruthy();

    // The separate filters-card should NOT exist
    const filtersCard = fixture.nativeElement.querySelector('[data-testid="filters-card"]');
    expect(filtersCard).toBeNull();
  });

  // --- Table ---

  it('should render users table with avatar initials, name, email, role badge, and status badge', async () => {
    setupComponent();
    usersServiceMock.getAll.mockReturnValue(of(mockUsers));

    const fixture = await createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    const rows = fixture.nativeElement.querySelectorAll('[data-testid="user-row"]');
    expect(rows.length).toBe(3);

    // First row: Alice - platform admin, active
    const firstRow = rows[0];
    expect(firstRow.textContent).toContain('Alice Johnson');
    expect(firstRow.textContent).toContain('alice@logicedu.com');

    // Avatar initials
    const avatar = firstRow.querySelector('[data-testid="user-avatar"]');
    expect(avatar).toBeTruthy();
    expect(avatar.textContent?.trim()).toBe('AJ');

    // Role badge
    const roleBadge = firstRow.querySelector('[data-testid="role-badge"]');
    expect(roleBadge).toBeTruthy();
    expect(roleBadge.textContent?.trim()).toBe('PLATFORM_ADMIN');

    // Status badge
    const statusBadge = firstRow.querySelector('[data-testid="status-badge"]');
    expect(statusBadge).toBeTruthy();
    expect(statusBadge.textContent?.trim()).toBe('ACTIVE');
  });

  it('should render action buttons for each row', async () => {
    setupComponent();
    usersServiceMock.getAll.mockReturnValue(of(mockUsers));

    const fixture = await createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    const rows = fixture.nativeElement.querySelectorAll('[data-testid="user-row"]');
    for (const row of Array.from(rows as Element[])) {
      const actions = row.querySelectorAll('[data-testid="action-btn"]');
      expect(actions.length).toBeGreaterThanOrEqual(2);
    }
  });

  // --- Role-based status colors ---

  it('should show INACTIVE status correctly', async () => {
    setupComponent();
    usersServiceMock.getAll.mockReturnValue(of([mockUsers[1]])); // Bob INACTIVE

    const fixture = await createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    const statusBadge = fixture.nativeElement.querySelector('[data-testid="status-badge"]');
    expect(statusBadge).toBeTruthy();
    expect(statusBadge.textContent?.trim()).toBe('INACTIVE');
  });

  // --- Role fallback (Fix 5) ---

  it('should display "Sin rol" when role is undefined', async () => {
    setupComponent();
    const userNoRole: UserProfile = {
      id: 'u4',
      username: 'dave',
      email: 'dave@logicedu.com',
      fullName: 'Dave NoRole',
      status: 'ACTIVE',
      role: undefined,
      createdAt: '2026-04-01T00:00:00Z',
    };
    usersServiceMock.getAll.mockReturnValue(of([userNoRole]));

    const fixture = await createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    const roleBadge = fixture.nativeElement.querySelector('[data-testid="role-badge"]');
    expect(roleBadge).toBeTruthy();
    expect(roleBadge.textContent?.trim()).toContain('Sin rol');
  });

  it('should return gray color for undefined role', () => {
    setupComponent();
    usersServiceMock.getAll.mockReturnValue(of(mockUsers));

    const fixture = TestBed.createComponent(UsersPageComponent);
    const component = fixture.componentInstance;
    expect(component.roleColor(undefined)).toBe('#6B7280');
  });

  // --- Search (Fix 2: type="text" still works) ---

  it('should filter users via search input', async () => {
    setupComponent();
    usersServiceMock.getAll.mockReturnValue(of(mockUsers));

    const fixture = await createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    const searchInput = fixture.nativeElement.querySelector('[data-testid="users-search"]');
    expect(searchInput).toBeTruthy();

    searchInput.value = 'Alice';
    searchInput.dispatchEvent(new Event('input'));
    // Wait for debounce (200ms)
    await new Promise((r) => setTimeout(r, 250));
    fixture.detectChanges();

    const rows = fixture.nativeElement.querySelectorAll('[data-testid="user-row"]');
    expect(rows.length).toBe(1);
    expect(rows[0].textContent).toContain('Alice Johnson');
  });

  // --- Page Header ---

  it('should render page header with title', async () => {
    setupComponent();
    usersServiceMock.getAll.mockReturnValue(of(mockUsers));

    const fixture = await createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    const header = fixture.nativeElement.querySelector('app-page-header h1');
    expect(header).toBeTruthy();
    expect(header.textContent).toContain('Usuarios');
  });

  // --- Create Dialog (uses standalone CreateUserDialogComponent) ---

  it('should render app-create-user component', async () => {
    setupComponent();
    usersServiceMock.getAll.mockReturnValue(of(mockUsers));

    const fixture = await createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    const createUserEl = fixture.nativeElement.querySelector('app-create-user');
    expect(createUserEl).toBeTruthy();
  });

  // --- Pagination (Fix 3) ---

  it('should render pagination controls below table', async () => {
    setupComponent();
    // Create 15 users to trigger pagination (pageSize default is 10)
    const manyUsers: UserProfile[] = Array.from({ length: 15 }, (_, i) => ({
      id: `u${i}`,
      username: `user${i}`,
      email: `user${i}@logicedu.com`,
      fullName: `User ${i}`,
      status: 'ACTIVE' as const,
      role: 'STUDENT',
      createdAt: '2026-01-01T00:00:00Z',
    }));
    usersServiceMock.getAll.mockReturnValue(of(manyUsers));

    const fixture = await createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    const pagination = fixture.nativeElement.querySelector('[data-testid="pagination-controls"]');
    expect(pagination).toBeTruthy();

    // Should show page info
    expect(pagination.textContent).toContain('Mostrando');
    expect(pagination.textContent).toContain('10');
    expect(pagination.textContent).toContain('15');

    // Should have prev/next buttons
    const prevBtn = pagination.querySelector('[data-testid="pagination-prev"]');
    const nextBtn = pagination.querySelector('[data-testid="pagination-next"]');
    expect(prevBtn).toBeTruthy();
    expect(nextBtn).toBeTruthy();
  });

  it('should render records-per-page selector in toolbar', async () => {
    setupComponent();
    usersServiceMock.getAll.mockReturnValue(of(mockUsers));

    const fixture = await createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    const pageSizeSelect = fixture.nativeElement.querySelector('[data-testid="page-size-select"]');
    expect(pageSizeSelect).toBeTruthy();
  });

  it('should disable prev button on first page', async () => {
    setupComponent();
    const manyUsers: UserProfile[] = Array.from({ length: 15 }, (_, i) => ({
      id: `u${i}`,
      username: `user${i}`,
      email: `user${i}@logicedu.com`,
      fullName: `User ${i}`,
      status: 'ACTIVE' as const,
      role: 'STUDENT',
      createdAt: '2026-01-01T00:00:00Z',
    }));
    usersServiceMock.getAll.mockReturnValue(of(manyUsers));

    const fixture = await createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    const prevBtn = fixture.nativeElement.querySelector('[data-testid="pagination-prev"]');
    expect(prevBtn.disabled).toBe(true);
  });
});
