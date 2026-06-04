/**
 * Maps backend error codes to user-friendly Spanish messages.
 * Uses the `code` field when present; otherwise falls back to the raw `message` from the backend.
 */
export const ERROR_MESSAGES: Record<string, string> = {
  // Auth
  AUTH_INVALID_CREDENTIALS: 'Usuario o contraseña incorrectos',
  AUTH_ACCOUNT_DISABLED: 'La cuenta se encuentra deshabilitada',
  AUTH_ACCOUNT_LOCKED: 'La cuenta se encuentra bloqueada',
  AUTH_TOKEN_EXPIRED: 'Tu sesión ha expirado',
  AUTH_TOKEN_INVALID: 'La sesión no es válida',
  AUTH_ACCESS_DENIED: 'No tienes permisos para acceder',

  // Users
  USER_ALREADY_EXISTS: 'Ya existe un usuario con ese correo electrónico',
  USER_NOT_FOUND: 'El usuario no fue encontrado',
  USER_INACTIVE: 'El usuario se encuentra inactivo',

  // Schools
  SCHOOL_ALREADY_EXISTS: 'La institución ya se encuentra registrada',
  SCHOOL_NOT_FOUND: 'La institución no fue encontrada',

  // Branches
  BRANCH_ALREADY_EXISTS: 'La sede ya se encuentra registrada',
  BRANCH_NOT_FOUND: 'La sede no fue encontrada',

  // Memberships
  MEMBERSHIP_ALREADY_EXISTS: 'La membresía ya existe',
  MEMBERSHIP_NOT_FOUND: 'La membresía no fue encontrada',

  // Validation
  VALIDATION_ERROR: 'Los datos enviados no son válidos',
  BUSINESS_RULE_VIOLATION: 'La operación no cumple las reglas de negocio',
};
