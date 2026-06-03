import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { App } from './app';

describe('App', () => {
  async function createFixture() {
    return TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
      ],
    }).createComponent(App);
  }

  it('should create the app component without errors', async () => {
    const fixture = await createFixture();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render a router-outlet element', async () => {
    const fixture = await createFixture();
    fixture.detectChanges();
    const outlet = fixture.nativeElement.querySelector('router-outlet');
    expect(outlet).toBeTruthy();
  });

  it('should not render a mat-toolbar element', async () => {
    const fixture = await createFixture();
    fixture.detectChanges();
    const toolbar = fixture.nativeElement.querySelector('mat-toolbar');
    expect(toolbar).toBeFalsy();
  });
});
