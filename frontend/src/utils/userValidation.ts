/**
 * User Form Validation Utilities
 */

import { UserFormData } from '../types/user';

export interface ValidationError {
  field: string;
  message: string;
}

export function validateUserForm(formData: UserFormData): ValidationError[] {
  const errors: ValidationError[] = [];

  // Biography Data validation
  if (!formData.name || formData.name.trim().length === 0) {
    errors.push({ field: 'name', message: 'Name is required' });
  }

  if (!formData.email || formData.email.trim().length === 0) {
    errors.push({ field: 'email', message: 'Email is required' });
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    errors.push({ field: 'email', message: 'Invalid email format' });
  }

  if (!formData.phone || formData.phone.trim().length === 0) {
    errors.push({ field: 'phone', message: 'Phone is required' });
  } else if (!/^[\d\s\-\+\(\)]+$/.test(formData.phone)) {
    errors.push({ field: 'phone', message: 'Invalid phone format' });
  }

  if (!formData.password && !formData.email) {
    // Password only required for new users
    errors.push({ field: 'password', message: 'Password is required for new users' });
  } else if (formData.password && formData.password.length < 6) {
    errors.push({ field: 'password', message: 'Password must be at least 6 characters' });
  }

  if (formData.roles.length === 0) {
    errors.push({ field: 'roles', message: 'At least one role must be selected' });
  }

  // Qualifications validation
  const validQualifications = formData.qualifications.filter(q => q.trim().length > 0);
  if (validQualifications.length === 0) {
    errors.push({ field: 'qualifications', message: 'At least one qualification is required' });
  }

  // Services validation
  const validServices = formData.services.filter(s => s.trim().length > 0);
  if (validServices.length === 0) {
    errors.push({ field: 'services', message: 'At least one service is required' });
  }

  // Timings validation
  const availableDays = formData.timings.filter(t => t.is_available);
  if (availableDays.length === 0) {
    errors.push({ field: 'timings', message: 'At least one day must be available' });
  }

  // Validate time format
  formData.timings.forEach((timing, index) => {
    if (timing.is_available) {
      if (!timing.start_time || !timing.end_time) {
        errors.push({ 
          field: `timing_${index}`, 
          message: `Start time and end time are required for ${timing.day_of_week}` 
        });
      }
      
      if (timing.duration && (timing.duration < 5 || timing.duration > 120)) {
        errors.push({ 
          field: `timing_duration_${index}`, 
          message: `Duration must be between 5 and 120 minutes for ${timing.day_of_week}` 
        });
      }
    }
  });

  // FAQ validation
  formData.faqs.forEach((faq, index) => {
    if (!faq.question || faq.question.trim().length === 0) {
      errors.push({ field: `faq_question_${index}`, message: 'FAQ question is required' });
    }
    if (!faq.answer || faq.answer.trim().length === 0) {
      errors.push({ field: `faq_answer_${index}`, message: 'FAQ answer is required' });
    }
  });

  // Share procedures validation
  formData.share_procedures.forEach((procedure, index) => {
    if (!procedure.procedure_name || procedure.procedure_name.trim().length === 0) {
      errors.push({ field: `procedure_name_${index}`, message: 'Procedure name is required' });
    }
    if (procedure.share_value <= 0) {
      errors.push({ field: `procedure_value_${index}`, message: 'Share value must be greater than 0' });
    }
  });

  return errors;
}

export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validatePhone(phone: string): boolean {
  return /^[\d\s\-\+\(\)]+$/.test(phone) && phone.replace(/\D/g, '').length >= 10;
}

export function validatePassword(password: string): { valid: boolean; message?: string } {
  if (password.length < 6) {
    return { valid: false, message: 'Password must be at least 6 characters' };
  }
  if (password.length > 50) {
    return { valid: false, message: 'Password must be less than 50 characters' };
  }
  return { valid: true };
}

export function getFieldError(errors: ValidationError[], field: string): string | undefined {
  return errors.find(e => e.field === field)?.message;
}

