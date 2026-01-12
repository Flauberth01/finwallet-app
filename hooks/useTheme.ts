import { useColorScheme } from 'react-native';
import { useSettingsStore } from '@/stores';
import { colors } from '@/constants';

export function useTheme() {
    const systemColorScheme = useColorScheme();
    const { theme: themePreference, setTheme } = useSettingsStore();

    // Determine actual theme based on preference
    const isDark =
        themePreference === 'dark' ||
        (themePreference === 'system' && systemColorScheme === 'dark');

    // Get theme colors
    const themeColors = isDark ? colors.dark : colors.light;

    return {
        isDark,
        themePreference,
        setTheme,
        colors: {
            ...colors,
            ...themeColors,
            primary: colors.primary,
        },
    };
}
