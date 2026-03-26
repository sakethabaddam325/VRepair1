import { isValidDate } from './dateUtils.js';
import { ALLOWED_FILE_EXTENSIONS, MAX_FILE_SIZE_BYTES } from '../constants/appConstants.js';

/**
 * Validates a phone number has at least 10 digits
 */
export const isValidPhone = (phone) => {
  if (!phone) return false;
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 10;
};

/**
 * Validates a file: size and extension
 */
export const validateFile = (file) => {
  if (!file) return { isValid: false, error: 'No file selected.' };
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return { isValid: false, error: `File size exceeds ${MAX_FILE_SIZE_BYTES / 1024 / 1024}MB limit.` };
  }
  const ext = '.' + file.name.split('.').pop().toLowerCase();
  if (!ALLOWED_FILE_EXTENSIONS.includes(ext)) {
    return { isValid: false, error: `File type '${ext}' is not allowed.` };
  }
  return { isValid: true };
};

/**
 * Validates OASIS Flash ID must be exactly 13 characters when provided
 */
export const isValidOasisFlashId = (value) => {
  if (!value || value.trim() === '') return true;
  return value.trim().length === 13;
};

/**
 * Validates date/time field
 */
export const validateDateTimeField = (value, fieldName = 'Date') => {
  if (!value || value.trim() === '') return null;
  if (!isValidDate(value)) return `${fieldName} is invalid. Please use MM/DD/YYYY HH:MM format.`;
  return null;
};

/**
 * Checks if a required string field is filled
 */
export const isRequired = (value) => value !== null && value !== undefined && String(value).trim() !== '';

/**
 * Builds a list of missing required field names
 */
export const getMissingFields = (fieldsMap) => {
  return Object.entries(fieldsMap)
    .filter(([, value]) => !isRequired(value))
    .map(([fieldName]) => fieldName);
};
