import { TestBed } from '@angular/core/testing';
import { DashboardComponent } from './dashboard';

describe('DashboardComponent', () => {
  it('should render a paragraph with "dashboard works"', async () => {
    const fixture = await TestBed.createComponent(DashboardComponent);
    fixture.detectChanges();
    const p = fixture.nativeElement.querySelector('p');
    expect(p).toBeTruthy();
    expect(p.textContent).toContain('dashboard works');
  });

  it('should be creatable', async () => {
    const fixture = await TestBed.createComponent(DashboardComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
