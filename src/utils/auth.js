// Authentication Engine with SHA-256 Salted Hashing for Masroufi

const AUTH_STORAGE_KEY = 'masroufi_auth_users_v1';
const SESSION_STORAGE_KEY = 'masroufi_auth_session_v1';
const SALT = 'masroufi_secure_salt_2026_';

// Pre-seeded verified accounts
const PRESEEDED_USERS = [
  {
    id: 'user_emy_ali',
    username: 'emy.ali',
    email: 'emy.ali@masroufi.com',
    fullName: 'إيمي علي (Emy Ali)',
    // SHA-256 of 'masroufi_secure_salt_2026_2224536'
    passwordHash: '5c360a4f5b9ab8597f220360111a569f8b4b43e679b43fb963f1768e6bc9374e',
    createdAt: '2026-10-27T18:00:00.000Z',
  },
  {
    id: 'user_yahya',
    username: 'yahya9031',
    email: 'yahya9031@masroufi.com',
    fullName: 'يحيى (Yahya)',
    // SHA-256 of 'masroufi_secure_salt_2026_123456'
    passwordHash: 'c70034a742c38d82d49574a4f107f9c95b6c8aa51e7077a28e9a26315eeef398',
    createdAt: '2026-10-27T12:00:00.000Z',
  }
];

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
 * Get all registered accounts (merges with pre-seeded users)
 */
export function getRegisteredUsers() {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    let users = raw ? JSON.parse(raw) : [];

    // Ensure pre-seeded users are always available
    let updated = false;
    for (const pre of PRESEEDED_USERS) {
      const idx = users.findIndex(u => 
        (u.username && u.username.toLowerCase() === pre.username.toLowerCase()) ||
        (u.email && u.email.toLowerCase() === pre.email.toLowerCase())
      );
      if (idx === -1) {
        users.push(pre);
        updated = true;
      } else {
        // Ensure id and username are synced
        if (!users[idx].username) {
          users[idx].username = pre.username;
          updated = true;
        }
      }
    }

    if (updated) {
      saveRegisteredUsers(users);
    }

    return users;
  } catch {
    return PRESEEDED_USERS;
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
  const cleanInput = String(email || '').trim().toLowerCase();
  if (!cleanInput || cleanInput.length < 3) {
    throw new Error('يرجى إدخال اسم مستخدم أو بريد إلكتروني صالح.');
  }
  if (!password || password.length < 6) {
    throw new Error('كلمة المرور يجب أن لا تقل عن 6 أحرف أو أرقام.');
  }

  const isEmail = cleanInput.includes('@');
  const cleanUsername = isEmail ? cleanInput.split('@')[0] : cleanInput;
  const cleanEmail = isEmail ? cleanInput : `${cleanInput}@masroufi.com`;

  const users = getRegisteredUsers();
  const exists = users.find(u => 
    (u.username && u.username.toLowerCase() === cleanUsername) || 
    (u.email && u.email.toLowerCase() === cleanEmail)
  );

  if (exists) {
    throw new Error('اسم المستخدم أو البريد الإلكتروني مسجل بالفعل، يرجى تسجيل الدخول.');
  }

  const passwordHash = await hashPassword(password);
  const newUser = {
    id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    username: cleanUsername,
    email: cleanEmail,
    fullName: fullName?.trim() || cleanUsername,
    passwordHash,
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  saveRegisteredUsers(users);

  // Auto login
  const session = {
    userId: newUser.id,
    username: newUser.username,
    email: newUser.email,
    fullName: newUser.fullName,
    loggedInAt: new Date().toISOString(),
  };
  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  return session;
}

/**
 * Login user (supports both username and email)
 */
export async function loginUser(identifier, password) {
  const cleanIdentifier = String(identifier || '').trim().toLowerCase();
  if (!cleanIdentifier) {
    throw new Error('يرجى إدخال اسم المستخدم أو البريد الإلكتروني.');
  }

  const users = getRegisteredUsers();

  const user = users.find(u => 
    (u.username && u.username.toLowerCase() === cleanIdentifier) ||
    (u.email && u.email.toLowerCase() === cleanIdentifier)
  );

  if (!user) {
    throw new Error('اسم المستخدم أو البريد الإلكتروني غير مسجل في النظام.');
  }

  const passwordHash = await hashPassword(password);
  if (user.passwordHash !== passwordHash) {
    throw new Error('كلمة المرور غير صحيحة، يرجى التأكد والمحاولة مجدداً.');
  }

  const session = {
    userId: user.id,
    username: user.username || user.email.split('@')[0],
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
