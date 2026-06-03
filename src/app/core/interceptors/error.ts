import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { ApiError } from '../models/api-error';
import { ERROR_MESSAGES } from '../constants/error-messages';

/**
 * Centralized error interceptor.
 *
 * Transforms HTTP errors into user-friendly messages consumed by UI components.
 * Components no longer need to inspect status codes — they just display `error.message`.
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: unknown) => {
      const friendly = resolveMessage(error);
      return throwError(() => new Error(friendly));
    }),
  );
};

function resolveMessage(error: unknown): string {
  if (!(error instanceof HttpErrorResponse)) {
    return 'Ocurrió un error inesperado';
  }

  // Network / CORS / timeout — no server response
  if (error.status === 0) {
    return 'Error de conexión. Verifica tu conexión a internet.';
  }

  const body = tryParseBody(error);

  // Prefer stable error code for SaaS-style i18n
  if (body?.code && ERROR_MESSAGES[body.code]) {
    return ERROR_MESSAGES[body.code];
  }

  // Fall back to backend's human-readable message (skip generic status texts)
  if (body?.message && !isGenericStatusText(body.message, error.status)) {
    return body.message;
  }

  // Last resort — generic per-status messages
  return genericMessage(error.status);
}

/** Returns true when the message is just the HTTP status text like "Unauthorized". */
function isGenericStatusText(message: string, status: number): boolean {
  const genericTexts: Record<number, string> = {
    400: 'Bad Request',
    401: 'Unauthorized',
    403: 'Forbidden',
    404: 'Not Found',
    409: 'Conflict',
    422: 'Unprocessable Entity',
    500: 'Internal Server Error',
  };
  return message === genericTexts[status] || message === 'ERROR';
}

function tryParseBody(error: HttpErrorResponse): ApiError | null {
  try {
    if (error.error && typeof error.error === 'object') {
      return error.error as ApiError;
    }
  } catch {
    // Body is not JSON or not an object — ignore
  }
  return null;
}

function genericMessage(status: number): string {
  switch (status) {
    case 400:
      return 'La solicitud contiene datos inválidos.';
    case 401:
      return 'Tu sesión ha expirado, inicia sesión nuevamente.';
    case 403:
      return 'No tienes permisos para realizar esta acción.';
    case 404:
      return 'El recurso solicitado no fue encontrado.';
    case 409:
      return 'La operación no puede completarse debido a un conflicto.';
    case 422:
      return 'Los datos enviados no cumplen con las reglas de negocio.';
    case 500:
      return 'Error interno del servidor. Intenta nuevamente más tarde.';
    default:
      return `Error inesperado (${status}). Intenta nuevamente.`;
  }
}
