import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { ActivatedRoute } from '@angular/router';
import { of, throwError, Observable, BehaviorSubject } from 'rxjs';
import { BranchesService } from './services/branches';
import { SchoolsService } from '../services/schools';
import { BranchResponse } from './models/branch';
import { School } from '../models/school';
import { BranchDetailComponent } from './branch-detail';

describe('BranchDetailComponent', () => {
  let branchesServiceMock: {
    getById: ReturnType<typeof vi.fn>;
    updateStatus: ReturnType<typeof vi.fn>;
  };
  let schoolsServiceMock: {
    getById: ReturnType<typeof vi.fn>;
  };
  let paramsSubject: BehaviorSubject<{ schoolId: string; id: string }>;

  const mockSchool: School = {
    id: 's1',
    name: 'Colegio San Patricio',
    code: 'CSP-001',
    shortName: 'CSP',
    description: '',
    email: '',
    phone: '',
    address: '',
    status: 'ACTIVE',
    createdAt: '2026-01-01T00:00:00Z',
  };

  const mockBranch: BranchResponse = {
    id: 'b1',
    schoolId: 's1',
    name: 'Sede Principal',
    code: 'SED-001',
    shortName: 'PRINCIPAL',
    description: 'Sede principal de la institución',
    email: 'principal@csp.edu.co',
    phone: '+57 601 1111111',
    address: 'Calle 123 #45-67',
    city: 'Bogotá',
    country: 'Colombia',
    type: 'MAIN',
    status: 'ACTIVE',
    createdAt: '2026-01-15T12:00:00Z',
    updatedAt: '2026-06-01T12:00:00Z',
  };

  const mockBranchInactive: BranchResponse = {
    ...mockBranch,
    id: 'b2',
    name: 'Sede Inactiva',
    code: 'SED-002',
    status: 'INACTIVE',
  };

  function setupComponent(schoolId: string = 's1', branchId: string = 'b1') {
    branchesServiceMock = {
      getById: vi.fn(),
      updateStatus: vi.fn(),
    };
    schoolsServiceMock = {
      getById: vi.fn(),
    };
    paramsSubject = new BehaviorSubject({ schoolId, id: branchId });

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [BranchDetailComponent],
      providers: [
        provideRouter([]),
        provideAnimationsAsync(),
        { provide: BranchesService, useValue: branchesServiceMock },
        { provide: SchoolsService, useValue: schoolsServiceMock },
        {
          provide: ActivatedRoute,
          useValue: { params: paramsSubject.asObservable() },
        },
      ],
    });
  }

  async function createFixture() {
    const fixture = await TestBed.createComponent(BranchDetailComponent);
    fixture.detectChanges();
    return fixture;
  }

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ======================================================================
  //  LOADING STATE
  // ======================================================================
  describe('loading state', () => {
    it('should show loading indicator while fetching branch', async () => {
      setupComponent();
      branchesServiceMock.getById.mockReturnValue(new Observable());
      schoolsServiceMock.getById.mockReturnValue(new Observable());

      const fixture = await createFixture();
      const content = fixture.nativeElement.textContent;
      expect(content).toContain('Cargando');
    });

    it('should hide loading after branch data resolves', async () => {
      setupComponent();
      branchesServiceMock.getById.mockReturnValue(of(mockBranch));
      schoolsServiceMock.getById.mockReturnValue(of(mockSchool));

      const fixture = await createFixture();
      await fixture.whenStable();
      fixture.detectChanges();

      const content = fixture.nativeElement.textContent;
      expect(content).not.toContain('Cargando');
    });
  });

  // ======================================================================
  //  ERROR STATES
  // ======================================================================
  describe('error states', () => {
    it('should show "Sede no encontrada" on 404', async () => {
      setupComponent();
      branchesServiceMock.getById.mockReturnValue(throwError(() => ({ status: 404 })));
      schoolsServiceMock.getById.mockReturnValue(of(mockSchool));

      const fixture = await createFixture();
      await fixture.whenStable();
      fixture.detectChanges();

      const content = fixture.nativeElement.textContent;
      expect(content).toContain('Sede no encontrada');
    });

    it('should show error message with retry button on network failure', async () => {
      setupComponent();
      branchesServiceMock.getById.mockReturnValue(throwError(() => ({ status: 0 })));
      schoolsServiceMock.getById.mockReturnValue(of(mockSchool));

      const fixture = await createFixture();
      await fixture.whenStable();
      fixture.detectChanges();

      const content = fixture.nativeElement.textContent;
      expect(content).toContain('Error al cargar sede');
      expect(content).toContain('Reintentar');
    });
  });

  // ======================================================================
  //  HEADER CARD
  // ======================================================================
  describe('header card', () => {
    async function loadBranch(fixture: any) {
      await fixture.whenStable();
      fixture.detectChanges();
    }

    it('should render breadcrumb with back link', async () => {
      setupComponent();
      branchesServiceMock.getById.mockReturnValue(of(mockBranch));
      schoolsServiceMock.getById.mockReturnValue(of(mockSchool));

      const fixture = await createFixture();
      await loadBranch(fixture);

      const content = fixture.nativeElement.textContent;
      expect(content).toContain('Instituciones');
      expect(content).toContain('Sedes');
    });

    it('should render branch name prominently', async () => {
      setupComponent();
      branchesServiceMock.getById.mockReturnValue(of(mockBranch));
      schoolsServiceMock.getById.mockReturnValue(of(mockSchool));

      const fixture = await createFixture();
      await loadBranch(fixture);

      const content = fixture.nativeElement.textContent;
      expect(content).toContain('Sede Principal');
    });

    it('should render branch code as secondary text', async () => {
      setupComponent();
      branchesServiceMock.getById.mockReturnValue(of(mockBranch));
      schoolsServiceMock.getById.mockReturnValue(of(mockSchool));

      const fixture = await createFixture();
      await loadBranch(fixture);

      const content = fixture.nativeElement.textContent;
      expect(content).toContain('SED-001');
    });

    it('should render status badge with ACTIVE text', async () => {
      setupComponent();
      branchesServiceMock.getById.mockReturnValue(of(mockBranch));
      schoolsServiceMock.getById.mockReturnValue(of(mockSchool));

      const fixture = await createFixture();
      await loadBranch(fixture);

      const content = fixture.nativeElement.textContent;
      expect(content).toContain('ACTIVE');
    });

    it('should render status badge with INACTIVE text when inactive', async () => {
      setupComponent('s1', 'b2');
      branchesServiceMock.getById.mockReturnValue(of(mockBranchInactive));
      schoolsServiceMock.getById.mockReturnValue(of(mockSchool));

      const fixture = await createFixture();
      await loadBranch(fixture);

      const content = fixture.nativeElement.textContent;
      expect(content).toContain('INACTIVE');
    });

    it('should render branch type badge', async () => {
      setupComponent();
      branchesServiceMock.getById.mockReturnValue(of(mockBranch));
      schoolsServiceMock.getById.mockReturnValue(of(mockSchool));

      const fixture = await createFixture();
      await loadBranch(fixture);

      const content = fixture.nativeElement.textContent;
      expect(content).toContain('MAIN');
    });

    it('should render Editar action button', async () => {
      setupComponent();
      branchesServiceMock.getById.mockReturnValue(of(mockBranch));
      schoolsServiceMock.getById.mockReturnValue(of(mockSchool));

      const fixture = await createFixture();
      await loadBranch(fixture);

      const content = fixture.nativeElement.textContent;
      expect(content).toContain('Editar');
    });

    it('should show Desactivar button when branch is ACTIVE', async () => {
      setupComponent();
      branchesServiceMock.getById.mockReturnValue(of(mockBranch));
      schoolsServiceMock.getById.mockReturnValue(of(mockSchool));

      const fixture = await createFixture();
      await loadBranch(fixture);

      const content = fixture.nativeElement.textContent;
      expect(content).toContain('Desactivar');
    });

    it('should show Activar button when branch is INACTIVE', async () => {
      setupComponent('s1', 'b2');
      branchesServiceMock.getById.mockReturnValue(of(mockBranchInactive));
      schoolsServiceMock.getById.mockReturnValue(of(mockSchool));

      const fixture = await createFixture();
      await loadBranch(fixture);

      const content = fixture.nativeElement.textContent;
      expect(content).toContain('Activar');
    });
  });

  // ======================================================================
  //  TAB NAVIGATION
  // ======================================================================
  describe('tab navigation', () => {
    async function loadAndGetFixture() {
      setupComponent();
      branchesServiceMock.getById.mockReturnValue(of(mockBranch));
      schoolsServiceMock.getById.mockReturnValue(of(mockSchool));

      const fixture = await createFixture();
      await fixture.whenStable();
      fixture.detectChanges();
      return fixture;
    }

    it('should render all 3 tabs', async () => {
      const fixture = await loadAndGetFixture();
      const content = fixture.nativeElement.textContent;
      expect(content).toContain('Información');
      expect(content).toContain('Académico');
      expect(content).toContain('Usuarios');
    });

    it('should show Información tab content by default', async () => {
      const fixture = await loadAndGetFixture();
      const content = fixture.nativeElement.textContent;
      expect(content).toContain('Información General');
    });

    it('should switch to Académico tab and show placeholder', async () => {
      const fixture = await loadAndGetFixture();

      const tabs: NodeListOf<Element> = fixture.nativeElement.querySelectorAll('.tab-item');
      const academicoTab = Array.from(tabs).find(
        (el) => (el as HTMLElement).textContent?.includes('Académico'),
      ) as HTMLElement | undefined;
      if (academicoTab) {
        academicoTab.click();
        fixture.detectChanges();
      }

      const content = fixture.nativeElement.textContent;
      expect(content).toContain('Grupos, horarios y matrículas');
      expect(content).toContain('próximamente');
    });

    it('should switch to Usuarios tab and show placeholder', async () => {
      const fixture = await loadAndGetFixture();

      const tabs: NodeListOf<Element> = fixture.nativeElement.querySelectorAll('.tab-item');
      const usuariosTab = Array.from(tabs).find(
        (el) => (el as HTMLElement).textContent?.includes('Usuarios'),
      ) as HTMLElement | undefined;
      if (usuariosTab) {
        usuariosTab.click();
        fixture.detectChanges();
      }

      const content = fixture.nativeElement.textContent;
      expect(content).toContain('Usuarios asignados a esta sede');
      expect(content).toContain('próximamente');
    });
  });

  // ======================================================================
  //  INFORMACIÓN TAB
  // ======================================================================
  describe('Información tab', () => {
    it('should display branch info fields', async () => {
      setupComponent();
      branchesServiceMock.getById.mockReturnValue(of(mockBranch));
      schoolsServiceMock.getById.mockReturnValue(of(mockSchool));

      const fixture = await createFixture();
      await fixture.whenStable();
      fixture.detectChanges();

      const content = fixture.nativeElement.textContent;
      expect(content).toContain('Nombre');
      expect(content).toContain('Sede Principal');
      expect(content).toContain('Código');
      expect(content).toContain('SED-001');
      expect(content).toContain('Nombre Corto');
      expect(content).toContain('PRINCIPAL');
      expect(content).toContain('Tipo');
      expect(content).toContain('MAIN');
      expect(content).toContain('Email');
      expect(content).toContain('principal@csp.edu.co');
      expect(content).toContain('Teléfono');
      expect(content).toContain('+57 601 1111111');
    });

    it('should display administrative info fields', async () => {
      setupComponent();
      branchesServiceMock.getById.mockReturnValue(of(mockBranch));
      schoolsServiceMock.getById.mockReturnValue(of(mockSchool));

      const fixture = await createFixture();
      await fixture.whenStable();
      fixture.detectChanges();

      const content = fixture.nativeElement.textContent;
      expect(content).toContain('Dirección');
      expect(content).toContain('Calle 123 #45-67');
      expect(content).toContain('Ciudad');
      expect(content).toContain('Bogotá');
      expect(content).toContain('País');
      expect(content).toContain('Colombia');
      expect(content).toContain('Fecha creación');
    });

    it('should show dash for missing optional fields', async () => {
      setupComponent();
      branchesServiceMock.getById.mockReturnValue(of({ ...mockBranch, email: '', phone: '' }));
      schoolsServiceMock.getById.mockReturnValue(of(mockSchool));

      const fixture = await createFixture();
      await fixture.whenStable();
      fixture.detectChanges();

      const content = fixture.nativeElement.textContent;
      expect(content).toContain('—');
    });
  });

  // ======================================================================
  //  DATA FETCHING
  // ======================================================================
  describe('data fetching', () => {
    it('should call BranchesService.getById with correct schoolId and branchId', async () => {
      setupComponent();
      branchesServiceMock.getById.mockReturnValue(of(mockBranch));
      schoolsServiceMock.getById.mockReturnValue(of(mockSchool));

      const fixture = await createFixture();
      await fixture.whenStable();

      expect(branchesServiceMock.getById).toHaveBeenCalledWith('s1', 'b1');
    });

    it('should call SchoolsService.getById for breadcrumb context', async () => {
      setupComponent();
      branchesServiceMock.getById.mockReturnValue(of(mockBranch));
      schoolsServiceMock.getById.mockReturnValue(of(mockSchool));

      const fixture = await createFixture();
      await fixture.whenStable();

      expect(schoolsServiceMock.getById).toHaveBeenCalledWith('s1');
    });
  });
});
