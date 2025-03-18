import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow, isValid } from "date-fns";
import { JobStatus } from "./types";

/**
 * Combines class names with tailwind-merge
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a date string in a human-readable format
 * @param dateString - ISO date string
 * @param formatStr - format string (default: 'PPP')
 */
export function formatDate(dateString: string | null | undefined, formatStr: string = "PPP"): string {
  if (!dateString) return "Not set";
  
  const date = new Date(dateString);
  if (!isValid(date)) return "Invalid date";
  
  return format(date, formatStr);
}

/**
 * Returns a relative time string (e.g., "2 days ago")
 */
export function getRelativeTime(dateString: string | null | undefined): string {
  if (!dateString) return "Not set";
  
  const date = new Date(dateString);
  if (!isValid(date)) return "Invalid date";
  
  return formatDistanceToNow(date, { addSuffix: true });
}

/**
 * Get color for job status
 */
export function getStatusColor(status: JobStatus): {
  bg: string;
  text: string;
  border: string;
} {
  switch (status) {
    case "saved":
      return {
        bg: "bg-gray-100",
        text: "text-gray-800",
        border: "border-gray-300",
      };
    case "applied":
      return {
        bg: "bg-blue-100",
        text: "text-blue-800",
        border: "border-blue-300",
      };
    case "interview":
      return {
        bg: "bg-purple-100",
        text: "text-purple-800",
        border: "border-purple-300",
      };
    case "offer":
      return {
        bg: "bg-green-100",
        text: "text-green-800",
        border: "border-green-300",
      };
    case "rejected":
      return {
        bg: "bg-red-100",
        text: "text-red-800",
        border: "border-red-300",
      };
    default:
      return {
        bg: "bg-gray-100",
        text: "text-gray-800",
        border: "border-gray-300",
      };
  }
}

/**
 * Get formatted label for job status
 */
export function getStatusLabel(status: JobStatus): string {
  switch (status) {
    case "saved":
      return "Saved";
    case "applied":
      return "Applied";
    case "interview":
      return "Interview";
    case "offer":
      return "Offer";
    case "rejected":
      return "Rejected";
    default:
      return status;
  }
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}

/**
 * Format currency
 */
export function formatCurrency(amount: string | number | null | undefined): string {
  if (amount === null || amount === undefined || amount === "") return "";
  
  const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
  
  if (isNaN(numAmount)) return "";
  
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(numAmount);
}

/**
 * Create a debounced function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Parse and validate URL
 */
export function isValidUrl(urlString: string): boolean {
  try {
    const url = new URL(urlString);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Generate a slug from a string
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-");
}