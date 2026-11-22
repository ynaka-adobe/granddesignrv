import { CITY_AUDIENCE_NAMES, resolveAudience } from './persona-profile.js';

const PROFILE_ORIGIN = 'https://granddesignrv.xsc.demo.adobe.com';
let cityPromise;

async function readVisitorCity() {
  if (window.location.origin !== PROFILE_ORIGIN) {
    // eslint-disable-next-line no-console
    console.warn('AEM city audiences are unavailable outside the custom-domain site.');
    return null;
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 2000);
  let failure = 'request failed or timed out';
  try {
    const response = await fetch('/api/visitor-profile', {
      method: 'GET',
      mode: 'same-origin',
      credentials: 'omit',
      redirect: 'error',
      cache: 'no-store',
      signal: controller.signal,
    });
    failure = 'unexpected endpoint status or content type';
    if (!response.ok || !/^application\/json(?:;|$)/i.test(response.headers.get('content-type') || '')) {
      throw new Error(failure);
    }
    failure = 'missing private/no-store cache policy';
    const cachePolicy = (response.headers.get('cache-control') || '')
      .toLowerCase().split(',').map((directive) => directive.trim());
    if (!cachePolicy.includes('private') || !cachePolicy.includes('no-store') || cachePolicy.includes('public')) {
      throw new Error(failure);
    }
    failure = 'malformed visitor profile or unsupported source';
    const profile = await response.json();
    if (!profile || Array.isArray(profile) || profile.source !== 'cdn'
        || typeof profile.city !== 'string' || !profile.city.trim()
        || typeof profile.country !== 'string' || !/^[a-z]{2}$/i.test(profile.country.trim())) {
      throw new Error(failure);
    }
    if (profile.country.trim().toUpperCase() !== 'US') return null;
    return profile.city.trim().replace(/\s+/g, ' ').toLowerCase();
  } catch {
    // Keep diagnostics categorical: never log the response, IP or location.
    // eslint-disable-next-line no-console
    console.warn(`AEM city audiences unavailable: ${failure}.`);
    return null;
  } finally {
    clearTimeout(timer);
  }
}

export default async function matchesVisitorCity(city) {
  const params = new URLSearchParams(window.location.search);
  const manualAudience = resolveAudience(params, window.demoProfile);
  if (manualAudience) return CITY_AUDIENCE_NAMES[manualAudience]?.toLowerCase() === city;
  if (params.has('audience')) return false;
  if (!cityPromise) cityPromise = readVisitorCity();
  return await cityPromise === city;
}
