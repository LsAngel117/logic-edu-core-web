import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { EditUser } from './edit-user';
import { UserProfile } from '../models/user-profile';

const mockUser: UserProfile = {
  id: 'usr_1',
  email: 'test@logicedu.com',
  displayName: 'Test User',
  status: 'active',
  roles: ['TEACHER'],
  createdAt: '2026-01-01T00:00:00Z',
};

function setup() {
  TestBed.configureTestingModule({
    imports: [EditUser, MatDialogModule, NoopAnimationsModule],
    providers: [
      provideHttpClient(),
      provideHttpClientTesting(),
      { provide: MatDialogRef, useValue: { close: () => {} } },
      { provide: MAT_DIALOG_DATA, useValue: mockUser },
    ],
  });

  const fixture = TestBed.createComponent(EditUser);
  const httpMock = TestBed.inject(HttpTestingController);
  fixture.detectChanges();
  return { fixture, httpMock };
}

describe('EditUser', () => {
  it('should pre-fill form with user data', () => {
    const { fixture } = setup();
    const component = fixture.componentInstance;
    expect(component.form.controls.email.value).toBe('test@logicedu.com');
    expect(component.form.controls.displayName.value).toBe('Test User');
    expect(component.form.controls.roles.value).toBe('TEACHER');
  });

  it('should call UsersService.update() with roles on valid submit', () => {
    const { fixture, httpMock } = setup();
    const component = fixture.componentInstance;

    component.form.patchValue({
      email: 'updated@logicedu.com',
      displayName: 'Updated',
      roles: 'TEACHER, ADMIN',
    });
    component.onSubmit();

    const req = httpMock.expectOne('/api/v1/users/usr_1');
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({
      email: 'updated@logicedu.com',
      displayName: 'Updated',
      roles: ['TEACHER', 'ADMIN'],
    });
    req.flush({ ...mockUser, email: 'updated@logicedu.com', displayName: 'Updated', roles: ['TEACHER', 'ADMIN'] });
  });

  it('should show error on 409 conflict', async () => {
    const { fixture, httpMock } = setup();
    const component = fixture.componentInstance;

    component.form.patchValue({ email: 'duplicate@logicedu.com', displayName: 'Updated', roles: 'TEACHER' });
    component.onSubmit();

    const req = httpMock.expectOne('/api/v1/users/usr_1');
    req.flush('Conflict', { status: 409, statusText: 'Conflict' });

    await fixture.whenStable();

    expect(component.errorMessage()).toContain('already exists');
  });

  it('should show error on 404 (user gone)', async () => {
    const { fixture, httpMock } = setup();
    const component = fixture.componentInstance;

    component.form.patchValue({ email: 'updated@logicedu.com', displayName: 'Updated', roles: 'TEACHER' });
    component.onSubmit();

    const req = httpMock.expectOne('/api/v1/users/usr_1');
    req.flush('Not Found', { status: 404, statusText: 'Not Found' });

    await fixture.whenStable();

    expect(component.errorMessage()).toContain('no longer exists');
  });

  it('should show error on network failure', async () => {
    const { fixture, httpMock } = setup();
    const component = fixture.componentInstance;

    component.form.patchValue({ email: 'updated@logicedu.com', displayName: 'Updated', roles: 'TEACHER' });
    component.onSubmit();

    httpMock.expectOne('/api/v1/users/usr_1').error(new ProgressEvent('error'));

    await fixture.whenStable();

    expect(component.errorMessage()).toContain('Failed to update');
  });

  it('should not submit when form is invalid', () => {
    const { fixture, httpMock } = setup();
    const component = fixture.componentInstance;

    component.form.patchValue({ email: '', displayName: '', roles: '' });
    component.onSubmit();

    httpMock.expectNone('/api/v1/users/usr_1');
  });
});
