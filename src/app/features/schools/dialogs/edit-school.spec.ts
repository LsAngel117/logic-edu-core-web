import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { EditSchool } from './edit-school';
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
  city: 'Springfield',
  country: 'USA',
  status: 'ACTIVE',
  createdAt: '2026-01-01T00:00:00Z',
};

function setup() {
  TestBed.configureTestingModule({
    imports: [EditSchool],
    providers: [
      provideHttpClient(),
      provideHttpClientTesting(),
    ],
  });

  const fixture = TestBed.createComponent(EditSchool);
  fixture.componentRef.setInput('schoolData', mockSchool);
  const httpMock = TestBed.inject(HttpTestingController);
  fixture.detectChanges();
  return { fixture, httpMock };
}

describe('EditSchool', () => {
  it('should pre-fill form with school data', () => {
    const { fixture } = setup();
    const component = fixture.componentInstance;
    expect(component.form.controls.name.value).toBe('North Academy');
    expect(component.form.controls.code.value).toBe('NAC-001');
    expect(component.form.controls.shortName.value).toBe('North');
    expect(component.form.controls.description.value).toBe('A school of excellence');
    expect(component.form.controls.email.value).toBe('north@school.edu');
    expect(component.form.controls.phone.value).toBe('1234567890');
    expect(component.form.controls.address.value).toBe('123 Main St');
    expect(component.form.controls.city.value).toBe('Springfield');
    expect(component.form.controls.country.value).toBe('USA');
  });

  it('should call SchoolsService.update() on valid submit', () => {
    const { fixture, httpMock } = setup();
    const component = fixture.componentInstance;

    component.form.patchValue({
      name: 'Updated Academy',
      code: 'UPD-001',
      shortName: 'Upd',
      description: 'Updated desc',
      email: 'updated@school.edu',
      phone: '9876543210',
      address: '456 New St',
      city: 'Shelbyville',
      country: 'CAN',
    });
    component.onSubmit();

    const req = httpMock.expectOne('/api/v1/schools/s1');
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({
      name: 'Updated Academy',
      code: 'UPD-001',
      shortName: 'Upd',
      description: 'Updated desc',
      email: 'updated@school.edu',
      phone: '9876543210',
      address: '456 New St',
      city: 'Shelbyville',
      country: 'CAN',
    });
    req.flush({ ...mockSchool, name: 'Updated Academy', address: '456 New St' });
  });

  it('should show error on 409 conflict', async () => {
    const { fixture, httpMock } = setup();
    const component = fixture.componentInstance;

    component.form.patchValue({ name: 'Duplicate', code: 'DUP-001', shortName: 'Dup', address: 'addr' });
    component.onSubmit();

    const req = httpMock.expectOne('/api/v1/schools/s1');
    req.flush('Conflict', { status: 409, statusText: 'Conflict' });

    await fixture.whenStable();

    expect(component.errorMessage()).toContain('already exists');
  });

  it('should show error on 404 (school gone)', async () => {
    const { fixture, httpMock } = setup();
    const component = fixture.componentInstance;

    component.form.patchValue({ name: 'Updated', code: 'NAC-001', shortName: 'North', address: 'addr' });
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

    component.form.patchValue({ name: 'Updated', code: 'NAC-001', shortName: 'North', address: 'addr' });
    component.onSubmit();

    httpMock.expectOne('/api/v1/schools/s1').error(new ProgressEvent('error'));

    await fixture.whenStable();

    expect(component.errorMessage()).toContain('Failed to update');
  });

  it('should close dialog and emit saved on successful update', async () => {
    const { fixture, httpMock } = setup();
    const component = fixture.componentInstance;

    // Set visible to true for dialog testing
    component.visible.set(true);
    fixture.detectChanges();

    let emitted: School | undefined;
    component.saved.subscribe((s) => (emitted = s));

    component.form.patchValue({ name: 'Success', code: 'SUC-001', shortName: 'Suc', address: 'addr' });
    component.onSubmit();

    const req = httpMock.expectOne('/api/v1/schools/s1');
    const updated = { ...mockSchool, name: 'Success' };
    req.flush(updated);

    await fixture.whenStable();

    expect(component.visible()).toBe(false);
    expect(emitted?.name).toBe('Success');
  });
});
