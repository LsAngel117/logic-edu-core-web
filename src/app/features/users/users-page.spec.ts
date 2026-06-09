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

  // --- Filters Card ---

  it('should render filters card with role select, status select, and search input', async () => {
    setupComponent();
    usersServiceMock.getAll.mockReturnValue(of(mockUsers));

    const fixture = await createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    const filtersCard = fixture.nativeElement.querySelector('[data-testid="filters-card"]');
    expect(filtersCard).toBeTruthy();

    const roleSelect = filtersCard.querySelector('[data-testid="role-filter"]');
    expect(roleSelect).toBeTruthy();

    const statusSelect = filtersCard.querySelector('[data-testid="status-filter"]');
    expect(statusSelect).toBeTruthy();

    const searchInput = filtersCard.querySelector('[data-testid="users-search"]');
    expect(searchInput).toBeTruthy();
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

  // --- Page Header ---

  it('should render page header with title and action button', async () => {
    setupComponent();
    usersServiceMock.getAll.mockReturnValue(of(mockUsers));

    const fixture = await createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    const header = fixture.nativeElement.querySelector('app-page-header h1');
    expect(header).toBeTruthy();
    expect(header.textContent).toContain('Usuarios');

    const addBtn = fixture.nativeElement.querySelector('[data-testid="create-user-btn-header"]');
    expect(addBtn).toBeTruthy();
  });

  // --- Create Dialog ---

  it('should open create dialog when Nuevo Usuario is clicked', async () => {
    setupComponent();
    usersServiceMock.getAll.mockReturnValue(of(mockUsers));

    const fixture = await createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    const addBtn = fixture.nativeElement.querySelector('[data-testid="create-user-btn-header"]');
    expect(addBtn).toBeTruthy();
    addBtn.click();
    fixture.detectChanges();

    const dialog = fixture.nativeElement.querySelector('[data-testid="app-dialog-overlay"]');
    expect(dialog).toBeTruthy();
  });

  it('should close create dialog when cancel is clicked', async () => {
    setupComponent();
    usersServiceMock.getAll.mockReturnValue(of(mockUsers));

    const fixture = await createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    // Open dialog
    const addBtn = fixture.nativeElement.querySelector('[data-testid="create-user-btn-header"]');
    addBtn.click();
    fixture.detectChanges();

    // Close via cancel button
    const cancelBtn = fixture.nativeElement.querySelector('[data-testid="app-dialog-cancel"]');
    expect(cancelBtn).toBeTruthy();
    cancelBtn.click();
    fixture.detectChanges();

    const dialog = fixture.nativeElement.querySelector('[data-testid="app-dialog-overlay"]');
    expect(dialog).toBeNull();
  });

  // --- Search ---

  it('should filter users via search input in header', async () => {
    setupComponent();
    usersServiceMock.getAll.mockReturnValue(of(mockUsers));

    const fixture = await createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    const searchInput = fixture.nativeElement.querySelector('[data-testid="users-search"]');
    expect(searchInput).toBeTruthy();

    searchInput.value = 'Alice';
    searchInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const rows = fixture.nativeElement.querySelectorAll('[data-testid="user-row"]');
    expect(rows.length).toBe(1);
    expect(rows[0].textContent).toContain('Alice Johnson');
  });
});
