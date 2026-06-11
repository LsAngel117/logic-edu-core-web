import { describe, it, expect } from 'vitest';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { Sidebar } from './sidebar';
import { NavItem } from './nav-items';

@Component({ template: '', standalone: true })
class DummyComponent {}

const FULL_NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', icon: 'layout-dashboard', route: '/dashboard' },
  { label: 'Usuarios', icon: 'users', route: '/users', roles: ['PLATFORM_ADMIN', 'SCHOOL_ADMIN'] },
  { label: 'Instituciones', icon: 'building-2', route: '/schools', roles: ['PLATFORM_ADMIN', 'SCHOOL_ADMIN'] },
];

const DASHBOARD_ONLY: NavItem[] = [
  { label: 'Dashboard', icon: 'layout-dashboard', route: '/dashboard' },
];

describe('Sidebar', () => {
  function setupComponent() {
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
      ],
    });
  }

  async function createFixture(navItems: NavItem[] = []) {
    const fixture = await TestBed.createComponent(Sidebar);
    fixture.componentRef.setInput('navItems', navItems);
    fixture.detectChanges();
    return fixture;
  }

  describe('role-based nav items', () => {
    it('should render all three nav items when passed full set', async () => {
      setupComponent();
      const fixture = await createFixture(FULL_NAV_ITEMS);

      const navLinks = fixture.nativeElement.querySelectorAll('[data-testid="nav-item"]');
      expect(navLinks.length).toBe(3);

      const labels = Array.from(navLinks).map((el) => (el as Element).textContent?.trim());
      expect(labels).toContain('Dashboard');
      expect(labels).toContain('Usuarios');
      expect(labels).toContain('Instituciones');
    });

    it('should render all three nav items when passed full set (second check)', async () => {
      setupComponent();
      const fixture = await createFixture(FULL_NAV_ITEMS);

      const navLinks = fixture.nativeElement.querySelectorAll('[data-testid="nav-item"]');
      expect(navLinks.length).toBe(3);
    });

    it('should render only Dashboard when passed single item', async () => {
      setupComponent();
      const fixture = await createFixture(DASHBOARD_ONLY);

      const navLinks = fixture.nativeElement.querySelectorAll('[data-testid="nav-item"]');
      expect(navLinks.length).toBe(1);
      expect(navLinks[0].textContent?.trim()).toBe('Dashboard');
    });

    it('should render only Dashboard when passed empty-restricted set', async () => {
      setupComponent();
      const fixture = await createFixture(DASHBOARD_ONLY);

      const navLinks = fixture.nativeElement.querySelectorAll('[data-testid="nav-item"]');
      expect(navLinks.length).toBe(1);
      expect(navLinks[0].textContent?.trim()).toBe('Dashboard');
    });

    it('should render no items when passed empty array', async () => {
      setupComponent();
      const fixture = await createFixture([]);

      const navLinks = fixture.nativeElement.querySelectorAll('[data-testid="nav-item"]');
      expect(navLinks.length).toBe(0);
    });

    it('should render no items when passed default (empty)', async () => {
      setupComponent();
      const fixture = await createFixture();

      const navLinks = fixture.nativeElement.querySelectorAll('[data-testid="nav-item"]');
      expect(navLinks.length).toBe(0);
    });
  });

  describe('collapsed state', () => {
    it('should show labels when not collapsed', async () => {
      setupComponent();
      const fixture = await createFixture(FULL_NAV_ITEMS);

      const labels = fixture.nativeElement.querySelectorAll('[data-testid="nav-label"]');
      expect(labels.length).toBe(3);
      labels.forEach((label: Element) => {
        expect(label.textContent).toBeTruthy();
      });
    });

    it('should hide labels visually when collapsed', async () => {
      setupComponent();
      const fixture = await TestBed.createComponent(Sidebar);
      fixture.componentRef.setInput('navItems', FULL_NAV_ITEMS);
      fixture.detectChanges();

      // Simulate collapsed mode via internal signal
      const instance = fixture.componentInstance as unknown as Sidebar;
      instance.mode.set('collapsed');
      fixture.detectChanges();

      const sidebarEl = fixture.nativeElement.querySelector('[data-testid="sidebar"]');
      expect(sidebarEl.classList.contains('collapsed')).toBe(true);
    });
  });

  describe('toggle button', () => {
    it('should render a toggle button', async () => {
      setupComponent();
      const fixture = await createFixture(FULL_NAV_ITEMS);

      const toggleBtn = fixture.nativeElement.querySelector('[data-testid="collapse-toggle"]');
      expect(toggleBtn).toBeTruthy();
    });

    it('should emit widthChange when toggle button is clicked', async () => {
      setupComponent();
      const fixture = await TestBed.createComponent(Sidebar);
      fixture.componentRef.setInput('navItems', FULL_NAV_ITEMS);
      fixture.detectChanges();

      let emitted = false;
      (fixture.componentInstance as unknown as Sidebar).widthChange.subscribe(() => {
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
      setupComponent();
      const fixture = await createFixture(FULL_NAV_ITEMS);

      const router = TestBed.inject(Router);
      await router.navigate(['/dashboard']);
      fixture.detectChanges();

      const activeItems = fixture.nativeElement.querySelectorAll('[data-testid="nav-item"].active');
      expect(activeItems.length).toBe(1);
    });
  });

  describe('footer', () => {
    it('should show version footer when expanded', async () => {
      setupComponent();
      const fixture = await createFixture(FULL_NAV_ITEMS);
      fixture.detectChanges();

      const footer = fixture.nativeElement.querySelector('[data-testid="sidebar-footer"]');
      expect(footer).toBeTruthy();
      expect(footer.textContent).toContain('v1.0');
    });
  });

  describe('tooltip', () => {
    it('should show tooltip on nav items when collapsed', async () => {
      setupComponent();
      const fixture = await TestBed.createComponent(Sidebar);
      fixture.componentRef.setInput('navItems', FULL_NAV_ITEMS);
      fixture.detectChanges();

      // Simulate collapsed mode
      const instance = fixture.componentInstance as unknown as Sidebar;
      instance.mode.set('collapsed');
      fixture.detectChanges();

      const navItem = fixture.nativeElement.querySelector('[data-testid="nav-item"]');
      expect(navItem.getAttribute('title')).toContain('Dashboard');
    });
  });

  describe('dynamic navItems input', () => {
    it('should render nav items passed via input instead of computing from AuthService', async () => {
      setupComponent();
      const fixture = await TestBed.createComponent(Sidebar);
      const testItems: NavItem[] = [
        { label: 'Test Page', icon: 'layout-dashboard', route: '/test' },
        { label: 'Settings', icon: 'users', route: '/settings' },
      ];
      fixture.componentRef.setInput('navItems', testItems);
      fixture.detectChanges();

      const navLinks = fixture.nativeElement.querySelectorAll('[data-testid="nav-item"]');
      expect(navLinks.length).toBe(2);
      expect(navLinks[0].textContent?.trim()).toBe('Test Page');
      expect(navLinks[1].textContent?.trim()).toBe('Settings');
    });
  });
});
