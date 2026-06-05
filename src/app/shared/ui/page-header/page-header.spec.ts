import { describe, it, expect } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { Component, signal } from '@angular/core';
import { PageHeader } from './page-header';

/** Test host to project content into the action slot */
@Component({
  standalone: true,
  imports: [PageHeader],
  template: `
    <app-page-header [title]="hostTitle" [description]="hostDesc">
      @if (hostShowAction) {
        <button data-testid="action-btn">Crear</button>
      }
    </app-page-header>
  `,
})
class TestHost {
  hostTitle = 'Usuarios';
  hostDesc = 'Administra los usuarios del sistema';
  hostShowAction = true;
}

describe('PageHeader', () => {
  function setupComponent(title: string, desc: string): ComponentFixture<PageHeader> {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [PageHeader],
      providers: [provideAnimationsAsync()],
    });

    const fixtureRef = TestBed.createComponent(PageHeader);
    fixtureRef.componentRef.setInput('title', title);
    fixtureRef.componentRef.setInput('description', desc);
    fixtureRef.detectChanges();
    return fixtureRef;
  }

  function setupHost(
    title: string,
    desc: string,
    showAction: boolean = true,
  ): ComponentFixture<TestHost> {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [TestHost],
      providers: [provideAnimationsAsync()],
    });

    const fixtureRef = TestBed.createComponent(TestHost);
    fixtureRef.componentInstance.hostTitle = title;
    fixtureRef.componentInstance.hostDesc = desc;
    fixtureRef.componentInstance.hostShowAction = showAction;
    fixtureRef.detectChanges();
    return fixtureRef;
  }

  it('should render the title as h1 with correct text', () => {
    const fixture = setupComponent('Usuarios', 'Administra los usuarios del sistema');

    const titleEl = fixture.nativeElement.querySelector('h1');
    expect(titleEl).toBeTruthy();
    expect(titleEl.textContent.trim()).toBe('Usuarios');
  });

  it('should render description when provided', () => {
    const fixture = setupComponent('Usuarios', 'Administra los usuarios del sistema');

    const descEl = fixture.nativeElement.querySelector('[data-testid="page-header-description"]');
    expect(descEl).toBeTruthy();
    expect(descEl.textContent.trim()).toBe('Administra los usuarios del sistema');
  });

  it('should hide description element when description is empty', () => {
    const fixture = setupComponent('Usuarios', '');

    const descEl = fixture.nativeElement.querySelector('[data-testid="page-header-description"]');
    expect(descEl).toBeNull();
  });

  it('should render projected action content in the action slot', () => {
    const fixture = setupHost('Usuarios', 'Administra', true);

    const actionBtn = fixture.nativeElement.querySelector('[data-testid="action-btn"]');
    expect(actionBtn).toBeTruthy();
    expect(actionBtn.textContent.trim()).toBe('Crear');
  });

  it('should not render action slot content when not projected', () => {
    const fixture = setupHost('Usuarios', 'Administra', false);

    const actionBtn = fixture.nativeElement.querySelector('[data-testid="action-btn"]');
    expect(actionBtn).toBeNull();
  });
});
