/**
 * Utility functions
 */

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistance, formatRelative } from 'date-fns';
import { fr } from 'date-fns/locale';

/**
 * Merge Tailwind classes with clsx
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format date to French locale
 */
export function formatDate(date: string | Date, formatStr = 'PPP'): string {
  return format(new Date(date), formatStr, { locale: fr });
}

/**
 * Format date to relative time (e.g., "il y a 2 heures")
 */
export function formatRelativeDate(date: string | Date): string {
  return formatDistance(new Date(date), new Date(), { addSuffix: true, locale: fr });
}

/**
 * Format date to relative with context (e.g., "hier à 14h30")
 */
export function formatRelativeWithContext(date: string | Date): string {
  return formatRelative(new Date(date), new Date(), { locale: fr });
}

/**
 * Format currency (EUR)
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount);
}

/**
 * Format number with French locale
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('fr-FR').format(num);
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return `${text.slice(0, length)}...`;
}

