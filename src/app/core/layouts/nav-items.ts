export interface NavItem {
  label: string;
  icon: string;
  route?: string;
  roles?: string[];
  children?: NavItem[];
}

/** Base items visible to all authenticated users. */
const BASE_ITEMS: NavItem[] = [
  { label: 'Dashboard', icon: 'layout-dashboard', route: '/dashboard' },
];

/** Admin items — platform-level management. */
const ADMIN_ITEMS: NavItem[] = [
  { label: 'Usuarios', icon: 'users', route: '/users' },
  { label: 'Instituciones', icon: 'building-2', route: '/schools' },
  { label: 'Sedes', icon: 'git-branch', route: '/branches' },
];

/** School admin items — institution-level management. */
const SCHOOL_ITEMS: NavItem[] = [
  { label: 'Usuarios', icon: 'users', route: '/users' },
  { label: 'Instituciones', icon: 'building-2', route: '/schools' },
  { label: 'Sedes', icon: 'git-branch', route: '/branches' },
];

/** Teacher items — classroom-level tools. */
const TEACHER_ITEMS: NavItem[] = [
  // Teacher-specific routes will be added in future phases
];

export const NAV_ITEMS: NavItem[] = [
  ...BASE_ITEMS,
  ...ADMIN_ITEMS,
  ...SCHOOL_ITEMS,
  ...TEACHER_ITEMS,
];

export function filterByRole(items: NavItem[], userRoles: string[]): NavItem[] {
  return items.filter((item) => !item.roles || item.roles.some((r) => userRoles.includes(r)));
}

/** Returns nav items appropriate for the user's roles. */
export function getNavItemsForRoles(roles: string[]): NavItem[] {
  const items = [...BASE_ITEMS];

  if (roles.includes('PLATFORM_ADMIN')) {
    items.push(...ADMIN_ITEMS);
  }
  if (roles.includes('SCHOOL_ADMIN')) {
    items.push(...SCHOOL_ITEMS);
  }
  if (roles.includes('TEACHER')) {
    items.push(...TEACHER_ITEMS);
  }

  return items;
}
