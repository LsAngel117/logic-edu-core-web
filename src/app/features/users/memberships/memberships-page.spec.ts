import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { of, throwError, Observable } from 'rxjs';
import { MembershipsPageComponent } from './memberships-page';
import { UsersService } from '../services/users';
import { MembershipsService } from './services/memberships';

describe('MembershipsPageComponent', () => {
  let usersServiceMock: { getAll: ReturnType<typeof vi.fn> };
  let membershipsServiceMock: {
    getByUser: ReturnType<typeof vi.fn>;
  };

  function setupComponent() {
    usersServiceMock = { getAll: vi.fn() };
    membershipsServiceMock = { getByUser: vi.fn() };

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [MembershipsPageComponent],
      providers: [
        provideRouter([]),
        provideAnimationsAsync(),
        { provide: UsersService, useValue: usersServiceMock },
        { provide: MembershipsService, useValue: membershipsServiceMock },
      ],
    });
  }

  async function createFixture() {
    const fixture = await TestBed.createComponent(MembershipsPageComponent);
    fixture.detectChanges();
    return fixture;
  }

  const mockUsers = [
    {
      id: 'u1',
      username: 'alice',
      email: 'alice@logicedu.com',
      fullName: 'Alice Johnson',
      status: 'ACTIVE' as const,
      role: 'PLATFORM_ADMIN',
      createdAt: '2026-01-01T00:00:00Z',
    },
    {
      id: 'u2',
      username: 'bob',
      email: 'bob@logicedu.com',
      fullName: 'Bob Smith',
      status: 'ACTIVE' as const,
      role: 'TEACHER',
      createdAt: '2026-02-01T00:00:00Z',
    },
    {
      id: 'u3',
      username: 'carol',
      email: 'carol@logicedu.com',
      fullName: 'Carol Davis',
      status: 'INACTIVE' as const,
      role: 'SCHOOL_ADMIN',
      createdAt: '2026-03-01T00:00:00Z',
    },
  ];

  const mockMembershipsByUser = (userId: string) => {
    const map: Record<string, any[]> = {
      u1: [{ id: 'm1', userId: 'u1', role: 'PLATFORM_ADMIN', scopeType: 'PLATFORM', scopeRefId: '', active: true }],
      u2: [{ id: 'm2', userId: 'u2', role: 'TEACHER', scopeType: 'COURSE', scopeRefId: 'g1', active: true }],
      u3: [{ id: 'm3', userId: 'u3', role: 'SCHOOL_ADMIN', scopeType: 'SCHOOL', scopeRefId: 's1', active: false }],
    };
    return map[userId] || [];
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // --- Loading State ---
  it('should show loading state while data is loading', async () => {
    setupComponent();
    usersServiceMock.getAll.mockReturnValue(new Observable());

    const fixture = await TestBed.createComponent(MembershipsPageComponent);
    fixture.detectChanges();

    const loadingEl = fixture.nativeElement.querySelector('[data-testid="memberships-loading"]');
    expect(loadingEl).toBeTruthy();
  });

  // --- Error State ---
  it('should show error state when loading fails', async () => {
    setupComponent();
    usersServiceMock.getAll.mockReturnValue(throwError(() => new Error('Network error')));

    const fixture = await createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    const errorEl = fixture.nativeElement.querySelector('[data-testid="memberships-error"]');
    expect(errorEl).toBeTruthy();
    expect(errorEl.textContent).toContain('Error al cargar membresías');
  });

  it('should have a retry button in error state', async () => {
    setupComponent();
    usersServiceMock.getAll.mockReturnValue(throwError(() => new Error('Network error')));

    const fixture = await createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    const retryBtn = fixture.nativeElement.querySelector('[data-testid="memberships-retry"]');
    expect(retryBtn).toBeTruthy();
  });

  // --- Empty State ---
  it('should show empty state when no memberships exist', async () => {
    setupComponent();
    usersServiceMock.getAll.mockReturnValue(of([]));
    membershipsServiceMock.getByUser.mockReturnValue(of([]));

    const fixture = await createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    const emptyEl = fixture.nativeElement.querySelector('[data-testid="empty-state-title"]');
    expect(emptyEl).toBeTruthy();
    expect(emptyEl.textContent).toContain('No hay membresías registradas');
  });

  // --- Stat Cards ---
  it('should render 3 stat cards with correct values when data loads', async () => {
    setupComponent();
    usersServiceMock.getAll.mockReturnValue(of(mockUsers));
    for (const u of mockUsers) {
      membershipsServiceMock.getByUser.mockReturnValueOnce(of(mockMembershipsByUser(u.id)));
    }

    const fixture = await createFixture();
    await fixture.whenStable();
    await new Promise((r) => setTimeout(r, 100));
    fixture.detectChanges();

    const statCards = fixture.nativeElement.querySelectorAll('app-stat-card');
    expect(statCards.length).toBe(3);

    const cardTexts = Array.from(statCards as Element[]).map((el) => el.textContent?.trim() ?? '');
    expect(cardTexts.some((t) => t.includes('Total Membresías'))).toBe(true);
    expect(cardTexts.some((t) => t.includes('3'))).toBe(true);
    expect(cardTexts.some((t) => t.includes('Activas'))).toBe(true);
    expect(cardTexts.some((t) => t.includes('2'))).toBe(true);
    expect(cardTexts.some((t) => t.includes('Inactivas'))).toBe(true);
    expect(cardTexts.some((t) => t.includes('1'))).toBe(true);
  });

  // --- Filters in Table Card ---
  it('should render filters inside table card toolbar', async () => {
    setupComponent();
    usersServiceMock.getAll.mockReturnValue(of(mockUsers));
    for (const u of mockUsers) {
      membershipsServiceMock.getByUser.mockReturnValueOnce(of(mockMembershipsByUser(u.id)));
    }

    const fixture = await createFixture();
    await fixture.whenStable();
    await new Promise((r) => setTimeout(r, 100));
    fixture.detectChanges();

    const tableCard = fixture.nativeElement.querySelector('.table-card');
    expect(tableCard).toBeTruthy();

    const roleFilter = tableCard.querySelector('[data-testid="membership-role-filter"]');
    expect(roleFilter).toBeTruthy();

    const statusFilter = tableCard.querySelector('[data-testid="membership-status-filter"]');
    expect(statusFilter).toBeTruthy();

    const searchInput = tableCard.querySelector('[data-testid="memberships-search"]');
    expect(searchInput).toBeTruthy();
  });

  // --- Table Rows ---
  it('should render membership rows with user name, email, role badge, scope badge, and status badge', async () => {
    setupComponent();
    usersServiceMock.getAll.mockReturnValue(of(mockUsers));
    for (const u of mockUsers) {
      membershipsServiceMock.getByUser.mockReturnValueOnce(of(mockMembershipsByUser(u.id)));
    }

    const fixture = await createFixture();
    await fixture.whenStable();
    await new Promise((r) => setTimeout(r, 100));
    fixture.detectChanges();

    const rows = fixture.nativeElement.querySelectorAll('[data-testid="membership-row"]');
    expect(rows.length).toBe(3);

    const firstRow = rows[0];
    expect(firstRow.textContent).toContain('Alice Johnson');
    expect(firstRow.textContent).toContain('alice@logicedu.com');

    const roleBadge = firstRow.querySelector('[data-testid="role-badge"]');
    expect(roleBadge).toBeTruthy();

    const scopeBadge = firstRow.querySelector('[data-testid="scope-badge"]');
    expect(scopeBadge).toBeTruthy();

    const statusBadge = firstRow.querySelector('[data-testid="status-badge"]');
    expect(statusBadge).toBeTruthy();
  });

  // --- Action Buttons ---
  it('should render action buttons for each row', async () => {
    setupComponent();
    usersServiceMock.getAll.mockReturnValue(of(mockUsers));
    for (const u of mockUsers) {
      membershipsServiceMock.getByUser.mockReturnValueOnce(of(mockMembershipsByUser(u.id)));
    }

    const fixture = await createFixture();
    await fixture.whenStable();
    await new Promise((r) => setTimeout(r, 100));
    fixture.detectChanges();

    const rows = fixture.nativeElement.querySelectorAll('[data-testid="membership-row"]');
    for (const row of Array.from(rows as Element[])) {
      const actions = row.querySelectorAll('[data-testid="action-btn"]');
      expect(actions.length).toBeGreaterThanOrEqual(2);
    }
  });

  // --- Pagination ---
  it('should render pagination controls with correct info', async () => {
    setupComponent();
    const manyUsers = Array.from({ length: 15 }, (_, i) => ({
      id: `u${i}`,
      username: `user${i}`,
      email: `user${i}@logicedu.com`,
      fullName: `User ${i}`,
      status: 'ACTIVE' as const,
      role: 'STUDENT',
      createdAt: '2026-01-01T00:00:00Z',
    }));
    usersServiceMock.getAll.mockReturnValue(of(manyUsers));
    for (const u of manyUsers) {
      membershipsServiceMock.getByUser.mockReturnValueOnce(
        of([{ id: `m${u.id}`, userId: u.id, role: u.role, scopeType: 'COURSE', scopeRefId: 'g1', active: true }]),
      );
    }

    const fixture = await createFixture();
    await fixture.whenStable();
    await new Promise((r) => setTimeout(r, 100));
    fixture.detectChanges();

    const pagination = fixture.nativeElement.querySelector('[data-testid="pagination-controls"]');
    expect(pagination).toBeTruthy();
    expect(pagination.textContent).toContain('Mostrando');
    expect(pagination.textContent).toContain('10');
    expect(pagination.textContent).toContain('15');
  });

  it('should render records-per-page selector in toolbar', async () => {
    setupComponent();
    usersServiceMock.getAll.mockReturnValue(of(mockUsers));
    for (const u of mockUsers) {
      membershipsServiceMock.getByUser.mockReturnValueOnce(of(mockMembershipsByUser(u.id)));
    }

    const fixture = await createFixture();
    await fixture.whenStable();
    await new Promise((r) => setTimeout(r, 100));
    fixture.detectChanges();

    const pageSizeSelect = fixture.nativeElement.querySelector('[data-testid="page-size-select"]');
    expect(pageSizeSelect).toBeTruthy();
  });

  it('should disable prev button on first page', async () => {
    setupComponent();
    const manyUsers = Array.from({ length: 15 }, (_, i) => ({
      id: `u${i}`,
      username: `user${i}`,
      email: `user${i}@logicedu.com`,
      fullName: `User ${i}`,
      status: 'ACTIVE' as const,
      role: 'STUDENT',
      createdAt: '2026-01-01T00:00:00Z',
    }));
    usersServiceMock.getAll.mockReturnValue(of(manyUsers));
    for (const u of manyUsers) {
      membershipsServiceMock.getByUser.mockReturnValueOnce(
        of([{ id: `m${u.id}`, userId: u.id, role: u.role, scopeType: 'COURSE', scopeRefId: 'g1', active: true }]),
      );
    }

    const fixture = await createFixture();
    await fixture.whenStable();
    await new Promise((r) => setTimeout(r, 100));
    fixture.detectChanges();

    const prevBtn = fixture.nativeElement.querySelector('[data-testid="pagination-prev"]');
    expect(prevBtn.disabled).toBe(true);
  });

  // --- Dialogs ---
  it('should render confirmation dialog component for status change', async () => {
    setupComponent();
    usersServiceMock.getAll.mockReturnValue(of(mockUsers));
    for (const u of mockUsers) {
      membershipsServiceMock.getByUser.mockReturnValueOnce(of(mockMembershipsByUser(u.id)));
    }

    const fixture = await createFixture();
    await fixture.whenStable();
    await new Promise((r) => setTimeout(r, 100));
    fixture.detectChanges();

    const confirmDialog = fixture.nativeElement.querySelector('app-confirmation-dialog');
    expect(confirmDialog).toBeTruthy();
  });

  // --- Page Header ---
  it('should render page header with title', async () => {
    setupComponent();
    usersServiceMock.getAll.mockReturnValue(of(mockUsers));
    for (const u of mockUsers) {
      membershipsServiceMock.getByUser.mockReturnValueOnce(of(mockMembershipsByUser(u.id)));
    }

    const fixture = await createFixture();
    await fixture.whenStable();
    await new Promise((r) => setTimeout(r, 100));
    fixture.detectChanges();

    const header = fixture.nativeElement.querySelector('app-page-header h1');
    expect(header).toBeTruthy();
    expect(header.textContent).toContain('Membresías');
  });
});
