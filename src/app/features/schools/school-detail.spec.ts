import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { ActivatedRoute } from '@angular/router';
import { of, throwError, Observable, BehaviorSubject } from 'rxjs';
import { SchoolsService } from './services/schools';
import { BranchesService } from './branches/services/branches';
import { School } from './models/school';
import { BranchResponse } from './branches/models/branch';
import { SchoolDetail } from './school-detail';

describe('SchoolDetail', () => {
  let schoolsServiceMock: {
    getById: ReturnType<typeof vi.fn>;
    updateStatus: ReturnType<typeof vi.fn>;
    getAll: ReturnType<typeof vi.fn>;
  };
  let branchesServiceMock: {
    getBySchool: ReturnType<typeof vi.fn>;
  };
  let paramsSubject: BehaviorSubject<{ id: string }>;

  const mockSchool: School = {
    id: 's1',
    name: 'Colegio San Patricio',
    code: 'CSP-001',
    shortName: 'CSP',
    description: 'Institución educativa de excelencia',
    email: 'info@csp.edu.co',
    phone: '+57 601 2345678',
    address: 'Calle 123 #45-67',
    city: 'Bogotá',
    country: 'Colombia',
    status: 'ACTIVE' as const,
    createdAt: '2026-01-15T12:00:00Z',
  };

  const mockInactiveSchool: School = {
    ...mockSchool,
    id: 's2',
    name: 'Instituto Cerrado',
    code: 'IC-001',
    status: 'INACTIVE',
  };

  const mockBranches: BranchResponse[] = [
    {
      id: 'b1',
      schoolId: 's1',
      name: 'Sede Principal',
      code: 'SED-001',
      shortName: 'PRINCIPAL',
      description: 'Sede principal',
      email: 'principal@csp.edu.co',
      phone: '+57 601 1111111',
      address: 'Calle 123 #45-67',
      city: 'Bogotá',
      country: 'Colombia',
      type: 'MAIN',
      status: 'ACTIVE',
      createdAt: '2026-01-15T12:00:00Z',
      updatedAt: '2026-01-15T12:00:00Z',
    },
    {
      id: 'b2',
      schoolId: 's1',
      name: 'Sede Norte',
      code: 'SED-002',
      shortName: 'NORTE',
      description: 'Sede norte',
      email: 'norte@csp.edu.co',
      phone: '+57 601 2222222',
      address: 'Cra 45 #67-89',
      city: 'Bogotá',
      country: 'Colombia',
      type: 'SECONDARY',
      status: 'ACTIVE',
      createdAt: '2026-02-01T12:00:00Z',
      updatedAt: '2026-06-01T12:00:00Z',
    },
    {
      id: 'b3',
      schoolId: 's1',
      name: 'Sede Virtual',
      code: 'SED-003',
      shortName: 'VIRTUAL',
      description: 'Sede virtual',
      email: 'virtual@csp.edu.co',
      phone: '+57 601 3333333',
      address: '',
      type: 'VIRTUAL',
      status: 'INACTIVE',
      createdAt: '2026-03-01T12:00:00Z',
      updatedAt: '2026-03-01T12:00:00Z',
    },
  ];

  function setupComponent(schoolId: string = 's1') {
    schoolsServiceMock = {
      getById: vi.fn(),
      updateStatus: vi.fn(),
      getAll: vi.fn().mockReturnValue(of([])),
    };
    branchesServiceMock = {
      getBySchool: vi.fn().mockReturnValue(of([])),
    };
    paramsSubject = new BehaviorSubject({ id: schoolId });

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [SchoolDetail],
      providers: [
        provideRouter([]),
        provideAnimationsAsync(),
        { provide: SchoolsService, useValue: schoolsServiceMock },
        { provide: BranchesService, useValue: branchesServiceMock },
        {
          provide: ActivatedRoute,
          useValue: { params: paramsSubject.asObservable() },
        },
      ],
    });
  }

  async function createFixture() {
    const fixture = await TestBed.createComponent(SchoolDetail);
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
    it('should show loading indicator while fetching school', async () => {
      setupComponent();
      schoolsServiceMock.getById.mockReturnValue(new Observable());

      const fixture = await createFixture();
      const content = fixture.nativeElement.textContent;
      expect(content).toContain('Cargando');
    });

    it('should hide loading after school data resolves', async () => {
      setupComponent();
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
    it('should show "Institución no encontrada" on 404', async () => {
      setupComponent();
      schoolsServiceMock.getById.mockReturnValue(throwError(() => ({ status: 404 })));

      const fixture = await createFixture();
      await fixture.whenStable();
      fixture.detectChanges();

      const content = fixture.nativeElement.textContent;
      expect(content).toContain('Institución no encontrada');
    });

    it('should show error message with retry button on network failure', async () => {
      setupComponent();
      schoolsServiceMock.getById.mockReturnValue(throwError(() => ({ status: 0 })));

      const fixture = await createFixture();
      await fixture.whenStable();
      fixture.detectChanges();

      const content = fixture.nativeElement.textContent;
      expect(content).toContain('Error al cargar institución');
      expect(content).toContain('Reintentar');
    });
  });

  // ======================================================================
  //  HEADER CARD
  // ======================================================================
  describe('header card', () => {
    async function loadSchool(fixture: any) {
      await fixture.whenStable();
      fixture.detectChanges();
    }

    it('should render breadcrumb with back link', async () => {
      setupComponent();
      schoolsServiceMock.getById.mockReturnValue(of(mockSchool));

      const fixture = await createFixture();
      await loadSchool(fixture);

      const content = fixture.nativeElement.textContent;
      expect(content).toContain('Instituciones');
    });

    it('should render school name prominently', async () => {
      setupComponent();
      schoolsServiceMock.getById.mockReturnValue(of(mockSchool));

      const fixture = await createFixture();
      await loadSchool(fixture);

      const content = fixture.nativeElement.textContent;
      expect(content).toContain('Colegio San Patricio');
    });

    it('should render school code as secondary text', async () => {
      setupComponent();
      schoolsServiceMock.getById.mockReturnValue(of(mockSchool));

      const fixture = await createFixture();
      await loadSchool(fixture);

      const content = fixture.nativeElement.textContent;
      expect(content).toContain('CSP-001');
    });

    it('should show initials avatar from school name', async () => {
      setupComponent();
      schoolsServiceMock.getById.mockReturnValue(of(mockSchool));

      const fixture = await createFixture();
      await loadSchool(fixture);

      const content = fixture.nativeElement.textContent;
      expect(content).toContain('CS');
    });

    it('should render status badge with ACTIVE text', async () => {
      setupComponent();
      schoolsServiceMock.getById.mockReturnValue(of(mockSchool));

      const fixture = await createFixture();
      await loadSchool(fixture);

      const content = fixture.nativeElement.textContent;
      expect(content).toContain('ACTIVE');
    });

    it('should render status badge with INACTIVE text when inactive', async () => {
      setupComponent('s2');
      schoolsServiceMock.getById.mockReturnValue(of(mockInactiveSchool));

      const fixture = await createFixture();
      await loadSchool(fixture);

      const content = fixture.nativeElement.textContent;
      expect(content).toContain('INACTIVE');
    });

    it('should render Editar action button', async () => {
      setupComponent();
      schoolsServiceMock.getById.mockReturnValue(of(mockSchool));

      const fixture = await createFixture();
      await loadSchool(fixture);

      const content = fixture.nativeElement.textContent;
      expect(content).toContain('Editar');
    });

    it('should show Desactivar button when school is ACTIVE', async () => {
      setupComponent();
      schoolsServiceMock.getById.mockReturnValue(of(mockSchool));

      const fixture = await createFixture();
      await loadSchool(fixture);

      const content = fixture.nativeElement.textContent;
      expect(content).toContain('Desactivar');
    });

    it('should show Activar button when school is INACTIVE', async () => {
      setupComponent('s2');
      schoolsServiceMock.getById.mockReturnValue(of(mockInactiveSchool));

      const fixture = await createFixture();
      await loadSchool(fixture);

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
      schoolsServiceMock.getById.mockReturnValue(of(mockSchool));

      const fixture = await createFixture();
      await fixture.whenStable();
      fixture.detectChanges();
      return fixture;
    }

    it('should render all 4 tabs', async () => {
      const fixture = await loadAndGetFixture();
      const content = fixture.nativeElement.textContent;
      expect(content).toContain('Información');
      expect(content).toContain('Sedes');
      expect(content).toContain('Usuarios');
      expect(content).toContain('Académico');
    });

    it('should show Información tab content by default', async () => {
      const fixture = await loadAndGetFixture();
      const content = fixture.nativeElement.textContent;
      expect(content).toContain('Información General');
      expect(content).toContain('Información Administrativa');
    });

    it('should switch to Sedes tab and show its content', async () => {
      setupComponent();
      schoolsServiceMock.getById.mockReturnValue(of(mockSchool));
      branchesServiceMock.getBySchool.mockReturnValue(of(mockBranches));

      const fixture = await createFixture();
      await fixture.whenStable();
      fixture.detectChanges();

      const tabs: NodeListOf<Element> = fixture.nativeElement.querySelectorAll('.tab-item');
      const sedesTab = Array.from(tabs).find(
        (el) => (el as HTMLElement).textContent?.includes('Sedes'),
      ) as HTMLElement | undefined;
      if (sedesTab) {
        sedesTab.click();
        fixture.detectChanges();
      }

      const content = fixture.nativeElement.textContent;
      expect(content).toContain('Total Sedes');
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
      expect(content).toContain('Usuarios de esta institución');
      expect(content).toContain('próximamente');
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
      expect(content).toContain('Estructura académica');
      expect(content).toContain('próximamente');
    });
  });

  // ======================================================================
  //  INFORMACIÓN TAB (Tab 1)
  // ======================================================================
  describe('Información tab', () => {
    it('should display general info fields in left column', async () => {
      setupComponent();
      schoolsServiceMock.getById.mockReturnValue(of(mockSchool));

      const fixture = await createFixture();
      await fixture.whenStable();
      fixture.detectChanges();

      const content = fixture.nativeElement.textContent;
      expect(content).toContain('Nombre');
      expect(content).toContain('Colegio San Patricio');
      expect(content).toContain('Código');
      expect(content).toContain('CSP-001');
      expect(content).toContain('Nombre Corto');
      expect(content).toContain('CSP');
      expect(content).toContain('info@csp.edu.co');
      expect(content).toContain('Teléfono');
    });

    it('should display administrative info fields in right column', async () => {
      setupComponent();
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

    it('should have edit button in Información tab', async () => {
      setupComponent();
      schoolsServiceMock.getById.mockReturnValue(of(mockSchool));

      const fixture = await createFixture();
      await fixture.whenStable();
      fixture.detectChanges();

      const content = fixture.nativeElement.textContent;
      expect(content).toContain('Editar');
    });
  });

  // ======================================================================
  //  SEDES TAB (Tab 2)
  // ======================================================================
  describe('Sedes tab', () => {
    async function switchToSedes(fixture: any) {
      const tabs: NodeListOf<Element> = fixture.nativeElement.querySelectorAll('.tab-item');
      const sedesTab = Array.from(tabs).find(
        (el) => (el as HTMLElement).textContent?.includes('Sedes'),
      ) as HTMLElement | undefined;
      if (sedesTab) {
        sedesTab.click();
        fixture.detectChanges();
      }
    }

    it('should show stat cards with branch counts', async () => {
      setupComponent();
      schoolsServiceMock.getById.mockReturnValue(of(mockSchool));
      branchesServiceMock.getBySchool.mockReturnValue(of(mockBranches));

      const fixture = await createFixture();
      await fixture.whenStable();
      fixture.detectChanges();
      await switchToSedes(fixture);

      const content = fixture.nativeElement.textContent;
      expect(content).toContain('Total Sedes');
      expect(content).toContain('Activas');
      expect(content).toContain('Inactivas');
    });

    it('should call BranchesService.getBySchool with correct schoolId', async () => {
      setupComponent();
      schoolsServiceMock.getById.mockReturnValue(of(mockSchool));
      branchesServiceMock.getBySchool.mockReturnValue(of(mockBranches));

      const fixture = await createFixture();
      await fixture.whenStable();
      fixture.detectChanges();

      expect(branchesServiceMock.getBySchool).toHaveBeenCalledWith('s1');
    });

    it('should show branch table rows', async () => {
      setupComponent();
      schoolsServiceMock.getById.mockReturnValue(of(mockSchool));
      branchesServiceMock.getBySchool.mockReturnValue(of(mockBranches));

      const fixture = await createFixture();
      await fixture.whenStable();
      fixture.detectChanges();
      await switchToSedes(fixture);

      const content = fixture.nativeElement.textContent;
      expect(content).toContain('Sede Principal');
      expect(content).toContain('Sede Norte');
      expect(content).toContain('SED-001');
      expect(content).toContain('SED-002');
    });

    it('should show branch type badges (MAIN, SECONDARY, VIRTUAL)', async () => {
      setupComponent();
      schoolsServiceMock.getById.mockReturnValue(of(mockSchool));
      branchesServiceMock.getBySchool.mockReturnValue(of(mockBranches));

      const fixture = await createFixture();
      await fixture.whenStable();
      fixture.detectChanges();
      await switchToSedes(fixture);

      const content = fixture.nativeElement.textContent;
      expect(content).toContain('MAIN');
      expect(content).toContain('SECONDARY');
      expect(content).toContain('VIRTUAL');
    });

    it('should show "Nueva Sede" button', async () => {
      setupComponent();
      schoolsServiceMock.getById.mockReturnValue(of(mockSchool));
      branchesServiceMock.getBySchool.mockReturnValue(of(mockBranches));

      const fixture = await createFixture();
      await fixture.whenStable();
      fixture.detectChanges();
      await switchToSedes(fixture);

      const content = fixture.nativeElement.textContent;
      expect(content).toContain('Nueva Sede');
    });

    it('should show empty state when no branches', async () => {
      setupComponent();
      schoolsServiceMock.getById.mockReturnValue(of(mockSchool));
      branchesServiceMock.getBySchool.mockReturnValue(of([]));

      const fixture = await createFixture();
      await fixture.whenStable();
      fixture.detectChanges();
      await switchToSedes(fixture);

      const content = fixture.nativeElement.textContent;
      expect(content).toContain('Sin sedes');
    });
  });
});
