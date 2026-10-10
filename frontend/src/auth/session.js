const AUTH_STORAGE_KEY = 'blockchain_supply_chain_session';
const hasStorage = () => typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

const VALID_ROLES = [
  'ADMIN',
  'MANUFACTURER',
  'SUPPLIER',
  'DISTRIBUTOR',
  'RETAILER',
  'CONSUMER'
];

export const normalizeRole = (role) => {
  if (!role) return 'NONE';
  const normalized = String(role).trim().toUpperCase();
  return VALID_ROLES.includes(normalized) ? normalized : 'NONE';
};

export const getDefaultSession = () => ({
  isAuthenticated: false,
  user: null,
  role: 'NONE',
  account: ''
});

export const saveSession = (session = {}) => {
  const user = session.user || {
    username: session.username || 'demo-user',
    account: session.account || ''
  };

  const nextSession = {
    isAuthenticated: Boolean(session.isAuthenticated ?? true),
    user,
    role: normalizeRole(session.role),
    account: session.account || user.account || ''
  };

  if (hasStorage()) {
    window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(nextSession));
  }
  return nextSession;
};

export const loadSession = () => {
  try {
    if (!hasStorage()) return getDefaultSession();

    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return getDefaultSession();

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') {
      return getDefaultSession();
    }

    const user = parsed.user || null;

    if (!parsed.isAuthenticated || !user || !user.username) {
      return getDefaultSession();
    }

    return {
      isAuthenticated: true,
      user,
      role: normalizeRole(parsed.role),
      account: parsed.account || user.account || ''
    };
  } catch (error) {
    console.warn('Unable to load saved session:', error);
    return getDefaultSession();
  }
};

export const clearSession = () => {
  if (hasStorage()) {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
  }
  return getDefaultSession();
};
