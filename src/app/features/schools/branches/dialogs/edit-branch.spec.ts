import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { EditBranch } from './edit-branch';
import { BranchResponse } from '../models/branch';

const mockBranch: BranchResponse = {
  id: 'b1',
  schoolId: 's1',
  name: 'Main Campus',
  code: 'MC-001',
  shortName: 'Main',
  description: 'Main campus branch',
  email: 'campus@school.edu',
  phone: '1234567890',
  address: '123 Campus Dr',
  city: 'Springfield',
  country: 'USA',
  type: 'MAIN',
  status: 'ACTIVE',
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};

function setup() {
  TestBed.configureTestingModule({
    imports: [EditBranch],
    providers: [
      provideHttpClient(),
      provideHttpClientTesting(),
    ],
  });

  const fixture = TestBed.createComponent(EditBranch);
  fixture.componentRef.setInput('branchData', mockBranch);
  const httpMock = TestBed.inject(HttpTestingController);
  fixture.detectChanges();
  return { fixture, httpMock };
}

describe('EditBranch', () => {
  it('should pre-fill form with branch data', () => {
    const { fixture } = setup();
    const component = fixture.componentInstance;
    expect(component.form.controls.name.value).toBe('Main Campus');
    expect(component.form.controls.code.value).toBe('MC-001');
    expect(component.form.controls.shortName.value).toBe('Main');
    expect(component.form.controls.description.value).toBe('Main campus branch');
    expect(component.form.controls.email.value).toBe('campus@school.edu');
    expect(component.form.controls.phone.value).toBe('1234567890');
    expect(component.form.controls.address.value).toBe('123 Campus Dr');
    expect(component.form.controls.city.value).toBe('Springfield');
    expect(component.form.controls.country.value).toBe('USA');
  });

  it('should call BranchesService.update() on valid submit', () => {
    const { fixture, httpMock } = setup();
    const component = fixture.componentInstance;

    component.form.patchValue({
      name: 'Main Campus Updated',
      code: 'MC-001',
      shortName: 'Main',
      description: 'Updated desc',
      email: 'updated@school.edu',
      phone: '9876543210',
      address: '456 New St',
      city: 'Shelbyville',
      country: 'CAN',
    });
    component.onSubmit();

    const req = httpMock.expectOne('/api/v1/schools/s1/branches/b1');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({
      name: 'Main Campus Updated',
      code: 'MC-001',
      shortName: 'Main',
      description: 'Updated desc',
      email: 'updated@school.edu',
      phone: '9876543210',
      address: '456 New St',
      city: 'Shelbyville',
      country: 'CAN',
    });
    req.flush({ ...mockBranch, name: 'Main Campus Updated', address: '456 New St' });
  });

  it('should show error on 409 conflict', async () => {
    const { fixture, httpMock } = setup();
    const component = fixture.componentInstance;

    component.form.patchValue({ name: 'Duplicate', code: 'DUP-001', shortName: 'Dup', address: 'addr' });
    component.onSubmit();

    const req = httpMock.expectOne('/api/v1/schools/s1/branches/b1');
    req.flush('Conflict', { status: 409, statusText: 'Conflict' });

    await fixture.whenStable();

    expect(component.errorMessage()).toContain('already exists');
  });

  it('should show error on 404 (branch gone)', async () => {
    const { fixture, httpMock } = setup();
    const component = fixture.componentInstance;

    component.form.patchValue({ name: 'Updated', code: 'MC-001', shortName: 'Main', address: 'addr' });
    component.onSubmit();

    const req = httpMock.expectOne('/api/v1/schools/s1/branches/b1');
    req.flush('Not Found', { status: 404, statusText: 'Not Found' });

    await fixture.whenStable();

    expect(component.errorMessage()).toContain('no longer exists');
  });

  it('should not submit when form is invalid', () => {
    const { fixture, httpMock } = setup();
    const component = fixture.componentInstance;

    component.form.patchValue({ name: '', code: '', shortName: '', address: '' });
    component.onSubmit();

    httpMock.expectNone('/api/v1/schools/s1/branches/b1');
  });

  it('should show error on network failure', async () => {
    const { fixture, httpMock } = setup();
    const component = fixture.componentInstance;

    component.form.patchValue({ name: 'Updated', code: 'MC-001', shortName: 'Main', address: 'addr' });
    component.onSubmit();

    httpMock.expectOne('/api/v1/schools/s1/branches/b1').error(new ProgressEvent('error'));

    await fixture.whenStable();

    expect(component.errorMessage()).toContain('Failed to update');
  });

  it('should close dialog and emit saved on successful update', async () => {
    const { fixture, httpMock } = setup();
    const component = fixture.componentInstance;

    component.visible.set(true);
    fixture.detectChanges();

    let emitted: BranchResponse | undefined;
    component.saved.subscribe((b) => (emitted = b));

    component.form.patchValue({ name: 'Success', code: 'SUC-001', shortName: 'Suc', address: 'addr' });
    component.onSubmit();

    const req = httpMock.expectOne('/api/v1/schools/s1/branches/b1');
    const updated = { ...mockBranch, name: 'Success' };
    req.flush(updated);

    await fixture.whenStable();

    expect(component.visible()).toBe(false);
    expect(emitted?.name).toBe('Success');
  });
});
