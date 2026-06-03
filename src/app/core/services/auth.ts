import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { User, LoginRequest } from '../models/user';

const TOKEN_KEY = 'auth_token';

interface JwtPayload {
  sub: string;
  email: string;
  name: string;
  roles: string[];
  exp?: number;
  [key: string]: unknown;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);

  readonly token = signal<string | null>(null);
  readonly user = signal<User | null>(null);
  readonly isAuthenticated = computed(() => this.token() !== null);

  constructor() {
    this.restore();
  }

  async login(email: string, password: string): Promise<void> {
    const body: LoginRequest = { email, rawPassword: password };
    const response = await firstValueFrom(this.http.post<{ token: string }>('/auth/login', body));
    this.persist(response.token);
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    this.token.set(null);
    this.user.set(null);
  }

  private restore(): void {
    const stored = localStorage.getItem(TOKEN_KEY);
    if (!stored) return;

    try {
      const user = this.decodeToken(stored);
      this.token.set(stored);
      this.user.set(user);
    } catch {
      localStorage.removeItem(TOKEN_KEY);
    }
  }

  private persist(jwt: string): void {
    localStorage.setItem(TOKEN_KEY, jwt);
    const user = this.decodeToken(jwt);
    this.token.set(jwt);
    this.user.set(user);
  }

  private decodeToken(jwt: string): User {
    const parts = jwt.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid JWT format');
    }

    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const json = atob(base64);
    const payload: JwtPayload = JSON.parse(json);

    if (payload.exp && Date.now() / 1000 > payload.exp) {
      throw new Error('JWT is expired');
    }

    return {
      id: payload.sub,
      email: payload.email,
      username: payload.email,
      fullName: payload.name,
      roles: payload.roles ?? [],
      token: jwt,
    };
  }
}
