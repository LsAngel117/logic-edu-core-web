import { describe, it, expect } from 'vitest';
import { NavItem, NAV_ITEMS, filterByRole } from './nav-items';

describe('NAV_ITEMS', () => {
  it('should contain Dashboard, Users, and Schools items', () => {
    expect(NAV_ITEMS.length).toBe(3);
    expect(NAV_ITEMS[0].label).toBe('Dashboard');
    expect(NAV_ITEMS[0].icon).toBe('layout-dashboard');
    expect(NAV_ITEMS[0].route).toBe('/dashboard');

    expect(NAV_ITEMS[1].label).toBe('Usuarios');
    expect(NAV_ITEMS[1].icon).toBe('users');
    expect(NAV_ITEMS[1].route).toBe('/users');

    expect(NAV_ITEMS[2].label).toBe('Instituciones');
    expect(NAV_ITEMS[2].icon).toBe('building-2');
    expect(NAV_ITEMS[2].route).toBe('/schools');
  });

  it('should have roles defined on Users and Schools items, not Dashboard', () => {
    expect(NAV_ITEMS[0].roles).toBeUndefined();
    expect(NAV_ITEMS[1].roles).toEqual(['PLATFORM_ADMIN', 'SCHOOL_ADMIN']);
    expect(NAV_ITEMS[2].roles).toEqual(['PLATFORM_ADMIN', 'SCHOOL_ADMIN']);
  });

  it('should conform to NavItem type', () => {
    NAV_ITEMS.forEach((item: NavItem) => {
      expect(typeof item.label).toBe('string');
      expect(typeof item.icon).toBe('string');
      expect(typeof item.route).toBe('string');
      if (item.roles) {
        expect(Array.isArray(item.roles)).toBe(true);
      }
    });
  });
});

describe('filterByRole', () => {
  it('should return items with no roles restriction for any user roles', () => {
    const result = filterByRole(NAV_ITEMS, ['TEACHER']);
    expect(result.length).toBe(1);
    expect(result[0].label).toBe('Dashboard');
  });

  it('should return all items for PLATFORM_ADMIN', () => {
    const result = filterByRole(NAV_ITEMS, ['PLATFORM_ADMIN']);
    expect(result.length).toBe(3);
    expect(result.map((i: NavItem) => i.label)).toEqual(['Dashboard', 'Usuarios', 'Instituciones']);
  });

  it('should return Dashboard, Users, and Schools for SCHOOL_ADMIN', () => {
    const result = filterByRole(NAV_ITEMS, ['SCHOOL_ADMIN']);
    expect(result.length).toBe(3);
    expect(result.map((i: NavItem) => i.label)).toEqual(['Dashboard', 'Usuarios', 'Instituciones']);
  });



  it('should return Dashboard only for STUDENT', () => {
    const result = filterByRole(NAV_ITEMS, ['STUDENT']);
    expect(result.length).toBe(1);
    expect(result[0].label).toBe('Dashboard');
  });

  it('should return only Dashboard for empty roles array', () => {
    const result = filterByRole(NAV_ITEMS, []);
    expect(result.length).toBe(1);
    expect(result[0].label).toBe('Dashboard');
  });

  it('should match when user has multiple roles including one allowed', () => {
    const result = filterByRole(NAV_ITEMS, ['TEACHER', 'SCHOOL_ADMIN']);
    expect(result.length).toBe(3);
    expect(result.map((i: NavItem) => i.label)).toEqual(['Dashboard', 'Usuarios', 'Instituciones']);
  });

  it('should not mutate the original items array', () => {
    const items: NavItem[] = [{ label: 'A', icon: 'a', route: '/a', roles: ['ADMIN'] }];
    const originalLength = items.length;
    filterByRole(items, ['OTHER']);
    expect(items.length).toBe(originalLength);
  });
});
