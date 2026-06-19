import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { EditUser } from './edit-user';
import { UserProfile } from '../models/user-profile';

const mockUser: UserProfile = {
  id: 'usr_1',
  username: 'testuser',
  email: 'test@logicedu.com',
  fullName: 'Test User',
  status: 'ACTIVE',
  createdAt: '2026-01-01T00:00:00Z',
};

function setup() {
  TestBed.configureTestingModule({
    imports: [EditUser],
    providers: [
      provideHttpClient(),
      provideHttpClientTesting(),
    ],
  });

  const fixture = TestBed.createComponent(EditUser);
  fixture.componentRef.setInput('userData', mockUser);
  const httpMock = TestBed.inject(HttpTestingController);
  fixture.detectChanges();
  return { fixture, httpMock };
}

describe('EditUser', () => {
  it('should pre-fill form with user data', () => {
    const { fixture } = setup();
    const component = fixture.componentInstance;
    expect(component.form.controls.email.value).toBe('test@logicedu.com');
    expect(component.form.controls.firstGivenName.value).toBe('Test');
    expect(component.form.controls.firstFamilyName.value).toBe('User');
  });

  it('should call UsersService.update() on valid submit', () => {
    const { fixture, httpMock } = setup();
    const component = fixture.componentInstance;

    component.form.patchValue({
      email: 'updated@logicedu.com',
      firstGivenName: 'Updated',
      firstFamilyName: 'Name',
    });
    component.onSubmit();

    const req = httpMock.expectOne('/api/v1/users/usr_1');
    expect(req.request.method).toBe('PATCH');
    const body = req.request.body as Record<string, unknown>;
    expect(body['email']).toBe('updated@logicedu.com');
    expect(body['firstGivenName']).toBe('Updated');
    expect(body['firstFamilyName']).toBe('Name');
    req.flush({ ...mockUser, email: 'updated@logicedu.com', fullName: 'Updated Name' });
  });

  it('should show error on 409 conflict', async () => {
    const { fixture, httpMock } = setup();
    const component = fixture.componentInstance;

    component.form.patchValue({ email: 'duplicate@logicedu.com', firstGivenName: 'Updated' });
    component.onSubmit();

    const req = httpMock.expectOne('/api/v1/users/usr_1');
    req.flush('Conflict', { status: 409, statusText: 'Conflict' });

    await fixture.whenStable();

    expect(component.errorMessage()).toContain('already exists');
  });

  it('should show error on 404 (user gone)', async () => {
    const { fixture, httpMock } = setup();
    const component = fixture.componentInstance;

    component.form.patchValue({ email: 'updated@logicedu.com', firstGivenName: 'Updated' });
    component.onSubmit();

    const req = httpMock.expectOne('/api/v1/users/usr_1');
    req.flush('Not Found', { status: 404, statusText: 'Not Found' });

    await fixture.whenStable();

    expect(component.errorMessage()).toContain('no longer exists');
  });

  it('should show error on network failure', async () => {
    const { fixture, httpMock } = setup();
    const component = fixture.componentInstance;

    component.form.patchValue({ email: 'updated@logicedu.com', firstGivenName: 'Updated' });
    component.onSubmit();

    httpMock.expectOne('/api/v1/users/usr_1').error(new ProgressEvent('error'));

    await fixture.whenStable();

    expect(component.errorMessage()).toContain('Failed to update');
  });

  it('should not submit when form is invalid', () => {
    const { fixture, httpMock } = setup();
    const component = fixture.componentInstance;

    component.form.patchValue({ email: '', firstGivenName: '' });
    component.onSubmit();

    httpMock.expectNone('/api/v1/users/usr_1');
  });
});
