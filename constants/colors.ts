// Design System - Colors
// Modern, Premium Color Palette for FinWallet

export const colors = {
    // Brand Primary - Indigo/Violet gradient feel
    primary: {
        50: '#F5F3FF',
        100: '#EDE9FE',
        200: '#DDD6FE',
        300: '#C4B5FD',
        400: '#A78BFA',
        500: '#8B5CF6', // Main brand color - Violet
        600: '#7C3AED',
        700: '#6D28D9',
        800: '#5B21B6',
        900: '#4C1D95',
    },

    // Secondary - Teal for accents
    secondary: {
        50: '#F0FDFA',
        100: '#CCFBF1',
        200: '#99F6E4',
        300: '#5EEAD4',
        400: '#2DD4BF',
        500: '#14B8A6',
        600: '#0D9488',
        700: '#0F766E',
        800: '#115E59',
        900: '#134E4A',
    },

    // Semantic
    success: '#10B981', // Emerald - mais suave
    warning: '#F59E0B', // Amber
    error: '#EF4444',   // Red
    info: '#06B6D4',    // Cyan

    // Finance - cores vibrantes mas não agressivas
    income: '#10B981',  // Emerald green
    expense: '#F43F5E', // Rose pink - mais suave que vermelho puro

    // Light Theme - Clean and Modern
    light: {
        background: '#FAFAFA',      // Off-white suave
        surface: '#FFFFFF',          // Branco puro para cards
        surfaceVariant: '#F4F4F5',   // Cinza muito claro
        surfaceElevated: '#FFFFFF',  // Cards elevados
        border: '#E4E4E7',           // Borda sutil
        borderLight: '#F4F4F5',      // Borda ainda mais sutil
        textPrimary: '#18181B',      // Quase preto
        textSecondary: '#71717A',    // Cinza médio
        textTertiary: '#A1A1AA',     // Cinza claro
        accent: '#8B5CF6',           // Violet accent
    },

    // Dark Theme - Sleek and Modern
    dark: {
        background: '#09090B',       // Quase preto
        surface: '#18181B',          // Zinc 900
        surfaceVariant: '#27272A',   // Zinc 800
        surfaceElevated: '#27272A',  // Cards elevados
        border: '#3F3F46',           // Zinc 700
        borderLight: '#27272A',      // Borda sutil
        textPrimary: '#FAFAFA',      // Quase branco
        textSecondary: '#A1A1AA',    // Zinc 400
        textTertiary: '#71717A',     // Zinc 500
        accent: '#A78BFA',           // Violet mais claro para dark
    },

    // Gradients (para uso em estilos inline)
    gradients: {
        primary: ['#8B5CF6', '#6366F1'],
        success: ['#10B981', '#14B8A6'],
        sunset: ['#F59E0B', '#F43F5E'],
    },
} as const;

// Category colors for charts - mais vibrantes e modernos
export const categoryColors = [
    '#8B5CF6', // Violet (primary)
    '#06B6D4', // Cyan
    '#F59E0B', // Amber
    '#10B981', // Emerald
    '#F43F5E', // Rose
    '#3B82F6', // Blue
    '#EC4899', // Pink
    '#F97316', // Orange
    '#14B8A6', // Teal
    '#6366F1', // Indigo
];

// Goal colors - cores para metas
export const goalColors = [
    '#8B5CF6', // Violet
    '#06B6D4', // Cyan
    '#10B981', // Emerald
    '#F59E0B', // Amber
    '#F43F5E', // Rose
    '#3B82F6', // Blue
];

export type ColorScheme = 'light' | 'dark';
