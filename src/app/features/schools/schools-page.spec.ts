import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { of, throwError, Observable } from 'rxjs';
import { SchoolsService } from './services/schools';
import { School } from './models/school';
import { SchoolsPageComponent } from './schools-page';

describe('SchoolsPageComponent', () => {
  let schoolsServiceMock: { getAll: ReturnType<typeof vi.fn> };

  function setupComponent() {
    schoolsServiceMock = { getAll: vi.fn() };
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
  ];

  async function createFixture() {
    const fixture = await TestBed.createComponent(SchoolsPageComponent);
    fixture.detectChanges();
    return fixture;
  }

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render mat-spinner while loading', async () => {
    setupComponent();
    schoolsServiceMock.getAll.mockReturnValue(new Observable());

    const fixture = await TestBed.createComponent(SchoolsPageComponent);
    fixture.detectChanges();

    const spinner = fixture.nativeElement.querySelector('mat-spinner');
    expect(spinner).toBeTruthy();
  });

  it('should render schools in mat-table rows after loading', async () => {
    setupComponent();
    schoolsServiceMock.getAll.mockReturnValue(of(mockSchools));

    const fixture = await createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    const rows = fixture.nativeElement.querySelectorAll('tr.mat-mdc-row');
    expect(rows.length).toBe(2);

    const cells0 = rows[0].querySelectorAll('td');
    expect(cells0[0].textContent).toContain('North Academy');
    expect(cells0[1].textContent).toContain('NAC-001');
  });

  it('should show "No schools found" when list is empty', async () => {
    setupComponent();
    schoolsServiceMock.getAll.mockReturnValue(of([]));

    const fixture = await createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    const message = fixture.nativeElement.querySelector('.empty-state');
    expect(message).toBeTruthy();
    expect(message.textContent).toContain('No schools found');
  });

  it('should show error message when loading fails', async () => {
    setupComponent();
    schoolsServiceMock.getAll.mockReturnValue(throwError(() => new Error('Network error')));

    const fixture = await createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    const error = fixture.nativeElement.querySelector('.error-state');
    expect(error).toBeTruthy();
    expect(error.textContent).toContain('Failed to load schools');
  });

  it('should render green status chip for active schools', async () => {
    setupComponent();
    schoolsServiceMock.getAll.mockReturnValue(of([mockSchools[0]]));

    const fixture = await createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    const chips = fixture.nativeElement.querySelectorAll('mat-chip');
    const activeChip = Array.from(chips as Element[]).find(
      (c) => c.textContent?.trim() === 'ACTIVE'
    );
    expect(activeChip).toBeTruthy();
  });

  it('should render red status chip for inactive schools', async () => {
    setupComponent();
    schoolsServiceMock.getAll.mockReturnValue(of([mockSchools[1]]));

    const fixture = await createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    const chips = fixture.nativeElement.querySelectorAll('mat-chip');
    const inactiveChip = Array.from(chips as Element[]).find(
      (c) => c.textContent?.trim() === 'INACTIVE'
    );
    expect(inactiveChip).toBeTruthy();
  });

  it('should call service.getAll with search term after debounce', async () => {
    vi.useFakeTimers();
    setupComponent();
    schoolsServiceMock.getAll.mockReturnValue(of([]));

    const fixture = await createFixture();
    schoolsServiceMock.getAll.mockClear();

    const searchInput = fixture.nativeElement.querySelector('input[type="search"]');
    expect(searchInput).toBeTruthy();

    searchInput.value = 'north';
    searchInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    vi.advanceTimersByTime(300);

    expect(schoolsServiceMock.getAll).toHaveBeenCalledWith('north');

    vi.useRealTimers();
  });

  it('should render action buttons for each school row', async () => {
    setupComponent();
    schoolsServiceMock.getAll.mockReturnValue(of(mockSchools));

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
