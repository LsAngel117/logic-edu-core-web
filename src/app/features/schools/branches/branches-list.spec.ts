import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { of, throwError, Observable } from 'rxjs';
import { BranchesService } from './services/branches';
import { SchoolsService } from '../services/schools';
import { BranchResponse } from './models/branch';
import { School } from '../models/school';
import { BranchesListComponent } from './branches-list';

describe('BranchesListComponent', () => {
  let branchesServiceMock: { getBySchool: ReturnType<typeof vi.fn> };
  let schoolsServiceMock: { getAll: ReturnType<typeof vi.fn> };

  const mockSchools: School[] = [
    {
      id: 's1',
      name: 'North Academy',
      code: 'NAC-001',
      shortName: 'North',
      description: '',
      email: '',
      phone: '',
      address: '123 Main St',
      status: 'ACTIVE',
      createdAt: '2026-01-01T00:00:00Z',
    },
    {
      id: 's2',
      name: 'South School',
      code: 'SOS-002',
      shortName: 'South',
      description: '',
      email: '',
      phone: '',
      address: '456 Oak Ave',
      status: 'ACTIVE',
      createdAt: '2026-02-01T00:00:00Z',
    },
  ];

  const mockBranchesS1: BranchResponse[] = [
    {
      id: 'b1',
      schoolId: 's1',
      name: 'Main Campus',
      code: 'MC-001',
      shortName: 'Main',
      description: '',
      email: '',
      phone: '',
      address: '123 Campus Dr',
      type: 'MAIN',
      status: 'ACTIVE',
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    },
    {
      id: 'b2',
      schoolId: 's1',
      name: 'Downtown Annex',
      code: 'DA-002',
      shortName: 'Downtown',
      description: '',
      email: '',
      phone: '',
      address: '456 City Blvd',
      type: 'SECONDARY',
      status: 'INACTIVE',
      createdAt: '2026-02-01T00:00:00Z',
      updatedAt: '2026-02-01T00:00:00Z',
    },
  ];

  const mockBranchesS2: BranchResponse[] = [
    {
      id: 'b3',
      schoolId: 's2',
      name: 'Virtual Campus',
      code: 'VC-003',
      shortName: 'Virtual',
      description: '',
      email: '',
      phone: '',
      address: '',
      type: 'VIRTUAL',
      status: 'ACTIVE',
      createdAt: '2026-03-01T00:00:00Z',
      updatedAt: '2026-03-01T00:00:00Z',
    },
  ];

  function setupComponent() {
    branchesServiceMock = { getBySchool: vi.fn() };
    schoolsServiceMock = { getAll: vi.fn() };

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [BranchesListComponent],
      providers: [
        provideRouter([]),
        provideAnimationsAsync(),
        { provide: BranchesService, useValue: branchesServiceMock },
        { provide: SchoolsService, useValue: schoolsServiceMock },
      ],
    });
  }

  async function createFixture() {
    const fixture = await TestBed.createComponent(BranchesListComponent);
    fixture.detectChanges();
    return fixture;
  }

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // --- Stat Cards ---

  it('should render 3 stat cards with correct values when branches load', async () => {
    setupComponent();
    schoolsServiceMock.getAll.mockReturnValue(of(mockSchools));
    branchesServiceMock.getBySchool.mockReturnValueOnce(of(mockBranchesS1));
    branchesServiceMock.getBySchool.mockReturnValueOnce(of(mockBranchesS2));

    const fixture = await createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    const statCards = fixture.nativeElement.querySelectorAll('app-stat-card');
    expect(statCards.length).toBe(3);

    const cardTexts = Array.from(statCards as Element[]).map(
      (el) => el.textContent?.trim() ?? ''
    );

    expect(cardTexts.some((t) => t.includes('Total Sedes'))).toBe(true);
    expect(cardTexts.some((t) => t.includes('3'))).toBe(true);
    expect(cardTexts.some((t) => t.includes('Sedes Activas'))).toBe(true);
    expect(cardTexts.some((t) => t.includes('2'))).toBe(true);
    expect(cardTexts.some((t) => t.includes('Sedes Inactivas'))).toBe(true);
    expect(cardTexts.some((t) => t.includes('1'))).toBe(true);
  });

  // --- Loading ---

  it('should show loading state while data is loading', async () => {
    setupComponent();
    schoolsServiceMock.getAll.mockReturnValue(new Observable());

    const fixture = await TestBed.createComponent(BranchesListComponent);
    fixture.detectChanges();

    const loadingEl = fixture.nativeElement.querySelector('[data-testid="branches-loading"]');
    expect(loadingEl).toBeTruthy();
  });

  // --- Error ---

  it('should show error state when loading fails', async () => {
    setupComponent();
    schoolsServiceMock.getAll.mockReturnValue(of(mockSchools));
    branchesServiceMock.getBySchool.mockReturnValue(throwError(() => new Error('Network error')));

    const fixture = await createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    const errorEl = fixture.nativeElement.querySelector('[data-testid="branches-error"]');
    expect(errorEl).toBeTruthy();
    expect(errorEl.textContent).toContain('Error al cargar sedes');
  });

  it('should have a retry button in error state', async () => {
    setupComponent();
    schoolsServiceMock.getAll.mockReturnValue(of(mockSchools));
    branchesServiceMock.getBySchool.mockReturnValue(throwError(() => new Error('Network error')));

    const fixture = await createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    const retryBtn = fixture.nativeElement.querySelector('[data-testid="branches-retry"]');
    expect(retryBtn).toBeTruthy();
  });

  // --- Empty State ---

  it('should show empty state when no schools exist', async () => {
    setupComponent();
    schoolsServiceMock.getAll.mockReturnValue(of([]));

    const fixture = await createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    const emptyEl = fixture.nativeElement.querySelector('[data-testid="empty-state-title"]');
    expect(emptyEl).toBeTruthy();
    expect(emptyEl.textContent).toContain('No hay sedes registradas');
  });

  // --- Page Header ---

  it('should render page header with title and create button', async () => {
    setupComponent();
    schoolsServiceMock.getAll.mockReturnValue(of(mockSchools));
    branchesServiceMock.getBySchool.mockReturnValueOnce(of(mockBranchesS1));
    branchesServiceMock.getBySchool.mockReturnValueOnce(of(mockBranchesS2));

    const fixture = await createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    const header = fixture.nativeElement.querySelector('[data-testid="page-header"]');
    expect(header).toBeTruthy();
    expect(header.textContent).toContain('Sedes');

    const headerBtn = fixture.nativeElement.querySelector('[data-testid="create-branch-btn-header"]');
    expect(headerBtn).toBeTruthy();
  });

  // --- Filters inside table card ---

  it('should render filters inside table card toolbar', async () => {
    setupComponent();
    schoolsServiceMock.getAll.mockReturnValue(of(mockSchools));
    branchesServiceMock.getBySchool.mockReturnValueOnce(of(mockBranchesS1));
    branchesServiceMock.getBySchool.mockReturnValueOnce(of(mockBranchesS2));

    const fixture = await createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    const tableCard = fixture.nativeElement.querySelector('.table-card');
    expect(tableCard).toBeTruthy();

    const searchInput = tableCard.querySelector('[data-testid="branches-search"]');
    expect(searchInput).toBeTruthy();

    const statusSelect = tableCard.querySelector('[data-testid="status-filter"]');
    expect(statusSelect).toBeTruthy();
  });

  // --- Table ---

  it('should render branches table with name, code, institution, type badge, and status badge', async () => {
    setupComponent();
    schoolsServiceMock.getAll.mockReturnValue(of(mockSchools));
    branchesServiceMock.getBySchool.mockReturnValueOnce(of(mockBranchesS1));
    branchesServiceMock.getBySchool.mockReturnValueOnce(of(mockBranchesS2));

    const fixture = await createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    const rows = fixture.nativeElement.querySelectorAll('[data-testid="branch-row"]');
    expect(rows.length).toBe(3);

    // First row: Main Campus (s1)
    const firstRow = rows[0];
    expect(firstRow.textContent).toContain('Main Campus');
    expect(firstRow.textContent).toContain('MC-001');
    expect(firstRow.textContent).toContain('North Academy');

    // Type badge
    const typeBadge = firstRow.querySelector('[data-testid="type-badge"]');
    expect(typeBadge).toBeTruthy();
    expect(typeBadge.textContent?.trim()).toBe('MAIN');

    // Status badge
    const statusBadge = firstRow.querySelector('[data-testid="status-badge"]');
    expect(statusBadge).toBeTruthy();
    expect(statusBadge.textContent?.trim()).toBe('ACTIVE');
  });

  it('should render action buttons for each branch row', async () => {
    setupComponent();
    schoolsServiceMock.getAll.mockReturnValue(of(mockSchools));
    branchesServiceMock.getBySchool.mockReturnValueOnce(of(mockBranchesS1));
    branchesServiceMock.getBySchool.mockReturnValueOnce(of(mockBranchesS2));

    const fixture = await createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    const rows = fixture.nativeElement.querySelectorAll('[data-testid="branch-row"]');
    for (const row of Array.from(rows as Element[])) {
      const actions = row.querySelectorAll('[data-testid="action-btn"]');
      expect(actions.length).toBeGreaterThanOrEqual(2);
    }
  });

  // --- Status badge ---

  it('should show INACTIVE status badge correctly', async () => {
    setupComponent();
    schoolsServiceMock.getAll.mockReturnValue(of(mockSchools));
    branchesServiceMock.getBySchool.mockReturnValueOnce(of(mockBranchesS1));
    branchesServiceMock.getBySchool.mockReturnValueOnce(of([]));

    const fixture = await createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    const statusBadges = fixture.nativeElement.querySelectorAll('[data-testid="status-badge"]');
    expect(statusBadges.length).toBe(2);

    const inactiveBadge = Array.from(statusBadges as Element[]).find(
      (el) => el.textContent?.trim() === 'INACTIVE'
    );
    expect(inactiveBadge).toBeTruthy();
  });

  // --- Type badge ---

  it('should show VIRTUAL type badge correctly', async () => {
    setupComponent();
    schoolsServiceMock.getAll.mockReturnValue(of([mockSchools[1]]));
    branchesServiceMock.getBySchool.mockReturnValueOnce(of(mockBranchesS2));

    const fixture = await createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    const typeBadge = fixture.nativeElement.querySelector('[data-testid="type-badge"]');
    expect(typeBadge).toBeTruthy();
    expect(typeBadge.textContent?.trim()).toBe('VIRTUAL');
  });

  // --- Search (client-side) ---

  it('should filter branches client-side by name search', async () => {
    setupComponent();
    schoolsServiceMock.getAll.mockReturnValue(of(mockSchools));
    branchesServiceMock.getBySchool.mockReturnValueOnce(of(mockBranchesS1));
    branchesServiceMock.getBySchool.mockReturnValueOnce(of(mockBranchesS2));

    const fixture = await createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    const searchInput = fixture.nativeElement.querySelector('[data-testid="branches-search"]');
    expect(searchInput).toBeTruthy();

    searchInput.value = 'Main';
    searchInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const rows = fixture.nativeElement.querySelectorAll('[data-testid="branch-row"]');
    expect(rows.length).toBe(1);
    expect(rows[0].textContent).toContain('Main Campus');
  });

  it('should filter branches client-side by code search', async () => {
    setupComponent();
    schoolsServiceMock.getAll.mockReturnValue(of(mockSchools));
    branchesServiceMock.getBySchool.mockReturnValueOnce(of(mockBranchesS1));
    branchesServiceMock.getBySchool.mockReturnValueOnce(of(mockBranchesS2));

    const fixture = await createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    const searchInput = fixture.nativeElement.querySelector('[data-testid="branches-search"]');
    searchInput.value = 'DA';
    searchInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const rows = fixture.nativeElement.querySelectorAll('[data-testid="branch-row"]');
    expect(rows.length).toBe(1);
    expect(rows[0].textContent).toContain('Downtown');
  });

  it('should filter branches client-side by institution name search', async () => {
    setupComponent();
    schoolsServiceMock.getAll.mockReturnValue(of(mockSchools));
    branchesServiceMock.getBySchool.mockReturnValueOnce(of(mockBranchesS1));
    branchesServiceMock.getBySchool.mockReturnValueOnce(of(mockBranchesS2));

    const fixture = await createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    const searchInput = fixture.nativeElement.querySelector('[data-testid="branches-search"]');
    searchInput.value = 'South';
    searchInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const rows = fixture.nativeElement.querySelectorAll('[data-testid="branch-row"]');
    expect(rows.length).toBe(1);
    expect(rows[0].textContent).toContain('Virtual Campus');
  });

  // --- No results (filtered to zero) ---

  it('should show "Sin resultados" inside table card when filter matches nothing', async () => {
    setupComponent();
    schoolsServiceMock.getAll.mockReturnValue(of(mockSchools));
    branchesServiceMock.getBySchool.mockReturnValueOnce(of(mockBranchesS1));
    branchesServiceMock.getBySchool.mockReturnValueOnce(of(mockBranchesS2));

    const fixture = await createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    const searchInput = fixture.nativeElement.querySelector('[data-testid="branches-search"]');
    searchInput.value = 'ZZZ_NoMatch';
    searchInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const noResults = fixture.nativeElement.querySelector('[data-testid="branches-no-results"]');
    expect(noResults).toBeTruthy();
    expect(noResults.textContent).toContain('Sin resultados');
  });

  // --- Export dropdown ---

  it('should render export dropdown button', async () => {
    setupComponent();
    schoolsServiceMock.getAll.mockReturnValue(of(mockSchools));
    branchesServiceMock.getBySchool.mockReturnValueOnce(of(mockBranchesS1));
    branchesServiceMock.getBySchool.mockReturnValueOnce(of(mockBranchesS2));

    const fixture = await createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    const exportBtn = fixture.nativeElement.querySelector('.export-dropdown button');
    expect(exportBtn).toBeTruthy();
    expect(exportBtn.textContent).toContain('Exportar');
  });

  // --- Sort ---

  it('should have sortable column headers', async () => {
    setupComponent();
    schoolsServiceMock.getAll.mockReturnValue(of(mockSchools));
    branchesServiceMock.getBySchool.mockReturnValueOnce(of(mockBranchesS1));
    branchesServiceMock.getBySchool.mockReturnValueOnce(of(mockBranchesS2));

    const fixture = await createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    const sortableHeaders = fixture.nativeElement.querySelectorAll('th.sortable');
    expect(sortableHeaders.length).toBeGreaterThanOrEqual(5);
  });

  // --- Pagination ---

  it('should render pagination controls below table', async () => {
    setupComponent();
    // Create many branches to trigger pagination (pageSize default is 10)
    const manyBranches: BranchResponse[] = Array.from({ length: 15 }, (_, i) => ({
      id: `b${i}`,
      schoolId: 's1',
      name: `Branch ${i}`,
      code: `B-${i}`,
      shortName: `B${i}`,
      description: '',
      email: '',
      phone: '',
      address: `Address ${i}`,
      type: 'MAIN' as const,
      status: 'ACTIVE' as const,
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    }));
    schoolsServiceMock.getAll.mockReturnValue(of([mockSchools[0]]));
    branchesServiceMock.getBySchool.mockReturnValueOnce(of(manyBranches));

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
    schoolsServiceMock.getAll.mockReturnValue(of(mockSchools));
    branchesServiceMock.getBySchool.mockReturnValueOnce(of(mockBranchesS1));
    branchesServiceMock.getBySchool.mockReturnValueOnce(of(mockBranchesS2));

    const fixture = await createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    const pageSizeSelect = fixture.nativeElement.querySelector('[data-testid="page-size-select"]');
    expect(pageSizeSelect).toBeTruthy();
  });

  it('should disable prev button on first page', async () => {
    setupComponent();
    const manyBranches: BranchResponse[] = Array.from({ length: 15 }, (_, i) => ({
      id: `b${i}`,
      schoolId: 's1',
      name: `Branch ${i}`,
      code: `B-${i}`,
      shortName: `B${i}`,
      description: '',
      email: '',
      phone: '',
      address: `Address ${i}`,
      type: 'MAIN' as const,
      status: 'ACTIVE' as const,
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    }));
    schoolsServiceMock.getAll.mockReturnValue(of([mockSchools[0]]));
    branchesServiceMock.getBySchool.mockReturnValueOnce(of(manyBranches));

    const fixture = await createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    const prevBtn = fixture.nativeElement.querySelector('[data-testid="pagination-prev"]');
    expect(prevBtn.disabled).toBe(true);
  });

  // --- Triangulation: Status filter ---

  it('should filter branches by ACTIVE status', async () => {
    setupComponent();
    schoolsServiceMock.getAll.mockReturnValue(of(mockSchools));
    branchesServiceMock.getBySchool.mockReturnValueOnce(of(mockBranchesS1));
    branchesServiceMock.getBySchool.mockReturnValueOnce(of(mockBranchesS2));

    const fixture = await createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    const statusSelect = fixture.nativeElement.querySelector('[data-testid="status-filter"]');
    statusSelect.value = 'ACTIVE';
    statusSelect.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    const rows = fixture.nativeElement.querySelectorAll('[data-testid="branch-row"]');
    expect(rows.length).toBe(2);
  });

  it('should filter branches by INACTIVE status', async () => {
    setupComponent();
    schoolsServiceMock.getAll.mockReturnValue(of(mockSchools));
    branchesServiceMock.getBySchool.mockReturnValueOnce(of(mockBranchesS1));
    branchesServiceMock.getBySchool.mockReturnValueOnce(of(mockBranchesS2));

    const fixture = await createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    const statusSelect = fixture.nativeElement.querySelector('[data-testid="status-filter"]');
    statusSelect.value = 'INACTIVE';
    statusSelect.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    const rows = fixture.nativeElement.querySelectorAll('[data-testid="branch-row"]');
    expect(rows.length).toBe(1);
    expect(rows[0].textContent).toContain('Downtown');
  });

  it('should show all branches when status filter is reset to Todos', async () => {
    setupComponent();
    schoolsServiceMock.getAll.mockReturnValue(of(mockSchools));
    branchesServiceMock.getBySchool.mockReturnValueOnce(of(mockBranchesS1));
    branchesServiceMock.getBySchool.mockReturnValueOnce(of(mockBranchesS2));

    const fixture = await createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    const statusSelect = fixture.nativeElement.querySelector('[data-testid="status-filter"]');
    statusSelect.value = 'INACTIVE';
    statusSelect.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('[data-testid="branch-row"]').length).toBe(1);

    statusSelect.value = 'Todos';
    statusSelect.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('[data-testid="branch-row"]').length).toBe(3);
  });

  // --- Create dialog ---

  it('should render app-create-branch component', async () => {
    setupComponent();
    schoolsServiceMock.getAll.mockReturnValue(of(mockSchools));
    branchesServiceMock.getBySchool.mockReturnValueOnce(of(mockBranchesS1));
    branchesServiceMock.getBySchool.mockReturnValueOnce(of(mockBranchesS2));

    const fixture = await createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    const createBranchEl = fixture.nativeElement.querySelector('app-create-branch');
    expect(createBranchEl).toBeTruthy();
  });
});
