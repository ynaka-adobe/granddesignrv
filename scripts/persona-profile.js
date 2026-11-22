export const PERSONA_AUDIENCES = ['shopper', 'owner', 'lifecycle'];
export const CITY_AUDIENCE_NAMES = {
  'san-francisco': 'San Francisco',
  chicago: 'Chicago',
  'los-angeles': 'Los Angeles',
};
const DEMO_AUDIENCES = [...PERSONA_AUDIENCES, ...Object.keys(CITY_AUDIENCE_NAMES)];

export function resolveAudience(params, profile = {}) {
  if (params.has('demo-profile-reset')) return undefined;
  const audience = params.has('audience') ? params.get('audience') : profile?.audience;
  if (params.has('audience')) {
    const value = audience.trim().toLowerCase();
    return DEMO_AUDIENCES.includes(value) ? value : undefined;
  }
  const legacy = params.get('p') ?? params.get('persona');
  if (legacy !== null) {
    const persona = Number(legacy);
    return Number.isInteger(persona) && persona >= 1 && persona <= 3
      ? PERSONA_AUDIENCES[persona - 1] : undefined;
  }
  if (audience !== undefined) {
    const value = String(audience).trim().toLowerCase();
    return DEMO_AUDIENCES.includes(value) ? value : undefined;
  }
  return Number.isInteger(profile?.persona) && profile.persona >= 1 && profile.persona <= 3
    ? PERSONA_AUDIENCES[profile.persona - 1] : undefined;
}

export function resolvePersona(params, profile = {}) {
  const index = PERSONA_AUDIENCES.indexOf(resolveAudience(params, profile));
  return index < 0 ? undefined : index + 1;
}
