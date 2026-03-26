/**
 * Formats a date to MM/DD/YYYY HH:MM format (matches JSP ICSuite mask behavior)
 */
export const formatDateTimeMask = (value) => {
  if (!value) return '';
  const cleaned = value.replace(/\D/g, '');
  let result = '';
  if (cleaned.length > 0) result += cleaned.substring(0, 2);
  if (cleaned.length > 2) result += '/' + cleaned.substring(2, 4);
  if (cleaned.length > 4) result += '/' + cleaned.substring(4, 8);
  if (cleaned.length > 8) result += ' ' + cleaned.substring(8, 10);
  if (cleaned.length > 10) result += ':' + cleaned.substring(10, 12);
  return result;
};

/**
 * Validates a date string in MM/DD/YYYY or MM/DD/YYYY HH:MM format
 */
export const isValidDate = (dateStr) => {
  if (!dateStr || dateStr.trim() === '') return true;
  const parts = dateStr.split(' ');
  const datePart = parts[0];
  const [month, day, year] = datePart.split('/').map(Number);
  if (!month || !day || !year) return false;
  const date = new Date(year, month - 1, day);
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
};

/**
 * Compares two date strings — returns true if date2 is before date1
 */
export const isDate2BeforeDate1 = (dateStr1, dateStr2) => {
  if (!dateStr1 || !dateStr2) return false;
  const parse = (s) => {
    const [datePart, timePart] = s.split(' ');
    const [m, d, y] = datePart.split('/').map(Number);
    const [h = 0, min = 0] = (timePart || '00:00').split(':').map(Number);
    return new Date(y, m - 1, d, h, min);
  };
  return parse(dateStr2) < parse(dateStr1);
};

/**
 * Formats a TN (telephone number) as NXX/NXX/XXXX
 */
export const formatServiceTN = (value) => {
  if (!value) return '';
  const digits = value.replace(/\D/g, '');
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}/${digits.slice(3)}`;
  return `${digits.slice(0, 3)}/${digits.slice(3, 6)}/${digits.slice(6, 10)}`;
};

/**
 * Formats current date/time as a string for display
 */
export const getCurrentDateTime = () => {
  const now = new Date();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const yyyy = now.getFullYear();
  const hh = String(now.getHours()).padStart(2, '0');
  const min = String(now.getMinutes()).padStart(2, '0');
  return `${mm}/${dd}/${yyyy} ${hh}:${min}`;
};

/**
 * Formats date using Intl API — replaces <fmt:formatDate>
 */
export const formatDate = (dateStr, options = {}) => {
  if (!dateStr) return '';
  try {
    return new Intl.DateTimeFormat('en-US', options).format(new Date(dateStr));
  } catch {
    return dateStr;
  }
};

/**
 * Formats number using Intl API — replaces <fmt:formatNumber>
 */
export const formatNumber = (value, options = {}) => {
  if (value === null || value === undefined) return '';
  try {
    return new Intl.NumberFormat('en-US', options).format(value);
  } catch {
    return String(value);
  }
};
