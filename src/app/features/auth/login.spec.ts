import { TestBed } from '@angular/core/testing';
import { LoginComponent } from './login';

describe('LoginComponent', () => {
  it('should render a paragraph with "login works"', async () => {
    const fixture = await TestBed.createComponent(LoginComponent);
    fixture.detectChanges();
    const p = fixture.nativeElement.querySelector('p');
    expect(p).toBeTruthy();
    expect(p.textContent).toContain('login works');
  });

  it('should be creatable', async () => {
    const fixture = await TestBed.createComponent(LoginComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
