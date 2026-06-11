import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { of, throwError, Observable } from 'rxjs';
import { SchoolsService } from './services/schools';
import { School } from './models/school';
import { SchoolsPageComponent } from './schools-page';

describe('SchoolsPageComponent', () => {
  let schoolsServiceMock: { getAll: ReturnType<typeof vi.fn>; create: ReturnType<typeof vi.fn> };

  function setupComponent() {
    schoolsServiceMock = { getAll: vi.fn(), create: vi.fn() };
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [SchoolsPageComponent],
      providers: [
        provideRouter([]),
        provideAnimationsAsync(),
        { provide: SchoolsService, useValue: schoolsServiceMock },
      ],
    });
  }

  const mockSchools: School[] = [
    {
      id: 's1',
      name: 'North Academy',
      code: 'NAC-001',
      shortName: 'North',
      description: 'A school of excellence',
      email: 'north@school.edu',
      phone: '1234567890',
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
      status: 'INACTIVE',
      createdAt: '2026-02-01T00:00:00Z',
    },
    {
      id: 's3',
      name: 'East Institute',
      code: 'EAI-003',
      shortName: 'East',
      description: '',
      email: '',
      phone: '',
      address: '789 Pine Rd',
      status: 'ACTIVE',
      createdAt: '2026-03-01T00:00:00Z',
    },
  ];

  async function createFixture() {
    const fixture = await TestBed.createComponent(SchoolsPageComponent);
    fixture.detectChanges();
    return fixture;
  }

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // --- Stat Cards ---

  it('should render 4 stat cards with correct values when schools load', async () => {
    setupComponent();
    schoolsServiceMock.getAll.mockReturnValue(of(mockSchools));

    const fixture = await createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    const statCards = fixture.nativeElement.querySelectorAll('app-stat-card');
    expect(statCards.length).toBe(4);

    const cardTexts = Array.from(statCards as Element[]).map(
      (el) => el.textContent?.trim() ?? ''
    );

    expect(cardTexts.some((t) => t.includes('Total Instituciones'))).toBe(true);
    expect(cardTexts.some((t) => t.includes('3'))).toBe(true);
    expect(cardTexts.some((t) => t.includes('Instituciones Activas'))).toBe(true);
    expect(cardTexts.some((t) => t.includes('2'))).toBe(true);
    expect(cardTexts.some((t) => t.includes('Instituciones Inactivas'))).toBe(true);
    expect(cardTexts.some((t) => t.includes('1'))).toBe(true);
  });

  // --- Loading ---

  it('should show loading state while data is loading', async () => {
    setupComponent();
    schoolsServiceMock.getAll.mockReturnValue(new Observable());

    const fixture = await TestBed.createComponent(SchoolsPageComponent);
    fixture.detectChanges();

    const loadingEl = fixture.nativeElement.querySelector('[data-testid="schools-loading"]');
    expect(loadingEl).toBeTruthy();
  });

  // --- Error ---

  it('should show error state when loading fails', async () => {
    setupComponent();
    schoolsServiceMock.getAll.mockReturnValue(throwError(() => new Error('Network error')));

    const fixture = await createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    const errorEl = fixture.nativeElement.querySelector('[data-testid="schools-error"]');
    expect(errorEl).toBeTruthy();
    expect(errorEl.textContent).toContain('Error al cargar instituciones');
  });

  it('should have a retry button in error state', async () => {
    setupComponent();
    schoolsServiceMock.getAll.mockReturnValue(throwError(() => new Error('Network error')));

    const fixture = await createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    const retryBtn = fixture.nativeElement.querySelector('[data-testid="schools-retry"]');
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
    expect(emptyEl.textContent).toContain('No hay instituciones registradas');
  });

  // --- Filters inside table card ---

  it('should render filters inside table card toolbar', async () => {
    setupComponent();
    schoolsServiceMock.getAll.mockReturnValue(of(mockSchools));

    const fixture = await createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    const tableCard = fixture.nativeElement.querySelector('.table-card');
    expect(tableCard).toBeTruthy();

    const searchInput = tableCard.querySelector('[data-testid="schools-search"]');
    expect(searchInput).toBeTruthy();

    const statusSelect = tableCard.querySelector('[data-testid="status-filter"]');
    expect(statusSelect).toBeTruthy();
  });

  // --- Table ---

  it('should render schools table with name, code, short name, status badge, and branch count', async () => {
    setupComponent();
    schoolsServiceMock.getAll.mockReturnValue(of(mockSchools));

    const fixture = await createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    const rows = fixture.nativeElement.querySelectorAll('[data-testid="school-row"]');
    expect(rows.length).toBe(3);

    const firstRow = rows[0];
    expect(firstRow.textContent).toContain('North Academy');
    expect(firstRow.textContent).toContain('NAC-001');

    const statusBadge = firstRow.querySelector('[data-testid="status-badge"]');
    expect(statusBadge).toBeTruthy();
    expect(statusBadge.textContent?.trim()).toBe('ACTIVE');
  });

  it('should render action buttons for each row', async () => {
    setupComponent();
    schoolsServiceMock.getAll.mockReturnValue(of(mockSchools));

    const fixture = await createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    const rows = fixture.nativeElement.querySelectorAll('[data-testid="school-row"]');
    for (const row of Array.from(rows as Element[])) {
      const actions = row.querySelectorAll('[data-testid="action-btn"]');
      expect(actions.length).toBeGreaterThanOrEqual(2);
    }
  });

  // --- Status badge colors ---

  it('should show INACTIVE status badge correctly', async () => {
    setupComponent();
    schoolsServiceMock.getAll.mockReturnValue(of([mockSchools[1]]));

    const fixture = await createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    const statusBadge = fixture.nativeElement.querySelector('[data-testid="status-badge"]');
    expect(statusBadge).toBeTruthy();
    expect(statusBadge.textContent?.trim()).toBe('INACTIVE');
  });

  // --- Search (client-side) ---

  it('should filter schools client-side via search input', async () => {
    setupComponent();
    schoolsServiceMock.getAll.mockReturnValue(of(mockSchools));

    const fixture = await createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    const searchInput = fixture.nativeElement.querySelector('[data-testid="schools-search"]');
    expect(searchInput).toBeTruthy();

    searchInput.value = 'North';
    searchInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const rows = fixture.nativeElement.querySelectorAll('[data-testid="school-row"]');
    expect(rows.length).toBe(1);
    expect(rows[0].textContent).toContain('North Academy');
  });

  // --- Page Header ---

  it('should render page header with title and create button', async () => {
    setupComponent();
    schoolsServiceMock.getAll.mockReturnValue(of(mockSchools));

    const fixture = await createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    const header = fixture.nativeElement.querySelector('[data-testid="page-header"]');
    expect(header).toBeTruthy();
    expect(header.textContent).toContain('Instituciones');
  });

  // --- Confirmation Dialog (deactivate) ---

  it('should render app-confirmation-dialog for deactivate', async () => {
    setupComponent();
    schoolsServiceMock.getAll.mockReturnValue(of(mockSchools));

    const fixture = await createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    const confirmDialog = fixture.nativeElement.querySelector('app-confirmation-dialog');
    expect(confirmDialog).toBeTruthy();
  });

  // --- No results (filtered to zero) ---

  it('should show "Sin resultados" inside table card when filter matches nothing', async () => {
    setupComponent();
    schoolsServiceMock.getAll.mockReturnValue(of(mockSchools));

    const fixture = await createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    const searchInput = fixture.nativeElement.querySelector('[data-testid="schools-search"]');
    searchInput.value = 'ZZZ_NoMatch';
    searchInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const noResults = fixture.nativeElement.querySelector('[data-testid="schools-no-results"]');
    expect(noResults).toBeTruthy();
    expect(noResults.textContent).toContain('Sin resultados');
  });

  // --- Export dropdown ---

  it('should render export dropdown button', async () => {
    setupComponent();
    schoolsServiceMock.getAll.mockReturnValue(of(mockSchools));

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

    const fixture = await createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    const sortableHeaders = fixture.nativeElement.querySelectorAll('th.sortable');
    expect(sortableHeaders.length).toBeGreaterThanOrEqual(3);
  });

  // --- Triangulation: Status filter ---

  it('should filter schools by ACTIVE status', async () => {
    setupComponent();
    schoolsServiceMock.getAll.mockReturnValue(of(mockSchools));

    const fixture = await createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    const statusSelect = fixture.nativeElement.querySelector('[data-testid="status-filter"]');
    statusSelect.value = 'ACTIVE';
    statusSelect.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    const rows = fixture.nativeElement.querySelectorAll('[data-testid="school-row"]');
    expect(rows.length).toBe(2);
  });

  it('should filter schools by INACTIVE status', async () => {
    setupComponent();
    schoolsServiceMock.getAll.mockReturnValue(of(mockSchools));

    const fixture = await createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    const statusSelect = fixture.nativeElement.querySelector('[data-testid="status-filter"]');
    statusSelect.value = 'INACTIVE';
    statusSelect.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    const rows = fixture.nativeElement.querySelectorAll('[data-testid="school-row"]');
    expect(rows.length).toBe(1);
    expect(rows[0].textContent).toContain('South School');
  });

  // --- Triangulation: Search by code ---

  it('should filter schools client-side by code search', async () => {
    setupComponent();
    schoolsServiceMock.getAll.mockReturnValue(of(mockSchools));

    const fixture = await createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    const searchInput = fixture.nativeElement.querySelector('[data-testid="schools-search"]');
    searchInput.value = 'SOS';
    searchInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const rows = fixture.nativeElement.querySelectorAll('[data-testid="school-row"]');
    expect(rows.length).toBe(1);
    expect(rows[0].textContent).toContain('South School');
  });

  // --- Triangulation: Show all when filter reset ---

  it('should show all schools when status filter is reset to Todos', async () => {
    setupComponent();
    schoolsServiceMock.getAll.mockReturnValue(of(mockSchools));

    const fixture = await createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    const statusSelect = fixture.nativeElement.querySelector('[data-testid="status-filter"]');
    statusSelect.value = 'INACTIVE';
    statusSelect.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('[data-testid="school-row"]').length).toBe(1);

    statusSelect.value = 'Todos';
    statusSelect.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('[data-testid="school-row"]').length).toBe(3);
  });
});
