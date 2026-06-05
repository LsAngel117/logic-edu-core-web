import { describe, it, expect } from 'vitest';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { TopNavBar } from './top-navbar';

interface Section {
  id: string;
  label: string;
  icon: string;
}

const MOCK_SECTIONS: Section[] = [
  { id: 'dashboard', label: 'Dashboard', icon: 'layout-dashboard' },
  { id: 'admin', label: 'Administración', icon: 'shield' },
  { id: 'config', label: 'Configuraciones', icon: 'settings' },
  { id: 'tools', label: 'Herramientas', icon: 'wrench' },
  { id: 'reports', label: 'Reportes', icon: 'bar-chart-3' },
];

@Component({ template: '', standalone: true })
class DummyComponent {}

describe('TopNavBar', () => {
  function setupComponent() {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [TopNavBar],
      providers: [
        provideRouter([{ path: '', component: DummyComponent }]),
      ],
    });
  }

  async function createFixture(sections: Section[], activeSection = 'dashboard') {
    const fixture = await TestBed.createComponent(TopNavBar);
    fixture.componentRef.setInput('sections', sections);
    fixture.componentRef.setInput('activeSection', activeSection);
    fixture.detectChanges();
    return fixture;
  }

  it('should render all section tabs', async () => {
    setupComponent();
    const fixture = await createFixture(MOCK_SECTIONS);

    const tabs = fixture.nativeElement.querySelectorAll('[data-testid="topnav-tab"]');
    expect(tabs.length).toBe(MOCK_SECTIONS.length);
    expect(tabs[0].textContent?.trim()).toContain('Dashboard');
    expect(tabs[1].textContent?.trim()).toContain('Administración');
    expect(tabs[4].textContent?.trim()).toContain('Reportes');
  });

  it('should mark the active tab with an active class', async () => {
    setupComponent();
    const fixture = await createFixture(MOCK_SECTIONS, 'config');

    const activeTabs = fixture.nativeElement.querySelectorAll('[data-testid="topnav-tab"].active');
    expect(activeTabs.length).toBe(1);
    expect(activeTabs[0].textContent?.trim()).toContain('Configuraciones');
  });

  it('should render the LogicEdu branding logo text', async () => {
    setupComponent();
    const fixture = await createFixture(MOCK_SECTIONS);

    const branding = fixture.nativeElement.querySelector('[data-testid="topnav-branding"]');
    expect(branding).toBeTruthy();
    expect(branding.textContent).toContain('LogicEdu Core');
  });

  it('should change active section when a different tab is provided', async () => {
    setupComponent();
    const fixture = await createFixture(MOCK_SECTIONS, 'tools');

    const activeTabs = fixture.nativeElement.querySelectorAll('[data-testid="topnav-tab"].active');
    expect(activeTabs.length).toBe(1);
    expect(activeTabs[0].textContent?.trim()).toContain('Herramientas');
  });

  it('should show admin avatar and notification bell area', async () => {
    setupComponent();
    const fixture = await createFixture(MOCK_SECTIONS);

    const userArea = fixture.nativeElement.querySelector('[data-testid="topnav-user-area"]');
    expect(userArea).toBeTruthy();

    const bell = fixture.nativeElement.querySelector('[data-testid="topnav-bell"]');
    expect(bell).toBeTruthy();
  });

  it('should update activeSection model when a tab is clicked', async () => {
    setupComponent();
    const fixture = await createFixture(MOCK_SECTIONS, 'dashboard');

    const tabs = fixture.nativeElement.querySelectorAll('[data-testid="topnav-tab"]');
    const adminTab = tabs[1] as HTMLElement;
    adminTab.click();
    fixture.detectChanges();

    expect(fixture.componentInstance.activeSection()).toBe('admin');

    const activeTabs = fixture.nativeElement.querySelectorAll('[data-testid="topnav-tab"].active');
    expect(activeTabs.length).toBe(1);
    expect(activeTabs[0].textContent?.trim()).toContain('Administración');
  });
});
