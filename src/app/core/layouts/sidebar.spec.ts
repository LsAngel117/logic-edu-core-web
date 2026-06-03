import { describe, it, expect, vi } from 'vitest';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { signal } from '@angular/core';
import { AuthService } from '../../core/services/auth';
import { User } from '../../core/models/user';
import { Sidebar } from './sidebar';

@Component({ template: '', standalone: true })
class DummyComponent {}

const PLATFORM_ADMIN_USER: User = {
  id: 'usr_admin',
  email: 'admin@logicedu.com',
  username: 'admin',
  fullName: 'Platform Admin',
  roles: ['PLATFORM_ADMIN'],
  token: 'jwt.admin',
};

const SCHOOL_ADMIN_USER: User = {
  id: 'usr_school',
  email: 'school@logicedu.com',
  username: 'schooladmin',
  fullName: 'School Admin',
  roles: ['SCHOOL_ADMIN'],
  token: 'jwt.school',
};

const TEACHER_USER: User = {
  id: 'usr_teacher',
  email: 'teacher@logicedu.com',
  username: 'teacher',
  fullName: 'Docente Uno',
  roles: ['TEACHER'],
  token: 'jwt.teacher',
};

const STUDENT_USER: User = {
  id: 'usr_student',
  email: 'student@logicedu.com',
  username: 'student',
  fullName: 'Alumno Uno',
  roles: ['STUDENT'],
  token: 'jwt.student',
};

describe('Sidebar', () => {
  function setupComponent(user: User | null) {
    const authMock = {
      user: signal(user),
      logout: vi.fn(),
      token: signal(user?.token ?? null),
      isAuthenticated: signal(user !== null),
    };

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [Sidebar],
      providers: [
        provideRouter([
          { path: 'dashboard', component: DummyComponent },
          { path: 'users', component: DummyComponent },
          { path: 'schools', component: DummyComponent },
        ]),
        provideAnimationsAsync(),
        { provide: AuthService, useValue: authMock },
      ],
    });

    return { authMock };
  }

  async function createFixture() {
    const fixture = await TestBed.createComponent(Sidebar);
    fixture.detectChanges();
    return fixture;
  }

  describe('role-based nav items', () => {
    it('should render all three nav items for PLATFORM_ADMIN', async () => {
      setupComponent(PLATFORM_ADMIN_USER);
      const fixture = await createFixture();

      const navLinks = fixture.nativeElement.querySelectorAll('[data-testid="nav-item"]');
      expect(navLinks.length).toBe(3);

      const labels = Array.from(navLinks).map((el) => (el as Element).textContent?.trim());
      expect(labels).toContain('Dashboard');
      expect(labels).toContain('Usuarios');
      expect(labels).toContain('Instituciones');
    });

    it('should render all three nav items for SCHOOL_ADMIN', async () => {
      setupComponent(SCHOOL_ADMIN_USER);
      const fixture = await createFixture();

      const navLinks = fixture.nativeElement.querySelectorAll('[data-testid="nav-item"]');
      expect(navLinks.length).toBe(3);
    });

    it('should render only Dashboard for TEACHER', async () => {
      setupComponent(TEACHER_USER);
      const fixture = await createFixture();

      const navLinks = fixture.nativeElement.querySelectorAll('[data-testid="nav-item"]');
      expect(navLinks.length).toBe(1);
      expect(navLinks[0].textContent?.trim()).toBe('Dashboard');
    });

    it('should render only Dashboard for STUDENT', async () => {
      setupComponent(STUDENT_USER);
      const fixture = await createFixture();

      const navLinks = fixture.nativeElement.querySelectorAll('[data-testid="nav-item"]');
      expect(navLinks.length).toBe(1);
      expect(navLinks[0].textContent?.trim()).toBe('Dashboard');
    });

    it('should render only Dashboard when user has no roles', async () => {
      const noRolesUser: User = { ...TEACHER_USER, roles: [] };
      setupComponent(noRolesUser);
      const fixture = await createFixture();

      const navLinks = fixture.nativeElement.querySelectorAll('[data-testid="nav-item"]');
      expect(navLinks.length).toBe(1);
      expect(navLinks[0].textContent?.trim()).toBe('Dashboard');
    });

    it('should render only Dashboard when user is null', async () => {
      setupComponent(null);
      const fixture = await createFixture();

      const navLinks = fixture.nativeElement.querySelectorAll('[data-testid="nav-item"]');
      expect(navLinks.length).toBe(1);
      expect(navLinks[0].textContent?.trim()).toBe('Dashboard');
    });
  });

  describe('collapsed state', () => {
    it('should show labels when not collapsed', async () => {
      setupComponent(PLATFORM_ADMIN_USER);
      const fixture = await createFixture();

      const labels = fixture.nativeElement.querySelectorAll('[data-testid="nav-label"]');
      expect(labels.length).toBe(3);
      labels.forEach((label: Element) => {
        expect(label.textContent).toBeTruthy();
      });
    });

    it('should hide labels visually when collapsed', async () => {
      setupComponent(PLATFORM_ADMIN_USER);
      const fixture = await TestBed.createComponent(Sidebar);
      fixture.componentRef.setInput('collapsed', true);
      fixture.detectChanges();

      // Labels exist in DOM but the sidebar should have collapsed class
      const sidebarEl = fixture.nativeElement.querySelector('[data-testid="sidebar"]');
      expect(sidebarEl.classList.contains('collapsed')).toBe(true);
    });
  });

  describe('toggle button', () => {
    it('should render a toggle button', async () => {
      setupComponent(PLATFORM_ADMIN_USER);
      const fixture = await createFixture();

      const toggleBtn = fixture.nativeElement.querySelector('[data-testid="collapse-toggle"]');
      expect(toggleBtn).toBeTruthy();
    });

    it('should emit toggleCollapsed when toggle button is clicked', async () => {
      setupComponent(PLATFORM_ADMIN_USER);
      const fixture = await TestBed.createComponent(Sidebar);
      fixture.detectChanges();

      let emitted = false;
      (fixture.componentInstance as unknown as Sidebar).toggleCollapsed.subscribe(() => {
        emitted = true;
      });

      const toggleBtn = fixture.nativeElement.querySelector('[data-testid="collapse-toggle"]') as HTMLElement;
      toggleBtn.click();
      fixture.detectChanges();

      expect(emitted).toBe(true);
    });
  });

  describe('active route', () => {
    it('should mark the active route with a highlight class', async () => {
      setupComponent(PLATFORM_ADMIN_USER);
      const fixture = await createFixture();

      const router = TestBed.inject(Router);
      await router.navigate(['/dashboard']);
      fixture.detectChanges();

      const activeItems = fixture.nativeElement.querySelectorAll('[data-testid="nav-item"].active');
      expect(activeItems.length).toBe(1);
    });
  });

  describe('footer', () => {
    it('should show version footer when expanded', async () => {
      setupComponent(PLATFORM_ADMIN_USER);
      const fixture = await createFixture();
      fixture.detectChanges();

      const footer = fixture.nativeElement.querySelector('[data-testid="sidebar-footer"]');
      expect(footer).toBeTruthy();
      expect(footer.textContent).toContain('v1.0');
    });
  });

  describe('tooltip', () => {
    it('should show tooltip on nav items when collapsed', async () => {
      setupComponent(PLATFORM_ADMIN_USER);
      const fixture = await createFixture();
      fixture.componentRef.setInput('collapsed', true);
      fixture.detectChanges();

      const navItem = fixture.nativeElement.querySelector('[data-testid="nav-item"]');
      expect(navItem.getAttribute('title')).toContain('Dashboard');
    });
  });
});
