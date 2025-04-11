export const theme = {
  colors: {
    // Primary colors
    primary: {
      50: '#e6f1fe',
      100: '#cce3fd',
      200: '#99c7fb',
      300: '#66aaf9',
      400: '#338ef7',
      500: '#0072f5', // Main primary color
      600: '#005bc4',
      700: '#004493',
      800: '#002e62',
      900: '#001731',
    },
    // Secondary colors
    secondary: {
      50: '#f2eafa',
      100: '#e5d5f5',
      200: '#cbabeb',
      300: '#b182e1',
      400: '#9758d7',
      500: '#7d2ecd', // Main secondary color
      600: '#6425a4',
      700: '#4b1c7b',
      800: '#321252',
      900: '#190929',
    },
    // Success colors
    success: {
      50: '#e8faf0',
      100: '#d1f5e2',
      200: '#a3ebc4',
      300: '#75e1a7',
      400: '#47d789',
      500: '#1acd6c', // Main success color
      600: '#15a456',
      700: '#107b41',
      800: '#0b522b',
      900: '#052916',
    },
    // Warning colors
    warning: {
      50: '#fef8e7',
      100: '#fdf1cf',
      200: '#fbe39f',
      300: '#f9d46f',
      400: '#f7c63f',
      500: '#f5b80f', // Main warning color
      600: '#c4930c',
      700: '#936e09',
      800: '#624a06',
      900: '#312503',
    },
    // Error colors
    error: {
      50: '#fee7e7',
      100: '#fdcfcf',
      200: '#fb9f9f',
      300: '#f96f6f',
      400: '#f73f3f',
      500: '#f50f0f', // Main error color
      600: '#c40c0c',
      700: '#930909',
      800: '#620606',
      900: '#310303',
    },
    // Gray scale
    gray: {
      50: '#fafafa',
      100: '#f5f5f5',
      200: '#e5e5e5',
      300: '#d4d4d4',
      400: '#a3a3a3',
      500: '#737373',
      600: '#525252',
      700: '#404040',
      800: '#262626',
      900: '#171717',
    },
    // Background colors
    background: {
      primary: '#0f172a',
      secondary: '#1e293b',
      tertiary: '#334155',
    },
  },

  // Typography
  typography: {
    fontFamily: {
      sans: 'Inter, system-ui, -apple-system, sans-serif',
      mono: 'JetBrains Mono, monospace',
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
      '5xl': '3rem',
    },
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    lineHeight: {
      none: 1,
      tight: 1.25,
      snug: 1.375,
      normal: 1.5,
      relaxed: 1.625,
      loose: 2,
    },
  },

  // Spacing
  spacing: {
    0: '0',
    1: '0.25rem',
    2: '0.5rem',
    3: '0.75rem',
    4: '1rem',
    5: '1.25rem',
    6: '1.5rem',
    8: '2rem',
    10: '2.5rem',
    12: '3rem',
    16: '4rem',
    20: '5rem',
    24: '6rem',
    32: '8rem',
  },

  // Borders
  borders: {
    radius: {
      none: '0',
      sm: '0.125rem',
      base: '0.25rem',
      md: '0.375rem',
      lg: '0.5rem',
      xl: '0.75rem',
      '2xl': '1rem',
      full: '9999px',
    },
    width: {
      none: '0',
      thin: '1px',
      base: '2px',
      thick: '3px',
    },
  },

  // Shadows
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
    none: 'none',
  },

  // Transitions
  transitions: {
    duration: {
      75: '75ms',
      100: '100ms',
      150: '150ms',
      200: '200ms',
      300: '300ms',
      500: '500ms',
      700: '700ms',
      1000: '1000ms',
    },
    timing: {
      linear: 'linear',
      in: 'cubic-bezier(0.4, 0, 1, 1)',
      out: 'cubic-bezier(0, 0, 0.2, 1)',
      inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
  },

  // Z-index
  zIndex: {
    0: '0',
    10: '10',
    20: '20',
    30: '30',
    40: '40',
    50: '50',
    auto: 'auto',
    dropdown: '1000',
    modal: '1100',
    tooltip: '1200',
  },
};
