import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { errorInterceptor } from './error';

function setup(): { client: HttpClient; httpMock: HttpTestingController } {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    providers: [
      provideHttpClient(withInterceptors([errorInterceptor])),
      provideHttpClientTesting(),
    ],
  });
  return {
    client: TestBed.inject(HttpClient),
    httpMock: TestBed.inject(HttpTestingController),
  };
}

function apiError(status: number, message: string, code?: string) {
  return { timestamp: '2026-01-01T00:00:00Z', status, error: 'ERROR', code, message, path: '/test' };
}

describe('ErrorInterceptor', () => {
  it('should resolve code-based message for known error code', () => {
    const { client, httpMock } = setup();

    let caught: Error | null = null;
    client.get('/test').subscribe({ error: (e: Error) => (caught = e) });

    const req = httpMock.expectOne('/test');
    req.flush(apiError(409, 'User already exists', 'USER_ALREADY_EXISTS'), {
      status: 409,
      statusText: 'Conflict',
    });

    expect(caught).toBeTruthy();
    expect(caught!.message).toBe('Ya existe un usuario con ese correo electrónico');
  });

  it('should fall back to backend message when code is unknown', () => {
    const { client, httpMock } = setup();

    let caught: Error | null = null;
    client.get('/test').subscribe({ error: (e: Error) => (caught = e) });

    const req = httpMock.expectOne('/test');
    req.flush(apiError(422, 'Validation failed: name is required'), {
      status: 422,
      statusText: 'Unprocessable',
    });

    expect(caught!.message).toBe('Validation failed: name is required');
  });

  it('should return generic message for 500 when no body', () => {
    const { client, httpMock } = setup();

    let caught: Error | null = null;
    client.get('/test').subscribe({ error: (e: Error) => (caught = e) });

    const req = httpMock.expectOne('/test');
    req.flush(null, { status: 500, statusText: 'Internal Server Error' });

    expect(caught!.message).toBe('Error interno del servidor. Intenta nuevamente más tarde.');
  });

  it('should return session expired for 401', () => {
    const { client, httpMock } = setup();

    let caught: Error | null = null;
    client.get('/test').subscribe({ error: (e: Error) => (caught = e) });

    const req = httpMock.expectOne('/test');
    req.flush(apiError(401, 'Unauthorized'), { status: 401, statusText: 'Unauthorized' });

    expect(caught!.message).toBe('Tu sesión ha expirado, inicia sesión nuevamente.');
  });

  it('should return forbidden for 403', () => {
    const { client, httpMock } = setup();

    let caught: Error | null = null;
    client.get('/test').subscribe({ error: (e: Error) => (caught = e) });

    const req = httpMock.expectOne('/test');
    req.flush(apiError(403, 'Forbidden'), { status: 403, statusText: 'Forbidden' });

    expect(caught!.message).toBe('No tienes permisos para realizar esta acción.');
  });

  it('should return not found for 404', () => {
    const { client, httpMock } = setup();

    let caught: Error | null = null;
    client.get('/test').subscribe({ error: (e: Error) => (caught = e) });

    const req = httpMock.expectOne('/test');
    req.flush(apiError(404, 'Not Found'), { status: 404, statusText: 'Not Found' });

    expect(caught!.message).toBe('El recurso solicitado no fue encontrado.');
  });

  it('should return conflict for 409 without code', () => {
    const { client, httpMock } = setup();

    let caught: Error | null = null;
    client.get('/test').subscribe({ error: (e: Error) => (caught = e) });

    const req = httpMock.expectOne('/test');
    req.flush(apiError(409, 'Conflict'), { status: 409, statusText: 'Conflict' });

    expect(caught!.message).toBe('La operación no puede completarse debido a un conflicto.');
  });

  it('should return connection error for network failure (status 0)', () => {
    const { client, httpMock } = setup();

    let caught: Error | null = null;
    client.get('/test').subscribe({ error: (e: Error) => (caught = e) });

    const req = httpMock.expectOne('/test');
    req.error(new ProgressEvent('network error'));

    expect(caught!.message).toBe('Error de conexión. Verifica tu conexión a internet.');
  });
});
