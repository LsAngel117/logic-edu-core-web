import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { ActivatedRoute } from '@angular/router';
import { of, throwError, Observable } from 'rxjs';
import { BranchesService } from './services/branches';
import { SchoolsService } from '../services/schools';
import { Branch } from './models/branch';
import { School } from '../models/school';
import { BranchesPage } from './branches-page';

describe('BranchesPage', () => {
  let branchesServiceMock: { getBySchool: ReturnType<typeof vi.fn> };
  let schoolsServiceMock: { getById: ReturnType<typeof vi.fn> };

  const mockSchool: School = {
    id: 's1',
    name: 'North Academy',
    code: 'NAC-001',
    address: '123 Main St',
    status: 'active',
    branchCount: 3,
    createdAt: '2026-01-01T00:00:00Z',
  };

  const mockBranches: Branch[] = [
    {
      id: 'b1',
      schoolId: 's1',
      name: 'Main Campus',
      code: 'MC-001',
      address: '123 Campus Dr',
      status: 'active',
    },
    {
      id: 'b2',
      schoolId: 's1',
      name: 'Downtown Annex',
      code: 'DA-002',
      address: '456 City Blvd',
      status: 'inactive',
    },
  ];

  function setupComponent(schoolId: string = 's1') {
    branchesServiceMock = { getBySchool: vi.fn() };
    schoolsServiceMock = { getById: vi.fn() };

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

  it('should render mat-spinner while loading', async () => {
    setupComponent();
    branchesServiceMock.getBySchool.mockReturnValue(new Observable());
    schoolsServiceMock.getById.mockReturnValue(of(mockSchool));

    const fixture = await TestBed.createComponent(BranchesPage);
    fixture.detectChanges();

    const spinner = fixture.nativeElement.querySelector('mat-spinner');
    expect(spinner).toBeTruthy();
  });

  it('should render branches in mat-table rows after loading', async () => {
    setupComponent();
    branchesServiceMock.getBySchool.mockReturnValue(of(mockBranches));
    schoolsServiceMock.getById.mockReturnValue(of(mockSchool));

    const fixture = await createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    const rows = fixture.nativeElement.querySelectorAll('tr.mat-mdc-row');
    expect(rows.length).toBe(2);

    const cells0 = rows[0].querySelectorAll('td');
    expect(cells0[0].textContent).toContain('Main Campus');
    expect(cells0[1].textContent).toContain('MC-001');
  });

  it('should display school name in the page', async () => {
    setupComponent();
    branchesServiceMock.getBySchool.mockReturnValue(of(mockBranches));
    schoolsServiceMock.getById.mockReturnValue(of(mockSchool));

    const fixture = await createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    const content = fixture.nativeElement.textContent;
    expect(content).toContain('North Academy');
  });

  it('should show "No branches for this school" when list is empty', async () => {
    setupComponent();
    branchesServiceMock.getBySchool.mockReturnValue(of([]));
    schoolsServiceMock.getById.mockReturnValue(of(mockSchool));

    const fixture = await createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    const message = fixture.nativeElement.querySelector('.empty-state');
    expect(message).toBeTruthy();
    expect(message.textContent).toContain('No branches for this school');
  });

  it('should show error message when loading fails', async () => {
    setupComponent();
    branchesServiceMock.getBySchool.mockReturnValue(throwError(() => new Error('Network error')));
    schoolsServiceMock.getById.mockReturnValue(of(mockSchool));

    const fixture = await createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    const error = fixture.nativeElement.querySelector('.error-state');
    expect(error).toBeTruthy();
    expect(error.textContent).toContain('Failed to load branches');
  });

  it('should filter branches client-side by search input', async () => {
    setupComponent();
    branchesServiceMock.getBySchool.mockReturnValue(of(mockBranches));
    schoolsServiceMock.getById.mockReturnValue(of(mockSchool));

    const fixture = await createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    const searchInput = fixture.nativeElement.querySelector('input[type="search"]');
    expect(searchInput).toBeTruthy();

    searchInput.value = 'Main';
    searchInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const rows = fixture.nativeElement.querySelectorAll('tr.mat-mdc-row');
    expect(rows.length).toBe(1);
    const cells0 = rows[0].querySelectorAll('td');
    expect(cells0[0].textContent).toContain('Main Campus');
  });

  it('should render action buttons for each branch row', async () => {
    setupComponent();
    branchesServiceMock.getBySchool.mockReturnValue(of(mockBranches));
    schoolsServiceMock.getById.mockReturnValue(of(mockSchool));

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

  it('should display back button to return to schools', async () => {
    setupComponent();
    branchesServiceMock.getBySchool.mockReturnValue(of(mockBranches));
    schoolsServiceMock.getById.mockReturnValue(of(mockSchool));

    const fixture = await createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    const backLink = fixture.nativeElement.querySelector('a.back-link');
    expect(backLink).toBeTruthy();
  });

  it('should render status chips for branches', async () => {
    setupComponent();
    branchesServiceMock.getBySchool.mockReturnValue(of(mockBranches));
    schoolsServiceMock.getById.mockReturnValue(of(mockSchool));

    const fixture = await createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    const chips = fixture.nativeElement.querySelectorAll('mat-chip');
    const activeChip = Array.from(chips as Element[]).find(
      (c) => c.textContent?.trim() === 'active'
    );
    const inactiveChip = Array.from(chips as Element[]).find(
      (c) => c.textContent?.trim() === 'inactive'
    );
    expect(activeChip).toBeTruthy();
    expect(inactiveChip).toBeTruthy();
  });
});
