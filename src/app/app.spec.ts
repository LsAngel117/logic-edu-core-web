import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { App } from './app';

describe('App', () => {
  async function createFixture() {
    return TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideAnimationsAsync(),
      ],
    }).createComponent(App);
  }

  it('should create the app component without errors', async () => {
    const fixture = await createFixture();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render a mat-toolbar with the title "LogicEdu"', async () => {
    const fixture = await createFixture();
    fixture.detectChanges();
    const toolbar = fixture.nativeElement.querySelector('mat-toolbar');
    expect(toolbar).toBeTruthy();
    expect(toolbar.textContent).toContain('LogicEdu');
  });

  it('should contain a router-outlet element', async () => {
    const fixture = await createFixture();
    fixture.detectChanges();
    const outlet = fixture.nativeElement.querySelector('router-outlet');
    expect(outlet).toBeTruthy();
  });

  it('should set primary color on the mat-toolbar', async () => {
    const fixture = await createFixture();
    fixture.detectChanges();
    const toolbar = fixture.nativeElement.querySelector('mat-toolbar');
    expect(toolbar.getAttribute('color')).toBe('primary');
  });
});
