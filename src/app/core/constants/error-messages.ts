/**
 * Maps backend error codes to user-friendly Spanish messages.
 * Uses the `code` field when present; otherwise falls back to the raw `message` from the backend.
 */
export const ERROR_MESSAGES: Record<string, string> = {
  AUTH_INVALID_CREDENTIALS: 'Usuario o contraseña incorrectos',
  AUTH_ACCOUNT_DISABLED: 'Tu cuenta se encuentra deshabilitada',
  AUTH_TOKEN_EXPIRED: 'Tu sesión ha expirado, inicia sesión nuevamente',

  USER_ALREADY_EXISTS: 'Ya existe un usuario con ese correo electrónico',
  USER_NOT_FOUND: 'El usuario no fue encontrado',

  SCHOOL_ALREADY_EXISTS: 'La institución ya se encuentra registrada',
  SCHOOL_NOT_FOUND: 'La institución no fue encontrada',

  BRANCH_ALREADY_EXISTS: 'La sede ya se encuentra registrada',
  BRANCH_NOT_FOUND: 'La sede no fue encontrada',

  MEMBERSHIP_ALREADY_EXISTS: 'El usuario ya tiene esa membresía asignada',
  MEMBERSHIP_NOT_FOUND: 'La membresía no fue encontrada',
};
