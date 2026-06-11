import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { ActivatedRoute } from '@angular/router';
import { of, throwError, Observable } from 'rxjs';
import { BranchesService } from './services/branches';
import { SchoolsService } from '../services/schools';
import { BranchResponse } from './models/branch';
import { School } from '../models/school';
import { BranchesPage } from './branches-page';

describe('BranchesPage', () => {
  let branchesServiceMock: { getBySchool: ReturnType<typeof vi.fn> };
  let schoolsServiceMock: { getById: ReturnType<typeof vi.fn>; getAll: ReturnType<typeof vi.fn> };

  const mockSchool: School = {
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
  };

  const mockBranches: BranchResponse[] = [
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
    {
      id: 'b3',
      schoolId: 's1',
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

  function setupComponent(schoolId: string = 's1') {
    branchesServiceMock = { getBySchool: vi.fn() };
    schoolsServiceMock = { getById: vi.fn(), getAll: vi.fn().mockReturnValue(of([])) };

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [BranchesPage],
      providers: [
        provideRouter([]),
        provideAnimationsAsync(),
        { provide: BranchesService, useValue: branchesServiceMock },
        { provide: SchoolsService, useValue: schoolsServiceMock },
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({ schoolId }),
          },
        },
      ],
    });
  }

  async function createFixture() {
    const fixture = await TestBed.createComponent(BranchesPage);
    fixture.detectChanges();
    return fixture;
  }

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // --- Stat Cards ---

  it('should render 3 stat cards with correct values when branches load', async () => {
    setupComponent();
    branchesServiceMock.getBySchool.mockReturnValue(of(mockBranches));
    schoolsServiceMock.getById.mockReturnValue(of(mockSchool));

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
    branchesServiceMock.getBySchool.mockReturnValue(new Observable());
    schoolsServiceMock.getById.mockReturnValue(of(mockSchool));

    const fixture = await TestBed.createComponent(BranchesPage);
    fixture.detectChanges();

    const loadingEl = fixture.nativeElement.querySelector('[data-testid="branches-loading"]');
    expect(loadingEl).toBeTruthy();
  });

  // --- Error ---

  it('should show error state when loading fails', async () => {
    setupComponent();
    branchesServiceMock.getBySchool.mockReturnValue(throwError(() => new Error('Network error')));
    schoolsServiceMock.getById.mockReturnValue(of(mockSchool));

    const fixture = await createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    const errorEl = fixture.nativeElement.querySelector('[data-testid="branches-error"]');
    expect(errorEl).toBeTruthy();
    expect(errorEl.textContent).toContain('Error al cargar sedes');
  });

  it('should have a retry button in error state', async () => {
    setupComponent();
    branchesServiceMock.getBySchool.mockReturnValue(throwError(() => new Error('Network error')));
    schoolsServiceMock.getById.mockReturnValue(of(mockSchool));

    const fixture = await createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    const retryBtn = fixture.nativeElement.querySelector('[data-testid="branches-retry"]');
    expect(retryBtn).toBeTruthy();
  });

  // --- Breadcrumb ---

  it('should display back link to return to schools', async () => {
    setupComponent();
    branchesServiceMock.getBySchool.mockReturnValue(of(mockBranches));
    schoolsServiceMock.getById.mockReturnValue(of(mockSchool));

    const fixture = await createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    const backLink = fixture.nativeElement.querySelector('[data-testid="branches-back-link"]');
    expect(backLink).toBeTruthy();
    expect(backLink.textContent).toContain('Volver a Instituciones');
  });

  // --- Dynamic Page Header ---

  it('should render page header with school name and "Sedes"', async () => {
    setupComponent();
    branchesServiceMock.getBySchool.mockReturnValue(of(mockBranches));
    schoolsServiceMock.getById.mockReturnValue(of(mockSchool));

    const fixture = await createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    const header = fixture.nativeElement.querySelector('[data-testid="page-header"]');
    expect(header).toBeTruthy();
    expect(header.textContent).toContain('North Academy');
    expect(header.textContent).toContain('Sedes');
  });

  // --- Filters inside table card ---

  it('should render filters inside table card toolbar', async () => {
    setupComponent();
    branchesServiceMock.getBySchool.mockReturnValue(of(mockBranches));
    schoolsServiceMock.getById.mockReturnValue(of(mockSchool));

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

  it('should render branches table with name, code, address, type badge, and status badge', async () => {
    setupComponent();
    branchesServiceMock.getBySchool.mockReturnValue(of(mockBranches));
    schoolsServiceMock.getById.mockReturnValue(of(mockSchool));

    const fixture = await createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    const rows = fixture.nativeElement.querySelectorAll('[data-testid="branch-row"]');
    expect(rows.length).toBe(3);

    const firstRow = rows[0];
    expect(firstRow.textContent).toContain('Main Campus');
    expect(firstRow.textContent).toContain('MC-001');
    expect(firstRow.textContent).toContain('123 Campus Dr');

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
    branchesServiceMock.getBySchool.mockReturnValue(of(mockBranches));
    schoolsServiceMock.getById.mockReturnValue(of(mockSchool));

    const fixture = await createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    const rows = fixture.nativeElement.querySelectorAll('[data-testid="branch-row"]');
    for (const row of Array.from(rows as Element[])) {
      const actions = row.querySelectorAll('[data-testid="action-btn"]');
      expect(actions.length).toBeGreaterThanOrEqual(2);
    }
  });

  // --- Type badges ---

  it('should show VIRTUAL type badge correctly', async () => {
    setupComponent();
    branchesServiceMock.getBySchool.mockReturnValue(of([mockBranches[2]]));
    schoolsServiceMock.getById.mockReturnValue(of(mockSchool));

    const fixture = await createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    const typeBadge = fixture.nativeElement.querySelector('[data-testid="type-badge"]');
    expect(typeBadge).toBeTruthy();
    expect(typeBadge.textContent?.trim()).toBe('VIRTUAL');
  });

  // --- Status badge ---

  it('should show INACTIVE status badge correctly', async () => {
    setupComponent();
    branchesServiceMock.getBySchool.mockReturnValue(of([mockBranches[1]]));
    schoolsServiceMock.getById.mockReturnValue(of(mockSchool));

    const fixture = await createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    const statusBadge = fixture.nativeElement.querySelector('[data-testid="status-badge"]');
    expect(statusBadge).toBeTruthy();
    expect(statusBadge.textContent?.trim()).toBe('INACTIVE');
  });

  // --- Search (client-side) ---

  it('should filter branches client-side by name search', async () => {
    setupComponent();
    branchesServiceMock.getBySchool.mockReturnValue(of(mockBranches));
    schoolsServiceMock.getById.mockReturnValue(of(mockSchool));

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
    branchesServiceMock.getBySchool.mockReturnValue(of(mockBranches));
    schoolsServiceMock.getById.mockReturnValue(of(mockSchool));

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

  // --- No results ---

  it('should show "Sin resultados" inside table card when filter matches nothing', async () => {
    setupComponent();
    branchesServiceMock.getBySchool.mockReturnValue(of(mockBranches));
    schoolsServiceMock.getById.mockReturnValue(of(mockSchool));

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

  // --- Confirmation Dialog ---

  it('should render app-confirmation-dialog for deactivate', async () => {
    setupComponent();
    branchesServiceMock.getBySchool.mockReturnValue(of(mockBranches));
    schoolsServiceMock.getById.mockReturnValue(of(mockSchool));

    const fixture = await createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    const confirmDialog = fixture.nativeElement.querySelector('app-confirmation-dialog');
    expect(confirmDialog).toBeTruthy();
  });

  // --- Sort ---

  it('should have sortable column headers', async () => {
    setupComponent();
    branchesServiceMock.getBySchool.mockReturnValue(of(mockBranches));
    schoolsServiceMock.getById.mockReturnValue(of(mockSchool));

    const fixture = await createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    const sortableHeaders = fixture.nativeElement.querySelectorAll('th.sortable');
    expect(sortableHeaders.length).toBeGreaterThanOrEqual(3);
  });

  // --- Triangulation: Status filter ---

  it('should filter branches by ACTIVE status', async () => {
    setupComponent();
    branchesServiceMock.getBySchool.mockReturnValue(of(mockBranches));
    schoolsServiceMock.getById.mockReturnValue(of(mockSchool));

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
    branchesServiceMock.getBySchool.mockReturnValue(of(mockBranches));
    schoolsServiceMock.getById.mockReturnValue(of(mockSchool));

    const fixture = await createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    const statusSelect = fixture.nativeElement.querySelector('[data-testid="status-filter"]');
    statusSelect.value = 'INACTIVE';
    statusSelect.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    const rows = fixture.nativeElement.querySelectorAll('[data-testid="branch-row"]');
    expect(rows.length).toBe(1);
  });
});
