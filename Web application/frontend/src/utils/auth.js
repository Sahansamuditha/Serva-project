const CACHE_KEYS_TO_CLEAR = [
  'admin_profile',
  'admin_avatar',
  'serva_user_admin',
  'serva_user_requester',
  'serva_user_director',
  'serva_director_firstname',
  'serva_director_lastname',
  'serva_director_avatar',
  'serva_user_maintenance_officer',
  'serva_user_profile'
];

export function getAuthUser() {
  try {
    const raw = localStorage.getItem('serva_user');
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

export function getAuthToken() {
  return localStorage.getItem('serva_token') || null;
}

export function setAuthSession(user, token) {
  // Purge any stale cache from previously logged in user
  CACHE_KEYS_TO_CLEAR.forEach(key => localStorage.removeItem(key));

  if (user) localStorage.setItem('serva_user', JSON.stringify(user));
  if (token) localStorage.setItem('serva_token', token);
  window.dispatchEvent(new Event('serva:auth-change'));
}

export function triggerLogout() {
  localStorage.removeItem('serva_token');
  localStorage.removeItem('serva_user');
  CACHE_KEYS_TO_CLEAR.forEach(key => localStorage.removeItem(key));
  try {
    if (window.history && window.history.pushState) {
      window.history.pushState(null, '', '/');
    }
  } catch (e) { }
  window.dispatchEvent(new Event('serva:logout'));
}
