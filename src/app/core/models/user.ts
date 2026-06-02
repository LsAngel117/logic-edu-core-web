/** Authenticated user identity from backend login response or JWT claims. */
export interface User {
  id: string;
  email: string;
  displayName: string;
  roles: string[];
  /** Raw JWT for interceptor Authorization header injection. */
  token: string;
}

/** Credentials submitted to POST /auth/login. */
export interface LoginRequest {
  email: string;
  password: string;
}
