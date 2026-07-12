import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { of, throwError, Observable } from 'rxjs';
import { StructuresService } from './services/structures';
import { SchoolsService } from '../../schools/services/schools';
import { School } from '../../schools/models/school';
import { AcademicStructureResponse } from './models/structure';
import { StructuresPageComponent } from './structures-page';

describe('StructuresPageComponent', () => {
  let structuresServiceMock: { getBySchool: ReturnType<typeof vi.fn> };
  let schoolsServiceMock: { getAll: ReturnType<typeof vi.fn> };

  function setupComponent() {
    structuresServiceMock = { getBySchool: vi.fn() };
    schoolsServiceMock = { getAll: vi.fn() };

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [StructuresPageComponent],
      providers: [
        provideRouter([]),
        provideAnimationsAsync(),
        { provide: StructuresService, useValue: structuresServiceMock },
        { provide: SchoolsService, useValue: schoolsServiceMock },
      ],
    });
  }

  const mockStructures: AcademicStructureResponse[] = [
    {
      id: 'st1',
      schoolId: 'sch1',
      structureType: 'PRIMARIA',
      levelsCount: 6,
      periodsPerLevel: 4,
      evaluationPeriodsPerPeriod: 3,
      subjectsPerPeriod: 8,
      hoursPerSubject: 2,
      active: true,
      version: 1,
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    },
    {
      id: 'st2',
      schoolId: 'sch1',
      structureType: 'SECUNDARIA',
      levelsCount: 4,
      periodsPerLevel: 3,
      evaluationPeriodsPerPeriod: 2,
      subjectsPerPeriod: 6,
      hoursPerSubject: 3,
      active: false,
      version: 1,
      createdAt: '2026-02-01T00:00:00Z',
      updatedAt: '2026-02-01T00:00:00Z',
    },
    {
      id: 'st3',
      schoolId: 'sch1',
      structureType: 'MEDIA',
      levelsCount: 2,
      periodsPerLevel: 2,
      evaluationPeriodsPerPeriod: 2,
      subjectsPerPeriod: 5,
      hoursPerSubject: 2,
      active: true,
      version: 1,
      createdAt: '2026-03-01T00:00:00Z',
      updatedAt: '2026-03-01T00:00:00Z',
    },
  ];

  const mockSchools: School[] = [
    {
      id: 'sch1',
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
      id: 'sch2',
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

  async function createFixture() {
    const fixture = await TestBed.createComponent(StructuresPageComponent);
    fixture.detectChanges();
    return fixture;
  }

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // --- School Selector ---

  it('should render school selector with options', async () => {
    setupComponent();
    schoolsServiceMock.getAll.mockReturnValue(of(mockSchools));
    structuresServiceMock.getBySchool.mockReturnValue(of([]));

    const fixture = await createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    const schoolSelect = fixture.nativeElement.querySelector('[data-testid="school-select"]');
    expect(schoolSelect).toBeTruthy();

    const options = schoolSelect.querySelectorAll('option');
    expect(options.length).toBeGreaterThanOrEqual(2); // placeholder + schools
  });

  it('should load structures when a school is selected', async () => {
    setupComponent();
    schoolsServiceMock.getAll.mockReturnValue(of(mockSchools));
    structuresServiceMock.getBySchool.mockReturnValue(of(mockStructures));

    const fixture = await createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    // Select a school
    const instance = fixture.componentInstance;
    instance.selectSchool('sch1');
    await fixture.whenStable();
    fixture.detectChanges();

    expect(structuresServiceMock.getBySchool).toHaveBeenCalledWith('sch1');
  });

  // --- Stats ---

  it('should render 3 stat cards when structures load', async () => {
    setupComponent();
    schoolsServiceMock.getAll.mockReturnValue(of(mockSchools));
    structuresServiceMock.getBySchool.mockReturnValue(of(mockStructures));

    const fixture = await createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    // Need to select a school first
    const instance = fixture.componentInstance;
    instance.selectSchool('sch1');
    await fixture.whenStable();
    fixture.detectChanges();

    const statCards = fixture.nativeElement.querySelectorAll('app-stat-card');
    expect(statCards.length).toBe(3);

    const cardTexts = Array.from(statCards as Element[]).map(
      (el) => el.textContent?.trim() ?? ''
    );

    expect(cardTexts.some((t) => t.includes('Total Estructuras'))).toBe(true);
    expect(cardTexts.some((t) => t.includes('3'))).toBe(true);
    expect(cardTexts.some((t) => t.includes('Activas'))).toBe(true);
    expect(cardTexts.some((t) => t.includes('2'))).toBe(true);
    expect(cardTexts.some((t) => t.includes('Inactivas'))).toBe(true);
    expect(cardTexts.some((t) => t.includes('1'))).toBe(true);
  });

  // --- Loading ---

  it('should show loading state while structures are loading', async () => {
    setupComponent();
    schoolsServiceMock.getAll.mockReturnValue(of(mockSchools));
    structuresServiceMock.getBySchool.mockReturnValue(new Observable());

    const fixture = await createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    const instance = fixture.componentInstance;
    instance.selectSchool('sch1');
    fixture.detectChanges();

    const loadingEl = fixture.nativeElement.querySelector('[data-testid="structures-loading"]');
    expect(loadingEl).toBeTruthy();
  });

  // --- Error ---

  it('should show error state when loading fails', async () => {
    setupComponent();
    schoolsServiceMock.getAll.mockReturnValue(of(mockSchools));
    structuresServiceMock.getBySchool.mockReturnValue(throwError(() => new Error('Network error')));

    const fixture = await createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    const instance = fixture.componentInstance;
    instance.selectSchool('sch1');
    await fixture.whenStable();
    fixture.detectChanges();

    const errorEl = fixture.nativeElement.querySelector('[data-testid="structures-error"]');
    expect(errorEl).toBeTruthy();
    expect(errorEl.textContent).toContain('Error al cargar estructuras');
  });

  // --- Table ---

  it('should render structures table with correct rows', async () => {
    setupComponent();
    schoolsServiceMock.getAll.mockReturnValue(of(mockSchools));
    structuresServiceMock.getBySchool.mockReturnValue(of(mockStructures));

    const fixture = await createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    const instance = fixture.componentInstance;
    instance.selectSchool('sch1');
    await fixture.whenStable();
    fixture.detectChanges();

    const rows = fixture.nativeElement.querySelectorAll('[data-testid="structure-row"]');
    expect(rows.length).toBe(3);
  });

  it('should show structure type badge and status badge in rows', async () => {
    setupComponent();
    schoolsServiceMock.getAll.mockReturnValue(of(mockSchools));
    structuresServiceMock.getBySchool.mockReturnValue(of(mockStructures));

    const fixture = await createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    const instance = fixture.componentInstance;
    instance.selectSchool('sch1');
    await fixture.whenStable();
    fixture.detectChanges();

    const firstRow = fixture.nativeElement.querySelector('[data-testid="structure-row"]');
    expect(firstRow.textContent).toContain('Primaria');

    const statusBadge = firstRow.querySelector('[data-testid="status-badge"]');
    expect(statusBadge).toBeTruthy();
  });

  // --- Empty state ---

  it('should show empty state when no structures exist for selected school', async () => {
    setupComponent();
    schoolsServiceMock.getAll.mockReturnValue(of(mockSchools));
    structuresServiceMock.getBySchool.mockReturnValue(of([]));

    const fixture = await createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    const instance = fixture.componentInstance;
    instance.selectSchool('sch1');
    await fixture.whenStable();
    fixture.detectChanges();

    const emptyEl = fixture.nativeElement.querySelector('[data-testid="structures-no-results"]');
    expect(emptyEl).toBeTruthy();
  });

  // --- Filter by active/inactive ---

  it('should filter by ACTIVE status', async () => {
    setupComponent();
    schoolsServiceMock.getAll.mockReturnValue(of(mockSchools));
    structuresServiceMock.getBySchool.mockReturnValue(of(mockStructures));

    const fixture = await createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    const instance = fixture.componentInstance;
    instance.selectSchool('sch1');
    await fixture.whenStable();
    fixture.detectChanges();

    const statusSelect = fixture.nativeElement.querySelector('[data-testid="status-filter"]');
    statusSelect.value = 'ACTIVE';
    statusSelect.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    const rows = fixture.nativeElement.querySelectorAll('[data-testid="structure-row"]');
    expect(rows.length).toBe(2); // st1 and st3 are active
  });

  it('should filter by INACTIVE status', async () => {
    setupComponent();
    schoolsServiceMock.getAll.mockReturnValue(of(mockSchools));
    structuresServiceMock.getBySchool.mockReturnValue(of(mockStructures));

    const fixture = await createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    const instance = fixture.componentInstance;
    instance.selectSchool('sch1');
    await fixture.whenStable();
    fixture.detectChanges();

    const statusSelect = fixture.nativeElement.querySelector('[data-testid="status-filter"]');
    statusSelect.value = 'INACTIVE';
    statusSelect.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    const rows = fixture.nativeElement.querySelectorAll('[data-testid="structure-row"]');
    expect(rows.length).toBe(1); // st2 is inactive
  });

  // --- Search ---

  it('should filter by search term', async () => {
    setupComponent();
    schoolsServiceMock.getAll.mockReturnValue(of(mockSchools));
    structuresServiceMock.getBySchool.mockReturnValue(of(mockStructures));

    const fixture = await createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    const instance = fixture.componentInstance;
    instance.selectSchool('sch1');
    await fixture.whenStable();
    fixture.detectChanges();

    const searchInput = fixture.nativeElement.querySelector('[data-testid="structures-search"]');
    searchInput.value = 'Primaria';
    searchInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const rows = fixture.nativeElement.querySelectorAll('[data-testid="structure-row"]');
    expect(rows.length).toBe(1);
    expect(rows[0].textContent).toContain('Primaria');
  });

  // --- Dialogs ---

  it('should render create-structure dialog', async () => {
    setupComponent();
    schoolsServiceMock.getAll.mockReturnValue(of(mockSchools));
    structuresServiceMock.getBySchool.mockReturnValue(of([]));

    const fixture = await createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    // Select a school first for the dialog to render
    const instance = fixture.componentInstance;
    instance.selectSchool('sch1');
    await fixture.whenStable();
    fixture.detectChanges();

    const createDialog = fixture.nativeElement.querySelector('app-create-structure');
    expect(createDialog).toBeTruthy();
  });

  it('should render confirmation dialog', async () => {
    setupComponent();
    schoolsServiceMock.getAll.mockReturnValue(of(mockSchools));
    structuresServiceMock.getBySchool.mockReturnValue(of([]));

    const fixture = await createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    const confirmDialog = fixture.nativeElement.querySelector('app-confirmation-dialog');
    expect(confirmDialog).toBeTruthy();
  });
});
