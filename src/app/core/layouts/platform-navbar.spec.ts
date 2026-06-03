import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { signal } from '@angular/core';
import { AuthService } from '../../core/services/auth';
import { User } from '../../core/models/user';
import { PlatformNavbar } from './platform-navbar';

const ADMIN_USER: User = {
  id: 'usr_001',
  email: 'admin@logicedu.com',
  username: 'admin',
  fullName: 'Admin User',
  roles: ['PLATFORM_ADMIN'],
  token: 'jwt.mock',
};

const NON_ADMIN_USER: User = {
  id: 'usr_002',
  email: 'teacher@logicedu.com',
  username: 'teacher',
  fullName: 'Teacher User',
  roles: ['TEACHER'],
  token: 'jwt.mock',
};

describe('PlatformNavbar', () => {
  function setupComponent(user: User | null) {
    const authMock = {
      user: signal(user),
      logout: () => {},
      token: signal(user?.token ?? null),
      isAuthenticated: signal(user !== null),
    };

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [PlatformNavbar],
      providers: [
        provideAnimationsAsync(),
        { provide: AuthService, useValue: authMock },
      ],
    });

    return { authMock };
  }

  async function createFixture() {
    const fixture = await TestBed.createComponent(PlatformNavbar);
    fixture.detectChanges();
    return fixture;
  }

  it('should show navbar when user has PLATFORM_ADMIN role', async () => {
    setupComponent(ADMIN_USER);
    const fixture = await createFixture();

    const navbar = fixture.nativeElement.querySelector('[data-testid="platform-navbar"]');
    expect(navbar).toBeTruthy();
  });

  it('should hide navbar when user does NOT have PLATFORM_ADMIN role', async () => {
    setupComponent(NON_ADMIN_USER);
    const fixture = await createFixture();

    const navbar = fixture.nativeElement.querySelector('[data-testid="platform-navbar"]');
    expect(navbar).toBeFalsy();
  });

  it('should hide navbar when user is null (not authenticated)', async () => {
    setupComponent(null);
    const fixture = await createFixture();

    const navbar = fixture.nativeElement.querySelector('[data-testid="platform-navbar"]');
    expect(navbar).toBeFalsy();
  });

  it('should render module chips when navbar is visible', async () => {
    setupComponent(ADMIN_USER);
    const fixture = await createFixture();

    const chipUsuarios = fixture.nativeElement.querySelector('[data-testid="chip-Usuarios"]');
    const chipInstituciones = fixture.nativeElement.querySelector('[data-testid="chip-Instituciones"]');
    const chipAcademico = fixture.nativeElement.querySelector('[data-testid="chip-Académico"]');
    const chipSistema = fixture.nativeElement.querySelector('[data-testid="chip-Sistema"]');

    expect(chipUsuarios).toBeTruthy();
    expect(chipUsuarios.textContent.trim()).toBe('Usuarios');
    expect(chipInstituciones).toBeTruthy();
    expect(chipInstituciones.textContent.trim()).toBe('Instituciones');
    expect(chipAcademico).toBeTruthy();
    expect(chipAcademico.textContent.trim()).toBe('Académico');
    expect(chipSistema).toBeTruthy();
    expect(chipSistema.textContent.trim()).toBe('Sistema');
  });

  it('should render search input with placeholder when navbar is visible', async () => {
    setupComponent(ADMIN_USER);
    const fixture = await createFixture();

    const searchInput = fixture.nativeElement.querySelector('[data-testid="search-input"]') as HTMLInputElement;
    expect(searchInput).toBeTruthy();
    expect(searchInput.placeholder).toBe('Buscar en el sistema...');
  });

  it('should render notification bell icon when navbar is visible', async () => {
    setupComponent(ADMIN_USER);
    const fixture = await createFixture();

    const bellIcon = fixture.nativeElement.querySelector('[data-testid="notification-bell"]');
    expect(bellIcon).toBeTruthy();
  });
});
