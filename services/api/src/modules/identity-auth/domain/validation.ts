/**
 * Identity domain rules — pure logic, no framework dependencies (Vol 6 §5.5).
 * Precision matters in health software (Vol 1 Core Values): validation messages
 * are human and specific.
 */
import { ValidationError } from '../../../shared/errors';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function assertValidEmail(email: string): void {
  if (!EMAIL_PATTERN.test(email)) {
    throw new ValidationError('Please enter a valid email address.');
  }
}

/**
 * Password policy: minimum 10 characters with at least one letter and one
 * digit. Health data deserves strong protection (Vol 1 §7 "Security as a
 * Promise").
 */
export function assertValidPassword(password: string): void {
  if (password.length < 10) {
    throw new ValidationError('Your password needs at least 10 characters.');
  }
  if (!/[a-zA-Z]/.test(password) || !/\d/.test(password)) {
    throw new ValidationError('Your password needs at least one letter and one number.');
  }
}

export function assertValidFirstName(firstName: string): void {
  if (firstName.trim().length === 0) {
    throw new ValidationError('Please tell us your first name.');
  }
  if (firstName.trim().length > 100) {
    throw new ValidationError('That name looks too long — please use up to 100 characters.');
  }
}
