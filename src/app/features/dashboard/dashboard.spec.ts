import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { signal } from '@angular/core';
import { AuthService } from '../../core/services/auth';
import { User } from '../../core/models/user';
import { DashboardComponent } from './dashboard';

const MOCK_USER: User = {
  id: 'usr_001',
  email: 'maria@logicedu.com',
  username: 'maria.garcia',
  fullName: 'María García',
  roles: ['TEACHER'],
  token: 'jwt.mock',
};

describe('DashboardComponent', () => {
  function setup(user: User | null) {
    const authMock = {
      user: signal(user),
      token: signal(user?.token ?? null),
      isAuthenticated: signal(user !== null),
    };

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        provideRouter([
          { path: 'users', loadComponent: () => Promise.resolve(DashboardComponent) },
          { path: 'schools', loadComponent: () => Promise.resolve(DashboardComponent) },
        ]),
        { provide: AuthService, useValue: authMock },
      ],
    });

    return { authMock };
  }

  async function createFixture() {
    const fixture = await TestBed.createComponent(DashboardComponent);
    fixture.detectChanges();
    return fixture;
  }

  // --- Welcome Message ---

  it('should render welcome message with user fullName', async () => {
    setup(MOCK_USER);
    const fixture = await createFixture();

    const el = fixture.nativeElement.querySelector('[data-testid="welcome-message"]');
    expect(el).toBeTruthy();
    expect(el.textContent.trim()).toBe('Bienvenido, María García');
  });

  it('should fall back to email when fullName is empty', async () => {
    const userNoName: User = { ...MOCK_USER, fullName: '' };
    setup(userNoName);
    const fixture = await createFixture();

    const el = fixture.nativeElement.querySelector('[data-testid="welcome-message"]');
    expect(el.textContent.trim()).toBe('Bienvenido, maria@logicedu.com');
  });

  it('should fall back to username when fullName and email are empty', async () => {
    const userNoEmail: User = { ...MOCK_USER, fullName: '', email: '' };
    setup(userNoEmail);
    const fixture = await createFixture();

    const el = fixture.nativeElement.querySelector('[data-testid="welcome-message"]');
    expect(el.textContent.trim()).toBe('Bienvenido, maria.garcia');
  });

  it('should show "Usuario" fallback when no name fields are set', async () => {
    const userEmpty: User = { ...MOCK_USER, fullName: '', email: '', username: '' };
    setup(userEmpty);
    const fixture = await createFixture();

    const el = fixture.nativeElement.querySelector('[data-testid="welcome-message"]');
    expect(el.textContent.trim()).toBe('Bienvenido, Usuario');
  });

  // --- Stat Cards ---

  it('should render 3 stat cards', async () => {
    setup(MOCK_USER);
    const fixture = await createFixture();

    const cards = fixture.nativeElement.querySelectorAll('[data-testid="stat-card"]');
    expect(cards.length).toBe(3);
  });

  it('should render stat card for Usuarios with icon, value, and description', async () => {
    setup(MOCK_USER);
    const fixture = await createFixture();

    const cards = fixture.nativeElement.querySelectorAll('[data-testid="stat-card"]');
    const usersCard = cards[0];

    expect(usersCard.querySelector('[data-testid="stat-icon"] svg')).toBeTruthy();
    expect(usersCard.querySelector('[data-testid="stat-value"]').textContent.trim()).toBe('0');
    expect(usersCard.querySelector('[data-testid="stat-label"]').textContent.trim()).toBe('Usuarios');
    expect(usersCard.querySelector('[data-testid="stat-desc"]').textContent.trim()).toBe('Usuarios registrados');
  });

  it('should render stat card for Instituciones with icon, value, and description', async () => {
    setup(MOCK_USER);
    const fixture = await createFixture();

    const cards = fixture.nativeElement.querySelectorAll('[data-testid="stat-card"]');
    const instCard = cards[1];

    expect(instCard.querySelector('[data-testid="stat-icon"] svg')).toBeTruthy();
    expect(instCard.querySelector('[data-testid="stat-value"]').textContent.trim()).toBe('0');
    expect(instCard.querySelector('[data-testid="stat-label"]').textContent.trim()).toBe('Instituciones');
    expect(instCard.querySelector('[data-testid="stat-desc"]').textContent.trim()).toBe('Instituciones activas');
  });

  it('should render stat card for Sedes with icon, value, and description', async () => {
    setup(MOCK_USER);
    const fixture = await createFixture();

    const cards = fixture.nativeElement.querySelectorAll('[data-testid="stat-card"]');
    const sedesCard = cards[2];

    expect(sedesCard.querySelector('[data-testid="stat-icon"] svg')).toBeTruthy();
    expect(sedesCard.querySelector('[data-testid="stat-value"]').textContent.trim()).toBe('0');
    expect(sedesCard.querySelector('[data-testid="stat-label"]').textContent.trim()).toBe('Sedes');
    expect(sedesCard.querySelector('[data-testid="stat-desc"]').textContent.trim()).toBe('Sedes registradas');
  });

  // --- Quick Links ---

  it('should render quick link to /users', async () => {
    setup(MOCK_USER);
    const fixture = await createFixture();

    const link = fixture.nativeElement.querySelector('[data-testid="quick-link-users"]');
    expect(link).toBeTruthy();
    expect(link.tagName).toBe('A');
    expect(link.getAttribute('href')).toBe('/users');
    expect(link.textContent).toContain('Usuarios');
  });

  it('should render quick link to /schools', async () => {
    setup(MOCK_USER);
    const fixture = await createFixture();

    const link = fixture.nativeElement.querySelector('[data-testid="quick-link-schools"]');
    expect(link).toBeTruthy();
    expect(link.tagName).toBe('A');
    expect(link.getAttribute('href')).toBe('/schools');
    expect(link.textContent).toContain('Instituciones');
  });

  // --- Subtitle ---

  it('should render the subtitle "Panel de control"', async () => {
    setup(MOCK_USER);
    const fixture = await createFixture();

    const el = fixture.nativeElement.querySelector('[data-testid="subtitle"]');
    expect(el).toBeTruthy();
    expect(el.textContent.trim()).toBe('Panel de control');
  });

  // --- Edge Cases ---

  it('should render page even when user is null', async () => {
    setup(null);
    const fixture = await createFixture();

    // Welcome should still render with fallback
    const welcome = fixture.nativeElement.querySelector('[data-testid="welcome-message"]');
    expect(welcome).toBeTruthy();
    expect(welcome.textContent.trim()).toBe('Bienvenido, Usuario');

    // Stat cards should still render
    const cards = fixture.nativeElement.querySelectorAll('[data-testid="stat-card"]');
    expect(cards.length).toBe(3);
  });
});
