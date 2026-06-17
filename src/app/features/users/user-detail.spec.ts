import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { ActivatedRoute } from '@angular/router';
import { of, throwError, Observable, BehaviorSubject } from 'rxjs';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { UsersService } from './services/users';
import { MembershipsService } from './memberships/services/memberships';
import { AuthService } from '../../core/services/auth';
import { UserProfile } from './models/user-profile';
import { Membership } from './memberships/models/membership';
import { User } from '../../core/models/user';
import { UserDetailComponent } from './user-detail';

describe('UserDetailComponent', () => {
  let usersServiceMock: { getById: ReturnType<typeof vi.fn>; changeStatus: ReturnType<typeof vi.fn> };
  let membershipsServiceMock: { getByUser: ReturnType<typeof vi.fn> };
  let dialogMock: { open: ReturnType<typeof vi.fn> };
  let authServiceMock: { user: ReturnType<typeof vi.fn> };
  let paramsSubject: BehaviorSubject<{ id: string }>;

  const mockUser: UserProfile = {
    id: 'u1',
    username: 'alice',
    email: 'alice@logicedu.com',
    fullName: 'Alice Johnson',
    status: 'ACTIVE',
    createdAt: '2026-06-01T12:00:00Z',
    role: 'TEACHER',
  };

  const mockMemberships: Membership[] = [
    { id: 'm1', userId: 'u1', role: 'TEACHER', scopeType: 'SCHOOL', scopeRefId: 's1', active: true },
    { id: 'm2', userId: 'u1', role: 'STUDENT', scopeType: 'SCHOOL', scopeRefId: 's2', active: false },
    { id: 'm3', userId: 'u1', role: 'SCHOOL_ADMIN', scopeType: 'SCHOOL', scopeRefId: 's3', active: true },
  ];

  const mockAuthUser: User = {
    id: 'u2',
    email: 'bob@logicedu.com',
    username: 'bob',
    fullName: 'Bob Smith',
    roles: ['PLATFORM_ADMIN'],
    token: 'mock-token',
  };

  function setupComponent(userId: string = 'u1') {
    usersServiceMock = { getById: vi.fn(), changeStatus: vi.fn() };
    membershipsServiceMock = { getByUser: vi.fn().mockReturnValue(of([])) };
    dialogMock = {
      open: vi.fn().mockReturnValue({ afterClosed: () => of(undefined) } as Partial<MatDialogRef<unknown>>),
    };
    authServiceMock = { user: vi.fn().mockReturnValue(null) };
    paramsSubject = new BehaviorSubject({ id: userId });

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [UserDetailComponent],
      providers: [
        provideRouter([]),
        provideAnimationsAsync(),
        { provide: UsersService, useValue: usersServiceMock },
        { provide: MembershipsService, useValue: membershipsServiceMock },
        { provide: AuthService, useValue: authServiceMock },
        {
          provide: ActivatedRoute,
          useValue: { params: paramsSubject.asObservable() },
        },
        { provide: MatDialog, useValue: dialogMock },
      ],
    });
  }

  async function createFixture() {
    const fixture = await TestBed.createComponent(UserDetailComponent);
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
    it('should show loading indicator while fetching user', async () => {
      setupComponent();
      usersServiceMock.getById.mockReturnValue(new Observable());

      const fixture = await createFixture();
      const content = fixture.nativeElement.textContent;
      expect(content).toContain('Cargando');
    });

    it('should hide loading after user data resolves', async () => {
      setupComponent();
      usersServiceMock.getById.mockReturnValue(of(mockUser));

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
    it('should show "User not found" on 404', async () => {
      setupComponent();
      usersServiceMock.getById.mockReturnValue(throwError(() => ({ status: 404 })));

      const fixture = await createFixture();
      await fixture.whenStable();
      fixture.detectChanges();

      const content = fixture.nativeElement.textContent;
      expect(content).toContain('Usuario no encontrado');
    });

    it('should show error message with retry button on network failure', async () => {
      setupComponent();
      usersServiceMock.getById.mockReturnValue(throwError(() => ({ status: 0 })));

      const fixture = await createFixture();
      await fixture.whenStable();
      fixture.detectChanges();

      const content = fixture.nativeElement.textContent;
      expect(content).toContain('Error al cargar usuario');
      expect(content).toContain('Reintentar');
    });
  });

  // ======================================================================
  //  HEADER CARD
  // ======================================================================
  describe('header card', () => {
    async function loadUser(fixture: any) {
      await fixture.whenStable();
      fixture.detectChanges();
    }

    it('should render breadcrumb with back link', async () => {
      setupComponent();
      usersServiceMock.getById.mockReturnValue(of(mockUser));

      const fixture = await createFixture();
      await loadUser(fixture);

      const content = fixture.nativeElement.textContent;
      expect(content).toContain('Usuarios');
    });

    it('should render user full name prominently', async () => {
      setupComponent();
      usersServiceMock.getById.mockReturnValue(of(mockUser));

      const fixture = await createFixture();
      await loadUser(fixture);

      const content = fixture.nativeElement.textContent;
      expect(content).toContain('Alice Johnson');
    });

    it('should render username as secondary text', async () => {
      setupComponent();
      usersServiceMock.getById.mockReturnValue(of(mockUser));

      const fixture = await createFixture();
      await loadUser(fixture);

      const content = fixture.nativeElement.textContent;
      expect(content).toContain('alice');
    });

    it('should render role badge when user has a role', async () => {
      setupComponent();
      usersServiceMock.getById.mockReturnValue(of(mockUser));

      const fixture = await createFixture();
      await loadUser(fixture);

      const content = fixture.nativeElement.textContent;
      expect(content).toContain('TEACHER');
    });

    it('should render status badge', async () => {
      setupComponent();
      usersServiceMock.getById.mockReturnValue(of(mockUser));

      const fixture = await createFixture();
      await loadUser(fixture);

      const content = fixture.nativeElement.textContent;
      expect(content).toContain('ACTIVE');
    });

    it('should show initials avatar', async () => {
      setupComponent();
      usersServiceMock.getById.mockReturnValue(of(mockUser));

      const fixture = await createFixture();
      await loadUser(fixture);

      const content = fixture.nativeElement.textContent;
      expect(content).toContain('AJ');
    });

    it('should render action buttons row', async () => {
      setupComponent();
      usersServiceMock.getById.mockReturnValue(of(mockUser));

      const fixture = await createFixture();
      await loadUser(fixture);

      const content = fixture.nativeElement.textContent;
      expect(content).toContain('Editar');
      expect(content).toContain('Reset Password');
    });

    it('should show Bloquear button when user is ACTIVE', async () => {
      setupComponent();
      usersServiceMock.getById.mockReturnValue(of({ ...mockUser, status: 'ACTIVE' }));

      const fixture = await createFixture();
      await loadUser(fixture);

      const content = fixture.nativeElement.textContent;
      expect(content).toContain('Bloquear');
    });

    it('should show Desbloquear button when user is BLOCKED', async () => {
      setupComponent();
      usersServiceMock.getById.mockReturnValue(of({ ...mockUser, status: 'BLOCKED' }));

      const fixture = await createFixture();
      await loadUser(fixture);

      const content = fixture.nativeElement.textContent;
      expect(content).toContain('Desbloquear');
    });
  });

  // ======================================================================
  //  TAB NAVIGATION
  // ======================================================================
  describe('tab navigation', () => {
    async function loadAndGetFixture() {
      setupComponent();
      usersServiceMock.getById.mockReturnValue(of(mockUser));

      const fixture = await createFixture();
      await fixture.whenStable();
      fixture.detectChanges();
      return fixture;
    }

    it('should render all 5 tabs', async () => {
      const fixture = await loadAndGetFixture();
      const content = fixture.nativeElement.textContent;
      expect(content).toContain('Cuenta');
      expect(content).toContain('Membresías');
      expect(content).toContain('Accesos');
      expect(content).toContain('Actividad');
      expect(content).toContain('Auditoría');
    });

    it('should show Cuenta tab content by default', async () => {
      const fixture = await loadAndGetFixture();
      const content = fixture.nativeElement.textContent;
      expect(content).toContain('Información Personal');
      expect(content).toContain('Información Técnica');
    });

    it('should switch to Membresías tab and show its content', async () => {
      setupComponent();
      usersServiceMock.getById.mockReturnValue(of(mockUser));
      membershipsServiceMock.getByUser.mockReturnValue(of(mockMemberships));

      const fixture = await createFixture();
      await fixture.whenStable();
      fixture.detectChanges();

      const tabs: NodeListOf<Element> = fixture.nativeElement.querySelectorAll('.tab-item');
      const membresiasTab = Array.from(tabs).find(
        (el) => (el as HTMLElement).textContent?.includes('Membresías'),
      ) as HTMLElement | undefined;
      if (membresiasTab) {
        membresiasTab.click();
        fixture.detectChanges();
      }

      const content = fixture.nativeElement.textContent;
      expect(content).toContain('Total Membresías');
    });

    it('should switch to Accesos tab and show placeholder', async () => {
      const fixture = await loadAndGetFixture();

      const tabs: NodeListOf<Element> = fixture.nativeElement.querySelectorAll('.tab-item');
      const accesosTab = Array.from(tabs).find(
        (el) => (el as HTMLElement).textContent?.includes('Accesos'),
      ) as HTMLElement | undefined;
      if (accesosTab) {
        accesosTab.click();
        fixture.detectChanges();
      }

      const content = fixture.nativeElement.textContent;
      expect(content).toContain('Próximamente');
    });

    it('should switch to Actividad tab and show placeholder', async () => {
      const fixture = await loadAndGetFixture();

      const tabs: NodeListOf<Element> = fixture.nativeElement.querySelectorAll('.tab-item');
      const actividadTab = Array.from(tabs).find(
        (el) => (el as HTMLElement).textContent?.includes('Actividad'),
      ) as HTMLElement | undefined;
      if (actividadTab) {
        actividadTab.click();
        fixture.detectChanges();
      }

      const content = fixture.nativeElement.textContent;
      expect(content).toContain('Próximamente');
    });

    it('should switch to Auditoría tab and show placeholder', async () => {
      const fixture = await loadAndGetFixture();

      const tabs: NodeListOf<Element> = fixture.nativeElement.querySelectorAll('.tab-item');
      const auditoriaTab = Array.from(tabs).find(
        (el) => (el as HTMLElement).textContent?.includes('Auditoría'),
      ) as HTMLElement | undefined;
      if (auditoriaTab) {
        auditoriaTab.click();
        fixture.detectChanges();
      }

      const content = fixture.nativeElement.textContent;
      expect(content).toContain('Próximamente');
    });
  });

  // ======================================================================
  //  CUENTA TAB (Tab 1)
  // ======================================================================
  describe('Cuenta tab', () => {
    it('should display personal info fields', async () => {
      setupComponent();
      usersServiceMock.getById.mockReturnValue(of(mockUser));

      const fixture = await createFixture();
      await fixture.whenStable();
      fixture.detectChanges();

      const content = fixture.nativeElement.textContent;
      expect(content).toContain('Nombre completo');
      expect(content).toContain('Alice Johnson');
      expect(content).toContain('alice@logicedu.com');
    });

    it('should display technical info fields', async () => {
      setupComponent();
      usersServiceMock.getById.mockReturnValue(of(mockUser));

      const fixture = await createFixture();
      await fixture.whenStable();
      fixture.detectChanges();

      const content = fixture.nativeElement.textContent;
      expect(content).toContain('ID');
      expect(content).toContain('u1');
      expect(content).toContain('Fecha creación');
      expect(content).toContain('Último login');
    });

    it('should have edit button in Cuenta tab', async () => {
      setupComponent();
      usersServiceMock.getById.mockReturnValue(of(mockUser));

      const fixture = await createFixture();
      await fixture.whenStable();
      fixture.detectChanges();

      const content = fixture.nativeElement.textContent;
      expect(content).toContain('Editar');
    });
  });

  // ======================================================================
  //  MEMBRESÍAS TAB (Tab 2)
  // ======================================================================
  describe('Membresías tab', () => {
    it('should show stat cards with membership counts', async () => {
      setupComponent();
      usersServiceMock.getById.mockReturnValue(of(mockUser));
      membershipsServiceMock.getByUser.mockReturnValue(of(mockMemberships));

      const fixture = await createFixture();
      await fixture.whenStable();
      fixture.detectChanges();

      // Switch to Membresías tab
      const tabs: NodeListOf<Element> = fixture.nativeElement.querySelectorAll('.tab-item');
      const membresiasTab = Array.from(tabs).find(
        (el) => (el as HTMLElement).textContent?.includes('Membresías'),
      ) as HTMLElement | undefined;
      if (membresiasTab) {
        membresiasTab.click();
        fixture.detectChanges();
      }

      const content = fixture.nativeElement.textContent;
      expect(content).toContain('Total Membresías');
      expect(content).toContain('Escuelas asignadas');
      expect(content).toContain('Roles activos');
    });

    it('should call MembershipsService.getByUser with correct userId', async () => {
      setupComponent();
      usersServiceMock.getById.mockReturnValue(of(mockUser));
      membershipsServiceMock.getByUser.mockReturnValue(of(mockMemberships));

      const fixture = await createFixture();
      await fixture.whenStable();
      fixture.detectChanges();

      expect(membershipsServiceMock.getByUser).toHaveBeenCalledWith('u1');
    });

    it('should show membership table rows', async () => {
      setupComponent();
      usersServiceMock.getById.mockReturnValue(of(mockUser));
      membershipsServiceMock.getByUser.mockReturnValue(of(mockMemberships));

      const fixture = await createFixture();
      await fixture.whenStable();
      fixture.detectChanges();

      // Switch to Membresías tab
      const tabs: NodeListOf<Element> = fixture.nativeElement.querySelectorAll('.tab-item');
      const membresiasTab = Array.from(tabs).find(
        (el) => (el as HTMLElement).textContent?.includes('Membresías'),
      ) as HTMLElement | undefined;
      if (membresiasTab) {
        membresiasTab.click();
        fixture.detectChanges();
      }

      const content = fixture.nativeElement.textContent;
      expect(content).toContain('TEACHER');
      expect(content).toContain('SCHOOL_ADMIN');
    });
  });

  // ======================================================================
  //  ACTION DIALOGS
  // ======================================================================
  describe('action dialogs', () => {
    it('should open edit dialog when Edit button is clicked', async () => {
      setupComponent();
      usersServiceMock.getById.mockReturnValue(of(mockUser));

      const fixture = await createFixture();
      await fixture.whenStable();
      fixture.detectChanges();

      const editBtns = Array.from(
        fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLElement>,
      ).filter((el) => el.textContent?.includes('Editar'));

      if (editBtns.length > 0) {
        editBtns[0].click();
        fixture.detectChanges();
      }

      expect(dialogMock.open).toHaveBeenCalled();
    });

    it('should open password dialog when Reset Password button is clicked', async () => {
      setupComponent();
      usersServiceMock.getById.mockReturnValue(of(mockUser));

      const fixture = await createFixture();
      await fixture.whenStable();
      fixture.detectChanges();

      const pwdBtns = Array.from(
        fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLElement>,
      ).filter((el) => el.textContent?.includes('Reset Password'));

      if (pwdBtns.length > 0) {
        pwdBtns[0].click();
        fixture.detectChanges();
      }

      expect(dialogMock.open).toHaveBeenCalled();
    });
  });

  // ======================================================================
  //  USER UPDATE
  // ======================================================================
  describe('user update handler', () => {
    it('should update user signal when onUserUpdated is called', async () => {
      setupComponent();
      usersServiceMock.getById.mockReturnValue(of(mockUser));

      const fixture = await createFixture();
      await fixture.whenStable();
      fixture.detectChanges();

      const component = fixture.componentInstance as UserDetailComponent;
      const updated: UserProfile = { ...mockUser, fullName: 'Alice Updated' };
      component.onUserUpdated(updated);
      fixture.detectChanges();

      const content = fixture.nativeElement.textContent;
      expect(content).toContain('Alice Updated');
    });
  });

  // ======================================================================
  //  BLOCK/UNBLOCK
  // ======================================================================
  describe('block/unblock', () => {
    it('should show confirmation dialog for block action', async () => {
      setupComponent();
      usersServiceMock.getById.mockReturnValue(of({ ...mockUser, status: 'ACTIVE' }));
      usersServiceMock.changeStatus.mockReturnValue(of({ ...mockUser, status: 'BLOCKED' }));

      const fixture = await createFixture();
      await fixture.whenStable();
      fixture.detectChanges();

      const blockBtns = Array.from(
        fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLElement>,
      ).filter((el) => el.textContent?.includes('Bloquear'));

      if (blockBtns.length > 0) {
        blockBtns[0].click();
        fixture.detectChanges();
      }

      const content = fixture.nativeElement.textContent;
      expect(content).toContain('Bloquear usuario');
    });

    it('should call changeStatus on confirm block', async () => {
      setupComponent();
      usersServiceMock.getById.mockReturnValue(of({ ...mockUser, status: 'ACTIVE' }));
      usersServiceMock.changeStatus.mockReturnValue(of({ ...mockUser, status: 'BLOCKED' }));

      const fixture = await createFixture();
      await fixture.whenStable();
      fixture.detectChanges();

      const component = fixture.componentInstance as UserDetailComponent;
      component.confirmBlock();
      await fixture.whenStable();
      fixture.detectChanges();

      expect(usersServiceMock.changeStatus).toHaveBeenCalledWith('u1', { status: 'BLOCKED' });
    });
  });
});
