/**
 * Replaces all occurrences of a substring — mirrors JSP replaceAllSpace()
 */
export const replaceAll = (source, find, replace) => {
  if (!source) return '';
  let result = source;
  while (result.includes(find)) {
    result = result.replace(find, replace);
  }
  return result;
};

/**
 * Trims all leading/trailing whitespace
 */
export const trimAll = (str) => (str ? str.trim() : '');

/**
 * Validates that a string contains only ASCII printable characters
 */
export const isAsciiOnly = (str) => {
  if (!str) return true;
  return /^[\x20-\x7E]*$/.test(str);
};

/**
 * Strips non-numeric characters from a string
 */
export const numericOnly = (str) => (str ? str.replace(/\D/g, '') : '');

/**
 * URL-decodes a string (mirrors JSP EncodeString.getEncodedString behavior)
 */
export const urlDecode = (str) => {
  if (!str) return '';
  try {
    return decodeURIComponent(str.replace(/\+/g, ' '));
  } catch {
    return str;
  }
};

/**
 * Truncates text to maxLength characters
 */
export const truncate = (str, maxLength) => {
  if (!str) return '';
  return str.length > maxLength ? str.substring(0, maxLength) : str;
};

/**
 * Formats email address input to normalize semicolons
 */
export const normalizeEmailSeparators = (value) => {
  if (!value) return '';
  return value.replace(/;{2,}/g, ';').replace(/;\s*$/, '');
};
