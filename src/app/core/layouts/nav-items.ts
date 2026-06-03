export interface NavItem {
  label: string;
  icon: string;
  route: string;
  roles?: string[];
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', icon: 'layout-dashboard', route: '/dashboard' },
  { label: 'Usuarios', icon: 'users', route: '/users', roles: ['PLATFORM_ADMIN', 'SCHOOL_ADMIN'] },
  { label: 'Instituciones', icon: 'building-2', route: '/schools', roles: ['PLATFORM_ADMIN', 'SCHOOL_ADMIN'] },
];

export function filterByRole(items: NavItem[], userRoles: string[]): NavItem[] {
  return items.filter((item) => !item.roles || item.roles.some((r) => userRoles.includes(r)));
}
