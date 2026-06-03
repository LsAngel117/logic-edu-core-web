import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { EditSchoolDialogComponent } from './edit-school';
import { School } from '../models/school';

const mockSchool: School = {
  id: 's1',
  name: 'North Academy',
  code: 'NAC-001',
  shortName: 'North',
  description: 'A school of excellence',
  email: 'north@school.edu',
  phone: '1234567890',
  address: '123 Main St',
  status: 'ACTIVE',
  createdAt: '2026-01-01T00:00:00Z',
};

function setup() {
  TestBed.configureTestingModule({
    imports: [EditSchoolDialogComponent, MatDialogModule, NoopAnimationsModule],
    providers: [
      provideHttpClient(),
      provideHttpClientTesting(),
      { provide: MatDialogRef, useValue: { close: () => {} } },
      { provide: MAT_DIALOG_DATA, useValue: mockSchool },
    ],
  });

  const fixture = TestBed.createComponent(EditSchoolDialogComponent);
  const httpMock = TestBed.inject(HttpTestingController);
  fixture.detectChanges();
  return { fixture, httpMock };
}

describe('EditSchoolDialogComponent', () => {
  it('should pre-fill form with school data', () => {
    const { fixture } = setup();
    const component = fixture.componentInstance;
    expect(component.form.controls.name.value).toBe('North Academy');
    expect(component.form.controls.code.value).toBe('NAC-001');
    expect(component.form.controls.shortName.value).toBe('North');
    expect(component.form.controls.address.value).toBe('123 Main St');
  });

  it('should call SchoolsService.update() on valid submit', () => {
    const { fixture, httpMock } = setup();
    const component = fixture.componentInstance;

    component.form.patchValue({
      name: 'North Academy Updated',
      code: 'NAC-001',
      shortName: 'North',
      address: '456 New St',
    });
    component.onSubmit();

    const req = httpMock.expectOne('/api/v1/schools/s1');
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({
      name: 'North Academy Updated',
      code: 'NAC-001',
      shortName: 'North',
      address: '456 New St',
    });
    req.flush({ ...mockSchool, name: 'North Academy Updated', address: '456 New St' });
  });

  it('should show error on 409 conflict', async () => {
    const { fixture, httpMock } = setup();
    const component = fixture.componentInstance;

    component.form.patchValue({ name: 'Duplicate Name', code: 'NAC-001', shortName: 'North', address: '123 Main St' });
    component.onSubmit();

    const req = httpMock.expectOne('/api/v1/schools/s1');
    req.flush('Conflict', { status: 409, statusText: 'Conflict' });

    await fixture.whenStable();

    expect(component.errorMessage()).toContain('already exists');
  });

  it('should show error on 404 (school gone)', async () => {
    const { fixture, httpMock } = setup();
    const component = fixture.componentInstance;

    component.form.patchValue({ name: 'Updated', code: 'NAC-001', shortName: 'North', address: '123 Main St' });
    component.onSubmit();

    const req = httpMock.expectOne('/api/v1/schools/s1');
    req.flush('Not Found', { status: 404, statusText: 'Not Found' });

    await fixture.whenStable();

    expect(component.errorMessage()).toContain('no longer exists');
  });

  it('should not submit when form is invalid', () => {
    const { fixture, httpMock } = setup();
    const component = fixture.componentInstance;

    component.form.patchValue({ name: '', code: '', shortName: '', address: '' });
    component.onSubmit();

    httpMock.expectNone('/api/v1/schools/s1');
  });

  it('should show error on network failure', async () => {
    const { fixture, httpMock } = setup();
    const component = fixture.componentInstance;

    component.form.patchValue({ name: 'Updated', code: 'NAC-001', shortName: 'North', address: '123 Main St' });
    component.onSubmit();

    httpMock.expectOne('/api/v1/schools/s1').error(new ProgressEvent('error'));

    await fixture.whenStable();

    expect(component.errorMessage()).toContain('Failed to update');
  });
});
