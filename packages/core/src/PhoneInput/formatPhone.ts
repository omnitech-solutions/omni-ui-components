/**
 * Format a phone string into a human-friendly grouping as the user types.
 * - `+` prefix or `defaultDialCode` supplied → `+CC XXX XXX XXXX`
 * - otherwise (US-style)                      → `(XXX) XXX-XXXX`
 */
export const formatPhone = (raw: string, defaultDialCode?: string): string => {
  const trimmed = raw.trim();
  if (!trimmed) return '';
  const hasPlus = trimmed.startsWith('+');
  const dialDigits = defaultDialCode ? defaultDialCode.replace(/\D/g, '') : '';
  const useIntl = hasPlus || Boolean(defaultDialCode);
  const digits = trimmed.replace(/\D/g, '');
  if (!digits) return '';

  if (useIntl) {
    const ccLen = dialDigits.length || 1;
    const cc = digits.slice(0, ccLen);
    const rest = digits.slice(cc.length);
    let out = `+${cc}`;
    if (rest.length > 0) out += ` ${rest.slice(0, 3)}`;
    if (rest.length > 3) out += ` ${rest.slice(3, 6)}`;
    if (rest.length > 6) out += ` ${rest.slice(6, 10)}`;
    return out;
  }

  if (digits.length <= 3) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
};
