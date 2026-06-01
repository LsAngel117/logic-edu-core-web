import { describe, it, expect } from 'vitest';
import { User, LoginRequest } from './user';

function decodeJwtPayload<T>(token: string): T {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const json = atob(base64);
  return JSON.parse(json) as T;
}

function encodeJwtPayload(payload: Record<string, unknown>): string {
  const json = JSON.stringify(payload);
  const base64 = btoa(json).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  return `header.${base64}.signature`;
}

describe('User model', () => {
  it('should accept a complete User object with all required fields', () => {
    const user: User = {
      id: 'usr_abc123',
      email: 'test@logicedu.com',
      displayName: 'Test User',
      roles: ['teacher', 'admin'],
      token: 'header.payload.signature',
    };

    expect(user.id).toBe('usr_abc123');
    expect(user.email).toBe('test@logicedu.com');
    expect(user.displayName).toBe('Test User');
    expect(user.roles).toEqual(['teacher', 'admin']);
    expect(user.token).toBe('header.payload.signature');
  });

  it('should allow an empty roles array', () => {
    const user: User = {
      id: 'usr_xyz',
      email: 'minimal@logicedu.com',
      displayName: 'Minimal User',
      roles: [],
      token: 'header.payload.signature',
    };

    expect(user.roles).toHaveLength(0);
  });

  it('should decode JWT payload to match User interface shape', () => {
    const payload = {
      sub: 'usr_abc123',
      email: 'jwtuser@logicedu.com',
      name: 'JWT User',
      roles: ['student'],
    };

    const token = encodeJwtPayload(payload);
    const decoded = decodeJwtPayload<{ sub: string; email: string; name: string; roles: string[] }>(
      token,
    );

    expect(decoded.sub).toBe('usr_abc123');
    expect(decoded.email).toBe('jwtuser@logicedu.com');
    expect(decoded.name).toBe('JWT User');
    expect(decoded.roles).toEqual(['student']);
  });

  it('should decode JWT payload with multiple roles', () => {
    const payload = {
      sub: 'usr_multi',
      email: 'multi@logicedu.com',
      name: 'Multi Role',
      roles: ['teacher', 'admin', 'parent'],
    };

    const token = encodeJwtPayload(payload);
    const decoded = decodeJwtPayload<{ sub: string; email: string; name: string; roles: string[] }>(
      token,
    );

    expect(decoded.roles).toHaveLength(3);
    expect(decoded.roles).toContain('teacher');
    expect(decoded.roles).toContain('admin');
    expect(decoded.roles).toContain('parent');
  });

  it('should accept a LoginRequest with email and password', () => {
    const loginReq: LoginRequest = {
      email: 'login@logicedu.com',
      password: 'secret123',
    };

    expect(loginReq.email).toBe('login@logicedu.com');
    expect(loginReq.password).toBe('secret123');
  });
});
