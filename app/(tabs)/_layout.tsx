import { Tabs } from 'expo-router';
import { View } from 'react-native';
import { Home, Receipt, Target, Settings } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeContext } from '@/providers';
import { colors } from '@/constants';

export default function TabLayout() {
    const { isDark } = useThemeContext();
    const insets = useSafeAreaInsets();

    const tabBarBackground = isDark ? colors.dark.surface : colors.light.surface;
    const tabBarBorder = isDark ? colors.dark.border : colors.light.border;
    const activeColor = colors.primary[500];
    const inactiveColor = isDark ? colors.dark.textTertiary : colors.light.textTertiary;

    // Calculate proper bottom padding to stay above system navigation
    const bottomPadding = Math.max(insets.bottom, 10);

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: tabBarBackground,
                    borderTopColor: tabBarBorder,
                    borderTopWidth: 0.5,
                    height: 60 + bottomPadding,
                    paddingTop: 8,
                    paddingBottom: bottomPadding,
                    elevation: 0,
                    shadowOpacity: 0,
                },
                tabBarActiveTintColor: activeColor,
                tabBarInactiveTintColor: inactiveColor,
                tabBarLabelStyle: {
                    fontFamily: 'Inter_500Medium',
                    fontSize: 11,
                    marginTop: 2,
                },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Home',
                    tabBarIcon: ({ color, size }) => (
                        <Home color={color} size={size} strokeWidth={2} />
                    ),
                }}
            />
            <Tabs.Screen
                name="transactions"
                options={{
                    title: 'Transações',
                    tabBarIcon: ({ color, size }) => (
                        <Receipt color={color} size={size} strokeWidth={2} />
                    ),
                }}
            />
            <Tabs.Screen
                name="goals"
                options={{
                    title: 'Metas',
                    tabBarIcon: ({ color, size }) => (
                        <Target color={color} size={size} strokeWidth={2} />
                    ),
                }}
            />
            <Tabs.Screen
                name="settings"
                options={{
                    title: 'Config.',
                    tabBarIcon: ({ color, size }) => (
                        <Settings color={color} size={size} strokeWidth={2} />
                    ),
                }}
            />
        </Tabs>
    );
}
