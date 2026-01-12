import * as Haptics from 'expo-haptics';

/**
 * Haptic Feedback Service
 * Provides tactile feedback for user interactions
 */
export const hapticService = {
    /**
     * Light feedback - for selections, toggles
     */
    light: async () => {
        try {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        } catch (error) {
            // Haptics not available on this device
        }
    },

    /**
     * Medium feedback - for button presses, confirmations
     */
    medium: async () => {
        try {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        } catch (error) {
            // Haptics not available on this device
        }
    },

    /**
     * Heavy feedback - for important actions, errors
     */
    heavy: async () => {
        try {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        } catch (error) {
            // Haptics not available on this device
        }
    },

    /**
     * Success feedback - for successful operations
     */
    success: async () => {
        try {
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch (error) {
            // Haptics not available on this device
        }
    },

    /**
     * Warning feedback - for warnings
     */
    warning: async () => {
        try {
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        } catch (error) {
            // Haptics not available on this device
        }
    },

    /**
     * Error feedback - for errors
     */
    error: async () => {
        try {
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        } catch (error) {
            // Haptics not available on this device
        }
    },

    /**
     * Selection feedback - for tab switches, list selections
     */
    selection: async () => {
        try {
            await Haptics.selectionAsync();
        } catch (error) {
            // Haptics not available on this device
        }
    },
};
