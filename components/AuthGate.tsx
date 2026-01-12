import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, Alert, AppState, AppStateStatus } from 'react-native';
import { Fingerprint, ShieldCheck, AlertCircle } from 'lucide-react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withRepeat, withSequence } from 'react-native-reanimated';
import { authService } from '@/services';
import { useSettingsStore } from '@/stores';
import { colors } from '@/constants';

interface AuthGateProps {
    children: React.ReactNode;
}

export function AuthGate({ children }: AuthGateProps) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [biometricLabel, setBiometricLabel] = useState('Biometria');

    const { biometric_enabled } = useSettingsStore();

    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    // Check if auth is required and authenticate
    const authenticate = async () => {
        setError(null);
        setIsLoading(true);

        try {
            // Check if biometric is enabled
            if (!biometric_enabled) {
                setIsAuthenticated(true);
                setIsLoading(false);
                return;
            }

            // Check if biometric is available
            const isAvailable = await authService.isAvailable();
            if (!isAvailable) {
                // Biometric not available, allow access
                setIsAuthenticated(true);
                setIsLoading(false);
                return;
            }

            // Get biometric label
            const label = await authService.getBiometricLabel();
            setBiometricLabel(label);

            // Authenticate
            const result = await authService.authenticate();

            if (result.success) {
                setIsAuthenticated(true);
            } else {
                setError(result.error || 'Falha na autenticação');
            }
        } catch (err) {
            setError('Erro durante autenticação');
        } finally {
            setIsLoading(false);
        }
    };

    // Handle app state changes (lock when app goes to background)
    useEffect(() => {
        const handleAppStateChange = (nextAppState: AppStateStatus) => {
            if (nextAppState === 'active' && biometric_enabled && isAuthenticated) {
                // Re-authenticate when app comes back to foreground
                // Only if was previously authenticated (to avoid double auth on first open)
            } else if (nextAppState === 'background' && biometric_enabled) {
                // Lock when going to background
                setIsAuthenticated(false);
            }
        };

        const subscription = AppState.addEventListener('change', handleAppStateChange);
        return () => subscription?.remove();
    }, [biometric_enabled, isAuthenticated]);

    // Initial authentication
    useEffect(() => {
        authenticate();
    }, [biometric_enabled]);

    // Animate the fingerprint icon
    useEffect(() => {
        if (!isAuthenticated && !isLoading) {
            scale.value = withRepeat(
                withSequence(
                    withSpring(1.1, { damping: 5 }),
                    withSpring(1, { damping: 5 })
                ),
                -1,
                true
            );
        }
    }, [isAuthenticated, isLoading]);

    // If authenticated, show the app
    if (isAuthenticated) {
        return <>{children}</>;
    }

    // Loading state
    if (isLoading) {
        return (
            <View className="flex-1 bg-background-light dark:bg-background-dark items-center justify-center">
                <ShieldCheck color={colors.primary[500]} size={48} />
                <Text className="text-text-primary-light dark:text-text-primary-dark text-lg font-inter-semibold mt-4">
                    Verificando...
                </Text>
            </View>
        );
    }

    // Lock screen
    return (
        <View className="flex-1 bg-background-light dark:bg-background-dark items-center justify-center px-8">
            {/* Logo/Icon */}
            <View
                className="w-24 h-24 rounded-full items-center justify-center mb-6"
                style={{ backgroundColor: colors.primary[500] + '20' }}
            >
                <ShieldCheck color={colors.primary[500]} size={48} />
            </View>

            <Text className="text-text-primary-light dark:text-text-primary-dark text-2xl font-inter-bold mb-2">
                FinWallet
            </Text>

            <Text className="text-text-secondary-light dark:text-text-secondary-dark text-base font-inter-regular text-center mb-8">
                Use {biometricLabel} para desbloquear
            </Text>

            {/* Error message */}
            {error && (
                <View className="flex-row items-center bg-error/10 px-4 py-3 rounded-xl mb-6">
                    <AlertCircle color={colors.error} size={20} />
                    <Text className="text-error font-inter-medium ml-2">
                        {error}
                    </Text>
                </View>
            )}

            {/* Authenticate button */}
            <Pressable onPress={authenticate}>
                <Animated.View
                    style={[animatedStyle, { backgroundColor: colors.primary[500] }]}
                    className="w-20 h-20 rounded-full items-center justify-center"
                >
                    <Fingerprint color="#FFFFFF" size={40} />
                </Animated.View>
            </Pressable>

            <Text className="text-text-tertiary-light dark:text-text-tertiary-dark text-sm font-inter-regular mt-4">
                Toque para autenticar
            </Text>
        </View>
    );
}
