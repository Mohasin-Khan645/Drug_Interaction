export const cx = (...values) => values.filter(Boolean).join(' ');

export const formatDate = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
};

export const formatDateTime = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const titleCase = (value) =>
  typeof value === 'string'
    ? value
        .toLowerCase()
        .split(/[\s_]+/)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ')
    : '';

export const greeting = (date = new Date()) => {
  const hour = date.getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
};

export const initials = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('') || '?';

export const confidenceLabel = (confidence) => {
  if (typeof confidence !== 'number') return { label: 'Unknown', tone: 'neutral' };
  if (confidence >= 0.9) return { label: 'High', tone: 'success' };
  if (confidence >= 0.45) return { label: 'Medium', tone: 'warning' };
  return { label: 'Low', tone: 'danger' };
};

export const drugDisplayName = (drug) => {
  if (!drug) return 'Unidentified medication';
  if (drug.brandName && drug.brandName !== drug.genericName) {
    return `${drug.genericName} (${drug.brandName})`;
  }
  return drug.genericName;
};

export const errorMessage = (error, fallback = 'Something went wrong. Please try again.') =>
  (error && error.message) || fallback;
