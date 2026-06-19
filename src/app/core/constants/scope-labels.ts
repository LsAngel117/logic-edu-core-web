/** Display names for scope types — Spanish UI, English API values unchanged. */
export const SCOPE_LABELS: Record<string, string> = {
  PLATFORM: 'Plataforma',
  SCHOOL: 'Escuela',
  BRANCH: 'Sede',
  ACADEMY: 'Academia',
  COURSE: 'Curso',
};

export function scopeLabel(scope: string | undefined | null): string {
  if (!scope) return '—';
  return SCOPE_LABELS[scope] ?? scope;
}
