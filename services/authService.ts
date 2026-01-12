import * as LocalAuthentication from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'biometric_auth_enabled';

export type BiometricType = 'fingerprint' | 'facial' | 'iris' | 'none';

export const authService = {
    /**
     * Check if device supports biometric authentication
     */
    async isAvailable(): Promise<boolean> {
        try {
            const compatible = await LocalAuthentication.hasHardwareAsync();
            const enrolled = await LocalAuthentication.isEnrolledAsync();
            return compatible && enrolled;
        } catch (error) {
            console.error('Error checking biometric availability:', error);
            return false;
        }
    },

    /**
     * Get the type of biometric authentication available
     */
    async getBiometricType(): Promise<BiometricType> {
        try {
            const types = await LocalAuthentication.supportedAuthenticationTypesAsync();

            if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
                return 'facial';
            }
            if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
                return 'fingerprint';
            }
            if (types.includes(LocalAuthentication.AuthenticationType.IRIS)) {
                return 'iris';
            }
            return 'none';
        } catch (error) {
            return 'none';
        }
    },

    /**
     * Get friendly name for biometric type
     */
    async getBiometricLabel(): Promise<string> {
        const type = await this.getBiometricType();
        switch (type) {
            case 'facial':
                return 'Face ID';
            case 'fingerprint':
                return 'Digital';
            case 'iris':
                return 'Íris';
            default:
                return 'Biometria';
        }
    },

    /**
     * Authenticate using biometrics
     */
    async authenticate(promptMessage?: string): Promise<{ success: boolean; error?: string }> {
        try {
            const isAvailable = await this.isAvailable();
            if (!isAvailable) {
                return { success: false, error: 'Biometria não disponível neste dispositivo' };
            }

            const result = await LocalAuthentication.authenticateAsync({
                promptMessage: promptMessage || 'Autentique para acessar o FinWallet',
                cancelLabel: 'Cancelar',
                disableDeviceFallback: false, // Allow PIN/password fallback
                fallbackLabel: 'Usar senha',
            });

            if (result.success) {
                return { success: true };
            }

            // Handle specific error types
            if (result.error === 'user_cancel') {
                return { success: false, error: 'Autenticação cancelada' };
            }
            if (result.error === 'lockout') {
                return { success: false, error: 'Muitas tentativas. Tente novamente mais tarde.' };
            }

            return { success: false, error: 'Falha na autenticação' };
        } catch (error) {
            console.error('Authentication error:', error);
            return { success: false, error: 'Erro durante autenticação' };
        }
    },

    /**
     * Check if biometric auth is enabled by user preference
     */
    async isEnabled(): Promise<boolean> {
        try {
            const enabled = await AsyncStorage.getItem(STORAGE_KEY);
            return enabled === 'true';
        } catch {
            return false;
        }
    },

    /**
     * Enable/disable biometric auth
     */
    async setEnabled(enabled: boolean): Promise<void> {
        await AsyncStorage.setItem(STORAGE_KEY, enabled.toString());
    },
};
