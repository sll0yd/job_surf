/**
 * Constants for the Job Application Tracker
 */

import { JobStatus } from './types';

// Job status options
export const JOB_STATUSES: {
  value: JobStatus;
  label: string;
  description: string;
}[] = [
  {
    value: 'saved',
    label: 'Saved',
    description: 'Job saved for later application'
  },
  {
    value: 'applied',
    label: 'Applied',
    description: 'Application submitted'
  },
  {
    value: 'interview',
    label: 'Interview',
    description: 'Interview scheduled or completed'
  },
  {
    value: 'offer',
    label: 'Offer',
    description: 'Received job offer'
  },
  {
    value: 'rejected',
    label: 'Rejected',
    description: 'Application rejected'
  }
];

// Sort options for job listings
export const SORT_OPTIONS = [
  {
    value: 'updated_at',
    label: 'Last Updated',
    directions: ['desc', 'asc']
  },
  {
    value: 'company',
    label: 'Company',
    directions: ['asc', 'desc']
  },
  {
    value: 'position',
    label: 'Position',
    directions: ['asc', 'desc']
  },
  {
    value: 'applied_date',
    label: 'Date Applied',
    directions: ['desc', 'asc']
  },
  {
    value: 'status',
    label: 'Status',
    directions: ['asc', 'desc']
  }
];

// Navigation items
export const NAV_ITEMS = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: 'LayoutDashboard'
  },
  {
    label: 'Jobs',
    href: '/jobs',
    icon: 'Briefcase'
  },
  {
    label: 'Analytics',
    href: '/analytics',
    icon: 'BarChart'
  },
  {
    label: 'Calendar',
    href: '/calendar',
    icon: 'Calendar'
  },
  {
    label: 'Settings',
    href: '/settings',
    icon: 'Settings'
  }
];

// Application validation messages
export const VALIDATION_MESSAGES = {
  REQUIRED: 'This field is required',
  EMAIL: 'Please enter a valid email address',
  URL: 'Please enter a valid URL (e.g. https://example.com)',
  PHONE: 'Please enter a valid phone number',
  PASSWORD_LENGTH: 'Password must be at least 8 characters',
  PASSWORD_MATCH: 'Passwords do not match'
};

// Max file upload size (5MB)
export const MAX_FILE_SIZE = 5 * 1024 * 1024;

// Allowed file types for resume/CV uploads
export const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

// Dashboard chart colors
export const CHART_COLORS = {
  saved: '#9CA3AF', // gray-400
  applied: '#60A5FA', // blue-400
  interview: '#A78BFA', // purple-400
  offer: '#34D399', // green-400
  rejected: '#F87171', // red-400
};

// Date format strings
export const DATE_FORMATS = {
  DISPLAY: 'MMM d, yyyy',
  INPUT: 'yyyy-MM-dd',
  API: 'yyyy-MM-dd\'T\'HH:mm:ss.SSSxxx',
};

// Routes that don't require authentication
export const PUBLIC_ROUTES = [
  '/',
  '/signin',
  '/signup',
  '/forgot-password',
  '/reset-password',
  '/auth/callback',
  '/about',
  '/privacy',
  '/terms',
];

// Transition durations
export const TRANSITIONS = {
  DEFAULT: 300,
  FAST: 150,
  SLOW: 500,
};

// Breakpoints for responsive design
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
};