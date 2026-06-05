import { describe, it, expect } from 'vitest';
import { getNavItemsForRoles, filterByRole } from './nav-items';

describe('getNavItemsForRoles', () => {
  it('should return only Dashboard for empty roles', () => {
    const result = getNavItemsForRoles([]);
    expect(result.length).toBe(1);
    expect(result[0].label).toBe('Dashboard');
  });

  it('should return all admin items for PLATFORM_ADMIN', () => {
    const result = getNavItemsForRoles(['PLATFORM_ADMIN']);
    expect(result.length).toBe(3);
    expect(result.map((i) => i.label)).toEqual(['Dashboard', 'Usuarios', 'Instituciones']);
  });

  it('should return school items for SCHOOL_ADMIN', () => {
    const result = getNavItemsForRoles(['SCHOOL_ADMIN']);
    expect(result.length).toBe(3);
    expect(result.map((i) => i.label)).toEqual(['Dashboard', 'Usuarios', 'Instituciones']);
  });

  it('should return only Dashboard for TEACHER', () => {
    const result = getNavItemsForRoles(['TEACHER']);
    expect(result.length).toBe(1);
    expect(result[0].label).toBe('Dashboard');
    // Teacher-specific items will be added in future phases
  });

  it('should return only Dashboard for STUDENT', () => {
    const result = getNavItemsForRoles(['STUDENT']);
    expect(result.length).toBe(1);
    expect(result[0].label).toBe('Dashboard');
  });

  it('should combine items for user with multiple roles', () => {
    const result = getNavItemsForRoles(['PLATFORM_ADMIN', 'TEACHER']);
    expect(result.length).toBe(3);
    expect(result.map((i) => i.label)).toEqual(['Dashboard', 'Usuarios', 'Instituciones']);
  });
});

// filterByRole still exists for the PlatformLayout contextual sidebar
describe('filterByRole', () => {
  it('should return items with no roles restriction', () => {
    const items = [{ label: 'A', icon: 'a', route: '/a' }];
    const result = filterByRole(items, ['TEACHER']);
    expect(result.length).toBe(1);
  });

  it('should return items matching user role', () => {
    const items = [
      { label: 'A', icon: 'a', route: '/a', roles: ['PLATFORM_ADMIN'] },
      { label: 'B', icon: 'b', route: '/b', roles: ['SCHOOL_ADMIN'] },
    ];
    const result = filterByRole(items, ['PLATFORM_ADMIN']);
    expect(result.length).toBe(1);
    expect(result[0].label).toBe('A');
  });

  it('should not mutate the original array', () => {
    const items = [{ label: 'A', icon: 'a', route: '/a', roles: ['ADMIN'] }];
    const originalLength = items.length;
    filterByRole(items, ['OTHER']);
    expect(items.length).toBe(originalLength);
  });
});
