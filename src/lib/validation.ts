/**
 * Form validation utilities for the Job Application Tracker
 */

import { JobFormData } from "./types";

// Email validation
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// URL validation
export const isValidUrl = (url: string): boolean => {
  if (!url) return true; // Empty URLs are allowed
  
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';
  } catch {
    // Simply return false if URL parsing fails
    return false;
  }
};

// Phone number validation
export const isValidPhone = (phone: string): boolean => {
  if (!phone) return true; // Empty phone numbers are allowed
  
  // Simple validation - allow digits, spaces, dashes, parentheses, and plus sign
  const phoneRegex = /^[0-9\s\-\(\)\+]+$/;
  return phoneRegex.test(phone);
};

// Validate job form data
export const validateJobForm = (data: Partial<JobFormData>): Record<string, string> => {
  const errors: Record<string, string> = {};
  
  // Required fields
  if (!data.company?.trim()) {
    errors.company = 'Company name is required';
  }
  
  if (!data.position?.trim()) {
    errors.position = 'Position name is required';
  }
  
  // URL validation if provided
  if (data.url && !isValidUrl(data.url)) {
    errors.url = 'Please enter a valid URL starting with http:// or https://';
  }
  
  // Email validation if provided
  if (data.contact_email && !isValidEmail(data.contact_email)) {
    errors.contact_email = 'Please enter a valid email address';
  }
  
  // Phone validation if provided
  if (data.contact_phone && !isValidPhone(data.contact_phone)) {
    errors.contact_phone = 'Please enter a valid phone number';
  }
  
  return errors;
};

// Validate sign-up form
export const validateSignUp = (data: { 
  email: string; 
  password: string; 
  confirmPassword: string; 
  name?: string;
}): Record<string, string> => {
  const errors: Record<string, string> = {};
  
  // Email validation
  if (!data.email) {
    errors.email = 'Email is required';
  } else if (!isValidEmail(data.email)) {
    errors.email = 'Please enter a valid email address';
  }
  
  // Password validation
  if (!data.password) {
    errors.password = 'Password is required';
  } else if (data.password.length < 8) {
    errors.password = 'Password must be at least 8 characters long';
  }
  
  // Password confirmation
  if (data.password !== data.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }
  
  return errors;
};

// Validate sign-in form
export const validateSignIn = (data: { 
  email: string; 
  password: string; 
}): Record<string, string> => {
  const errors: Record<string, string> = {};
  
  // Email validation
  if (!data.email) {
    errors.email = 'Email is required';
  } else if (!isValidEmail(data.email)) {
    errors.email = 'Please enter a valid email address';
  }
  
  // Password validation
  if (!data.password) {
    errors.password = 'Password is required';
  }
  
  return errors;
};

// Validate password reset form
export const validatePasswordReset = (data: {
  password: string;
  confirmPassword: string;
}): Record<string, string> => {
  const errors: Record<string, string> = {};
  
  // Password validation
  if (!data.password) {
    errors.password = 'Password is required';
  } else if (data.password.length < 8) {
    errors.password = 'Password must be at least 8 characters long';
  }
  
  // Password confirmation
  if (data.password !== data.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }
  
  return errors;
};