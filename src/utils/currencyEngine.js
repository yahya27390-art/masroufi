// Currency Engine for Masroufi
export const DEFAULT_CURRENCIES = [
  { code: 'SAR', name: 'ريال سعودي', symbol: 'ر.س', rateToSAR: 1.0, flag: '🇸🇦' },
  { code: 'USD', name: 'دولار أمريكي', symbol: '$', rateToSAR: 3.75, flag: '🇺🇸' },
  { code: 'EGP', name: 'جنيه مصري', symbol: 'ج.م', rateToSAR: 0.076, flag: '🇪🇬' },
  { code: 'EUR', name: 'يورو أوروبي', symbol: '€', rateToSAR: 4.08, flag: '🇪🇺' },
  { code: 'AED', name: 'درهم إماراتي', symbol: 'د.إ', rateToSAR: 1.02, flag: '🇦🇪' },
  { code: 'KWD', name: 'دينار كويتي', symbol: 'د.ك', rateToSAR: 12.25, flag: '🇰🇼' },
  { code: 'QAR', name: 'ريال قطري', symbol: 'ر.ق', rateToSAR: 1.03, flag: '🇶🇦' },
  { code: 'BHD', name: 'دينار بحريني', symbol: 'د.ب', rateToSAR: 9.95, flag: '🇧🇭' },
  { code: 'OMR', name: 'ريال عماني', symbol: 'ر.ع', rateToSAR: 9.74, flag: '🇴🇲' },
  { code: 'JOD', name: 'دينار أردني', symbol: 'د.أ', rateToSAR: 5.29, flag: '🇯🇴' },
  { code: 'GBP', name: 'جنيه إسترليني', symbol: '£', rateToSAR: 4.88, flag: '🇬🇧' },
  { code: 'TRY', name: 'ليرة تركية', symbol: '₺', rateToSAR: 0.11, flag: '🇹🇷' },
];

/**
 * Convert any amount from one currency to another using the provided rates
 * Rate is defined as: 1 unit of currency = X units of SAR
 */
export function convertCurrency(amount, fromCode, toCode, customRates = {}) {
  const num = Number(amount) || 0;
  if (fromCode === toCode || num === 0) return num;

  const getRate = (code) => {
    if (customRates[code] !== undefined) return Number(customRates[code]);
    const found = DEFAULT_CURRENCIES.find(c => c.code === code);
    return found ? found.rateToSAR : 1.0;
  };

  const fromRate = getRate(fromCode);
  const toRate = getRate(toCode);

  if (toRate === 0) return 0;

  // Convert from -> SAR -> to
  const inSAR = num * fromRate;
  const inTarget = inSAR / toRate;

  return Math.round(inTarget * 100) / 100;
}

/**
 * Format money with thousands separators and symbol
 */
export function formatMoney(amount, currencyCode = 'SAR') {
  const val = Number(amount) || 0;
  const formatted = val.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const curr = DEFAULT_CURRENCIES.find(c => c.code === currencyCode);
  const symbol = curr ? curr.symbol : currencyCode;
  return `${formatted} ${symbol}`;
}

/**
 * Fetch latest live exchange rates against SAR
 */
export async function fetchLiveRates() {
  try {
    const res = await fetch('https://open.er-api.com/v6/latest/SAR');
    if (!res.ok) throw new Error('Failed to fetch live rates');
    const data = await res.json();
    if (data && data.rates) {
      // open.er-api gives rates relative to base (SAR). E.g. USD: 0.2666 => 1 USD = 1/0.2666 = 3.75 SAR
      const newRates = {};
      DEFAULT_CURRENCIES.forEach(c => {
        if (c.code === 'SAR') {
          newRates['SAR'] = 1.0;
        } else if (data.rates[c.code] && data.rates[c.code] > 0) {
          newRates[c.code] = Math.round((1 / data.rates[c.code]) * 10000) / 10000;
        }
      });
      return { success: true, rates: newRates, time: new Date().toISOString() };
    }
    throw new Error('Invalid rate response');
  } catch (err) {
    console.warn('Using default offline currency rates:', err.message);
    return { success: false, error: err.message };
  }
}
