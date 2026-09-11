/**
 * DRUGSAFE Central Design System - Tokens
 * Defines the color palette, typography scale, borders, and shadows.
 * Enforces the Dark Sidebar (#0B1428) + Light Workspace (bg-slate-50, white cards) contrast.
 */

export const colors = {
  // Brand Primary: Healthcare Teal
  primary: {
    50: '#f0fdfa',
    100: '#ccfbf1',
    200: '#99f6e4',
    300: '#5eead4',
    400: '#2dd4bf',
    500: '#14b8a6',
    600: '#0d9488', // Standard interactive teal
    700: '#0f766e',
    800: '#115e59',
    900: '#134e4a',
    950: '#042f2e',
  },

  // Navigation Dark Navy (for Sidebar & Technical panels)
  navy: {
    sidebar: '#0B1428',
    sidebarBorder: '#16233B',
    sidebarHover: '#132038',
    sidebarActive: '#1A2C4E',
  },

  // Workspace Light (for clinical tables, cards, forms)
  workspace: {
    bg: '#f8fafc', // slate-50
    card: '#ffffff',
    cardBorder: '#e2e8f0', // slate-200
    cardHoverBorder: '#cbd5e1', // slate-300
    textPrimary: '#0f172a', // slate-900
    textSecondary: '#475569', // slate-600
    textMuted: '#94a3b8', // slate-400
  },

  // Clinical Severity Color Hierarchy
  severity: {
    critical: {
      bg: '#fef2f2',
      border: '#fecaca',
      text: '#b91c1c',
      dot: '#ef4444',
      badge: 'bg-rose-50 text-rose-700 border-rose-200',
    },
    major: {
      bg: '#fffbeb',
      border: '#fde68a',
      text: '#b45309',
      dot: '#f59e0b',
      badge: 'bg-amber-50 text-amber-800 border-amber-200',
    },
    moderate: {
      bg: '#fefce8',
      border: '#fef08a',
      text: '#a16207',
      dot: '#eab308',
      badge: 'bg-yellow-50 text-yellow-800 border-yellow-200',
    },
    safe: {
      bg: '#f0fdf4',
      border: '#bbf7d0',
      text: '#15803d',
      dot: '#22c55e',
      badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
  },
};

export const shadows = {
  card: '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)',
  cardHover: '0 4px 6px -1px rgba(0, 0, 0, 0.07), 0 2px 4px -2px rgba(0, 0, 0, 0.05)',
  popup: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
};

