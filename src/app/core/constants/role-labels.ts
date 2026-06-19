/** Display names for roles — Spanish UI, English API values unchanged. */
export const ROLE_LABELS: Record<string, string> = {
  PLATFORM_ADMIN: 'Admin de Plataforma',
  SCHOOL_ADMIN: 'Admin de Escuela',
  BRANCH_ADMIN: 'Admin de Sede',
  TEACHER: 'Profesor',
  STUDENT: 'Estudiante',
};

/** Returns the Spanish display name for a role, falling back to the raw value. */
export function roleLabel(role: string | undefined | null): string {
  if (!role) return 'Sin rol';
  return ROLE_LABELS[role] ?? role;
}
