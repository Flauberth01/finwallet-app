import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { View, ActivityIndicator, Text } from 'react-native';
import { useEffect, useState } from 'react';
import { ThemeProvider, useThemeContext } from '@/providers';
import { initializeDatabase } from '@/db';
import { useTransactionStore } from '@/stores';
import { AuthGate } from '@/components/AuthGate';
import '../global.css';

// Create a query client
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes
            retry: 2,
        },
    },
});

function RootLayoutContent() {
    const { isDark } = useThemeContext();

    return (
        <>
            <StatusBar style={isDark ? 'light' : 'dark'} />
            <Stack
                screenOptions={{
                    headerShown: false,
                    contentStyle: {
                        backgroundColor: isDark ? '#0F172A' : '#F8FAFC',
                    },
                    animation: 'slide_from_right',
                }}
            >
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen
                    name="transaction/new"
                    options={{
                        presentation: 'modal',
                        animation: 'slide_from_bottom',
                    }}
                />
                <Stack.Screen
                    name="goal/new"
                    options={{
                        presentation: 'modal',
                        animation: 'slide_from_bottom',
                    }}
                />
            </Stack>
        </>
    );
}

function AppInitializer({ children }: { children: React.ReactNode }) {
    const [isDbReady, setIsDbReady] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { refreshAll } = useTransactionStore();

    useEffect(() => {
        async function init() {
            try {
                await initializeDatabase();
                await refreshAll();
                setIsDbReady(true);
            } catch (e) {
                console.error('Database initialization failed:', e);
                setError((e as Error).message);
            }
        }
        init();
    }, []);

    if (error) {
        return (
            <View className="flex-1 items-center justify-center bg-background-light dark:bg-background-dark p-4">
                <Text className="text-error text-center mb-2">Database Error</Text>
                <Text className="text-text-secondary-light text-center">{error}</Text>
            </View>
        );
    }

    if (!isDbReady) {
        return (
            <View className="flex-1 items-center justify-center bg-background-light dark:bg-background-dark">
                <ActivityIndicator size="large" color="#6366F1" />
                <Text className="text-text-secondary-light mt-4">Carregando dados...</Text>
            </View>
        );
    }

    return <>{children}</>;
}

export default function RootLayout() {
    const [fontsLoaded] = useFonts({
        Inter_400Regular,
        Inter_500Medium,
        Inter_600SemiBold,
        Inter_700Bold,
    });

    if (!fontsLoaded) {
        return (
            <View className="flex-1 items-center justify-center bg-background-light dark:bg-background-dark">
                <ActivityIndicator size="large" color="#6366F1" />
            </View>
        );
    }

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <QueryClientProvider client={queryClient}>
                <ThemeProvider>
                    <AppInitializer>
                        <AuthGate>
                            <RootLayoutContent />
                        </AuthGate>
                    </AppInitializer>
                </ThemeProvider>
            </QueryClientProvider>
        </GestureHandlerRootView>
    );
}
