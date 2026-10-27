// Authentication Engine with SHA-256 Salted Hashing for Masroufi

const AUTH_STORAGE_KEY = 'masroufi_auth_users_v1';
const SESSION_STORAGE_KEY = 'masroufi_auth_session_v1';
const SALT = 'masroufi_secure_salt_2026_';

/**
 * Hash password with SHA-256 using standard Web Crypto API
 */
export async function hashPassword(password) {
  const enc = new TextEncoder();
  const data = enc.encode(SALT + password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Get all registered accounts
 */
export function getRegisteredUsers() {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Save users list
 */
function saveRegisteredUsers(users) {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(users));
}

/**
 * Get active session
 */
export function getCurrentSession() {
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Register a new user
 */
export async function registerUser({ email, password, fullName }) {
  const cleanEmail = String(email || '').trim().toLowerCase();
  if (!cleanEmail || !cleanEmail.includes('@')) {
    throw new Error('يرجى إدخال بريد إلكتروني صالح.');
  }
  if (!password || password.length < 6) {
    throw new Error('كلمة المرور يجب أن لا تقل عن 6 أحرف أو أرقام.');
  }

  const users = getRegisteredUsers();
  const exists = users.find(u => u.email === cleanEmail);
  if (exists) {
    throw new Error('هذا البريد الإلكتروني مسجل بالفعل، يرجى تسجيل الدخول.');
  }

  const passwordHash = await hashPassword(password);
  const newUser = {
    id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    email: cleanEmail,
    fullName: fullName?.trim() || cleanEmail.split('@')[0],
    passwordHash,
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  saveRegisteredUsers(users);

  // Auto login
  const session = {
    userId: newUser.id,
    email: newUser.email,
    fullName: newUser.fullName,
    loggedInAt: new Date().toISOString(),
  };
  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  return session;
}

/**
 * Login user
 */
export async function loginUser(email, password) {
  const cleanEmail = String(email || '').trim().toLowerCase();
  const users = getRegisteredUsers();

  // If no users registered yet, allow creating the first account easily
  if (users.length === 0) {
    return registerUser({ email: cleanEmail, password, fullName: cleanEmail.split('@')[0] });
  }

  const user = users.find(u => u.email === cleanEmail);
  if (!user) {
    throw new Error('البريد الإلكتروني غير مسجل في النظام.');
  }

  const passwordHash = await hashPassword(password);
  if (user.passwordHash !== passwordHash) {
    throw new Error('كلمة المرور غير صحيحة، يرجى المحاولة مجدداً.');
  }

  const session = {
    userId: user.id,
    email: user.email,
    fullName: user.fullName,
    loggedInAt: new Date().toISOString(),
  };
  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  return session;
}

/**
 * Logout
 */
export function logoutUser() {
  localStorage.removeItem(SESSION_STORAGE_KEY);
}
