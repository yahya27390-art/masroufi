// LocalStorage Engine for Masroufi

export const STORAGE_KEY = 'masroufi_app_data_v1';

export const DEFAULT_CATEGORIES = [
  { id: 'housing', name: 'سكن وإيجار', icon: 'Home', color: '#6366f1', bg: 'rgba(99, 102, 241, 0.15)' },
  { id: 'bills', name: 'فواتير وخدمات', icon: 'Zap', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)' },
  { id: 'food', name: 'طعام ومشتريات', icon: 'Utensils', color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)' },
  { id: 'transport', name: 'مواصلات وبنزين', icon: 'Car', color: '#06b6d4', bg: 'rgba(6, 182, 212, 0.15)' },
  { id: 'installments', name: 'أقساط والتزامات', icon: 'Landmark', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)' },
  { id: 'health', name: 'صحة وعلاج', icon: 'HeartPulse', color: '#ec4899', bg: 'rgba(236, 72, 153, 0.15)' },
  { id: 'subscriptions', name: 'اشتراكات وخدمات', icon: 'Tv', color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.15)' },
  { id: 'shopping', name: 'تسوق ومستلزمات', icon: 'ShoppingBag', color: '#14b8a6', bg: 'rgba(20, 184, 166, 0.15)' },
  { id: 'education', name: 'تعليم وتطوير', icon: 'GraduationCap', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.15)' },
  { id: 'other', name: 'مصروفات أخرى', icon: 'MoreHorizontal', color: '#94a3b8', bg: 'rgba(148, 163, 184, 0.15)' },
];

export const PAYMENT_METHODS = [
  { id: 'card', name: 'بطاقة بنكية / مدى / فيزا', icon: 'CreditCard' },
  { id: 'cash', name: 'نقدي (كاش)', icon: 'Banknote' },
  { id: 'transfer', name: 'تحويل بنكي', icon: 'ArrowRightLeft' },
  { id: 'wallet', name: 'محفظة رقمية (Apple Pay / STC Pay)', icon: 'Smartphone' },
];

const INITIAL_DATA = {
  version: 1,
  baseCurrency: 'SAR',
  currencyRates: {},
  ratesLastUpdated: null,
  monthlyBudget: 0,
  expenses: [],
  fixedExpenses: [],
  categories: DEFAULT_CATEGORIES,
};

export function getUserStorageKey(userId) {
  if (!userId) return STORAGE_KEY;
  return `masroufi_data_user_${userId}`;
}

export function loadAppData(userId, userEmail) {
  try {
    const isEmy = userId === 'user_emy_ali' || (userEmail && String(userEmail).toLowerCase().includes('emy'));

    // For Emy Ali, ALWAYS load Emy's strictly isolated partition
    if (isEmy) {
      const emyKey = getUserStorageKey(userId || 'user_emy_ali');
      const emyRaw = localStorage.getItem(emyKey);
      if (emyRaw) {
        const parsed = JSON.parse(emyRaw);
        return {
          ...INITIAL_DATA,
          ...parsed,
          categories: parsed.categories?.length ? parsed.categories : DEFAULT_CATEGORIES,
        };
      }
      return {
        ...INITIAL_DATA,
        expenses: [],
        fixedExpenses: [],
        monthlyBudget: 0,
      };
    }

    // For Yahya (or any primary user):
    // 1. Check user-specific key
    const userKey = getUserStorageKey(userId);
    const userRaw = localStorage.getItem(userKey);
    let userData = null;
    if (userRaw) {
      try { userData = JSON.parse(userRaw); } catch {}
    }

    // 2. Check legacy global key ('masroufi_app_data_v1')
    const legacyRaw = localStorage.getItem(STORAGE_KEY);
    let legacyData = null;
    if (legacyRaw) {
      try { legacyData = JSON.parse(legacyRaw); } catch {}
    }

    // 3. Check alternate 'user_yahya' key
    const yahyaKeyRaw = localStorage.getItem('masroufi_data_user_user_yahya');
    let yahyaKeyData = null;
    if (yahyaKeyRaw) {
      try { yahyaKeyData = JSON.parse(yahyaKeyRaw); } catch {}
    }

    // Pick the storage candidate that contains the recorded expenses
    const candidates = [userData, legacyData, yahyaKeyData].filter(Boolean);
    const chosen = candidates.reduce((best, curr) => {
      if (!best) return curr;
      const bestCount = (best.expenses?.length || 0) + (best.fixedExpenses?.length || 0);
      const currCount = (curr.expenses?.length || 0) + (curr.fixedExpenses?.length || 0);
      return currCount >= bestCount ? curr : best;
    }, null);

    if (chosen) {
      const finalData = {
        ...INITIAL_DATA,
        ...chosen,
        categories: chosen.categories?.length ? chosen.categories : DEFAULT_CATEGORIES,
      };
      // Save it to this active user's key so future edits stay in sync
      if (userId) {
        localStorage.setItem(userKey, JSON.stringify(finalData));
      }
      return finalData;
    }

    return {
      ...INITIAL_DATA,
      expenses: [],
      fixedExpenses: [],
      monthlyBudget: 0,
    };
  } catch (err) {
    console.error('Failed to load Masroufi data from localStorage:', err);
    return INITIAL_DATA;
  }
}

export function saveAppData(data, userId) {
  try {
    const key = getUserStorageKey(userId);
    localStorage.setItem(key, JSON.stringify(data));
    window.dispatchEvent(new Event('masroufi-data-changed'));
    return true;
  } catch (err) {
    console.error('Failed to save Masroufi data:', err);
    return false;
  }
}
