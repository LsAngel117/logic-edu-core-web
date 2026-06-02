import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { EditBranchDialogComponent } from './edit-branch';
import { Branch } from '../models/branch';

const mockBranch: Branch = {
  id: 'b1',
  schoolId: 's1',
  name: 'Main Campus',
  code: 'MC-001',
  address: '123 Campus Dr',
  status: 'active',
};

function setup() {
  TestBed.configureTestingModule({
    imports: [EditBranchDialogComponent, MatDialogModule, NoopAnimationsModule],
    providers: [
      provideHttpClient(),
      provideHttpClientTesting(),
      { provide: MatDialogRef, useValue: { close: () => {} } },
      { provide: MAT_DIALOG_DATA, useValue: mockBranch },
    ],
  });

  const fixture = TestBed.createComponent(EditBranchDialogComponent);
  const httpMock = TestBed.inject(HttpTestingController);
  fixture.detectChanges();
  return { fixture, httpMock };
}

describe('EditBranchDialogComponent', () => {
  it('should pre-fill form with branch data', () => {
    const { fixture } = setup();
    const component = fixture.componentInstance;
    expect(component.form.controls.name.value).toBe('Main Campus');
    expect(component.form.controls.code.value).toBe('MC-001');
    expect(component.form.controls.address.value).toBe('123 Campus Dr');
  });

  it('should call BranchesService.update() on valid submit', () => {
    const { fixture, httpMock } = setup();
    const component = fixture.componentInstance;

    component.form.patchValue({
      name: 'Main Campus Updated',
      code: 'MC-001',
      address: '456 New St',
    });
    component.onSubmit();

    const req = httpMock.expectOne('/api/v1/branches/b1');
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({
      name: 'Main Campus Updated',
      code: 'MC-001',
      address: '456 New St',
    });
    req.flush({ ...mockBranch, name: 'Main Campus Updated', address: '456 New St' });
  });

  it('should show error on 409 conflict', async () => {
    const { fixture, httpMock } = setup();
    const component = fixture.componentInstance;

    component.form.patchValue({ name: 'Duplicate', code: 'DUP-001', address: '123 Main St' });
    component.onSubmit();

    const req = httpMock.expectOne('/api/v1/branches/b1');
    req.flush('Conflict', { status: 409, statusText: 'Conflict' });

    await fixture.whenStable();

    expect(component.errorMessage()).toContain('already exists');
  });

  it('should show error on 404 (branch gone)', async () => {
    const { fixture, httpMock } = setup();
    const component = fixture.componentInstance;

    component.form.patchValue({ name: 'Updated', code: 'MC-001', address: '123 Main St' });
    component.onSubmit();

    const req = httpMock.expectOne('/api/v1/branches/b1');
    req.flush('Not Found', { status: 404, statusText: 'Not Found' });

    await fixture.whenStable();

    expect(component.errorMessage()).toContain('no longer exists');
  });

  it('should not submit when form is invalid', () => {
    const { fixture, httpMock } = setup();
    const component = fixture.componentInstance;

    component.form.patchValue({ name: '', code: '', address: '' });
    component.onSubmit();

    httpMock.expectNone('/api/v1/branches/b1');
  });

  it('should show error on network failure', async () => {
    const { fixture, httpMock } = setup();
    const component = fixture.componentInstance;

    component.form.patchValue({ name: 'Updated', code: 'MC-001', address: '123 Main St' });
    component.onSubmit();

    httpMock.expectOne('/api/v1/branches/b1').error(new ProgressEvent('error'));

    await fixture.whenStable();

    expect(component.errorMessage()).toContain('Failed to update');
  });
});
