export const PERSONA_AUDIENCES = ['shopper', 'owner', 'lifecycle'];

export function resolvePersona(params, profile = {}) {
  if (params.has('demo-profile-reset')) return undefined;
  const audience = params.has('audience') ? params.get('audience') : profile?.audience;
  if (params.has('audience')) {
    const index = PERSONA_AUDIENCES.indexOf(audience.trim().toLowerCase());
    return index < 0 ? undefined : index + 1;
  }
  const legacy = params.get('p') ?? params.get('persona');
  if (legacy !== null) {
    const persona = Number(legacy);
    return Number.isInteger(persona) && persona >= 1 && persona <= 3 ? persona : undefined;
  }
  if (audience !== undefined) {
    const index = PERSONA_AUDIENCES.indexOf(String(audience).trim().toLowerCase());
    return index < 0 ? undefined : index + 1;
  }
  return Number.isInteger(profile?.persona) && profile.persona >= 1 && profile.persona <= 3
    ? profile.persona : undefined;
}
