import { View, Text, ScrollView, Switch, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Moon, Sun, Bell, Fingerprint, Trash2, ChevronRight, FileSpreadsheet, Save, Clock, BellRing } from 'lucide-react-native';
import { useState, useEffect } from 'react';
import { Card, Button } from '@/components/ui';
import { useThemeContext } from '@/providers';
import { useSettingsStore, useTransactionStore, useGoalStore } from '@/stores';
import { exportService, notificationService } from '@/services';
import { colors } from '@/constants';

interface SettingsItemProps {
    icon: React.ReactNode;
    title: string;
    subtitle?: string;
    rightElement?: React.ReactNode;
    onPress?: () => void;
    loading?: boolean;
}

function SettingsItem({ icon, title, subtitle, rightElement, onPress, loading }: SettingsItemProps) {
    return (
        <Card
            variant="default"
            padding="md"
            onPress={loading ? undefined : onPress}
            className="flex-row items-center mb-2"
        >
            <View className="w-10 h-10 rounded-full bg-surface-variant-light dark:bg-surface-variant-dark items-center justify-center mr-3">
                {loading ? <ActivityIndicator size="small" color={colors.primary[500]} /> : icon}
            </View>
            <View className="flex-1">
                <Text className="text-base font-inter-medium text-text-primary-light dark:text-text-primary-dark">
                    {title}
                </Text>
                {subtitle && (
                    <Text className="text-sm font-inter-regular text-text-secondary-light dark:text-text-secondary-dark">
                        {subtitle}
                    </Text>
                )}
            </View>
            {rightElement}
        </Card>
    );
}

export default function SettingsScreen() {
    const { isDark, toggleTheme } = useThemeContext();
    const {
        notifications_enabled,
        biometric_enabled,
        setNotificationsEnabled,
        setBiometricEnabled,
    } = useSettingsStore();

    const [exportingTransactions, setExportingTransactions] = useState(false);
    const [exportingGoals, setExportingGoals] = useState(false);
    const [creatingBackup, setCreatingBackup] = useState(false);
    const [dailyReminderEnabled, setDailyReminderEnabled] = useState(false);
    const [reminderTime, setReminderTime] = useState({ hour: 20, minute: 0 });

    const iconColor = isDark ? colors.dark.textSecondary : colors.light.textSecondary;

    // Load notification settings
    useEffect(() => {
        const loadSettings = async () => {
            const enabled = await notificationService.isDailyReminderEnabled();
            const time = await notificationService.getReminderTime();
            setDailyReminderEnabled(enabled);
            setReminderTime(time);
        };
        loadSettings();
    }, []);

    // Handle daily reminder toggle
    const handleDailyReminderToggle = async (value: boolean) => {
        if (value) {
            const hasPermission = await notificationService.requestPermission();
            if (hasPermission) {
                await notificationService.scheduleDailyReminder(reminderTime.hour, reminderTime.minute);
                setDailyReminderEnabled(true);
                Alert.alert('✅ Lembrete Ativado', `Você receberá um lembrete às ${reminderTime.hour}:00 para registrar suas despesas.`);
            } else {
                Alert.alert('Permissão Negada', 'Por favor, habilite notificações nas configurações do seu dispositivo.');
            }
        } else {
            await notificationService.cancelDailyReminder();
            setDailyReminderEnabled(false);
        }
    };

    // Test notification
    const handleTestNotification = async () => {
        const hasPermission = await notificationService.requestPermission();
        if (hasPermission) {
            await notificationService.sendInstantNotification(
                '🎉 Teste de Notificação',
                'As notificações do FinWallet estão funcionando!'
            );
        } else {
            Alert.alert('Permissão Negada', 'Por favor, habilite notificações nas configurações.');
        }
    };

    // Export transactions to CSV
    const handleExportTransactions = async () => {
        setExportingTransactions(true);
        try {
            const filePath = await exportService.exportTransactionsToCSV();
            const shared = await exportService.shareFile(filePath);
            if (!shared) {
                Alert.alert('Sucesso', 'Arquivo CSV criado com sucesso!');
            }
        } catch (error) {
            Alert.alert('Erro', 'Não foi possível exportar os dados');
        } finally {
            setExportingTransactions(false);
        }
    };

    // Export goals to CSV
    const handleExportGoals = async () => {
        setExportingGoals(true);
        try {
            const filePath = await exportService.exportGoalsToCSV();
            const shared = await exportService.shareFile(filePath);
            if (!shared) {
                Alert.alert('Sucesso', 'Arquivo CSV criado com sucesso!');
            }
        } catch (error) {
            Alert.alert('Erro', 'Não foi possível exportar as metas');
        } finally {
            setExportingGoals(false);
        }
    };

    // Create backup
    const handleCreateBackup = async () => {
        setCreatingBackup(true);
        try {
            const filePath = await exportService.exportBackup();
            const shared = await exportService.shareFile(filePath);
            if (!shared) {
                Alert.alert('Sucesso', 'Backup criado com sucesso!');
            }
        } catch (error) {
            Alert.alert('Erro', 'Não foi possível criar o backup');
        } finally {
            setCreatingBackup(false);
        }
    };

    // Clear all data
    const handleClearData = () => {
        Alert.alert(
            'Limpar Todos os Dados',
            'Esta ação irá APAGAR PERMANENTEMENTE todas as suas transações, metas e depósitos. Deseja continuar?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Limpar',
                    style: 'destructive',
                    onPress: () => {
                            Alert.alert(
                                'Confirmação Final',
                                'Tem CERTEZA ABSOLUTA? Esta ação NÃO PODE ser desfeita!',
                                [
                                    { text: 'Cancelar', style: 'cancel' },
                                    {
                                        text: 'Sim, Apagar Tudo',
                                        style: 'destructive',
                                        onPress: async () => {
                                            try {
                                                const { clearAllData } = await import('@/db');
                                                await clearAllData();
                                                
                                                // Refresh all stores to update UI immediately
                                                await useTransactionStore.getState().refreshAll();
                                                await useGoalStore.getState().refreshAll();
                                                
                                                Alert.alert('✅ Dados Apagados', 'Todos os seus dados foram removidos com sucesso.');
                                            } catch (error) {
                                                console.error('Error clearing data:', error);
                                                Alert.alert('Erro', 'Não foi possível limpar os dados.');
                                            }
                                        },
                                    },
                                ]
                            );
                    },
                },
            ]
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
            {/* Header */}
            <View className="px-4 pt-4 pb-2">
                <Text className="text-2xl font-inter-bold text-text-primary-light dark:text-text-primary-dark">
                    Configurações
                </Text>
            </View>

            <ScrollView
                className="flex-1"
                contentContainerClassName="p-4"
                showsVerticalScrollIndicator={false}
            >
                {/* Appearance */}
                <Text className="text-sm font-inter-semibold text-text-secondary-light dark:text-text-secondary-dark mb-2 uppercase tracking-wide">
                    Aparência
                </Text>

                <SettingsItem
                    icon={isDark ? <Moon color={colors.primary[500]} size={20} /> : <Sun color={colors.warning} size={20} />}
                    title="Modo Escuro"
                    subtitle={isDark ? 'Ativado' : 'Desativado'}
                    rightElement={
                        <Switch
                            value={isDark}
                            onValueChange={toggleTheme}
                            trackColor={{ false: '#E2E8F0', true: colors.primary[200] }}
                            thumbColor={isDark ? colors.primary[500] : '#FFFFFF'}
                        />
                    }
                />

                {/* Security */}
                <Text className="text-sm font-inter-semibold text-text-secondary-light dark:text-text-secondary-dark mb-2 mt-6 uppercase tracking-wide">
                    Segurança
                </Text>

                <SettingsItem
                    icon={<Fingerprint color={iconColor} size={20} />}
                    title="Login Biométrico"
                    subtitle="Use digital ou Face ID"
                    rightElement={
                        <Switch
                            value={biometric_enabled}
                            onValueChange={setBiometricEnabled}
                            trackColor={{ false: '#E2E8F0', true: colors.primary[200] }}
                            thumbColor={biometric_enabled ? colors.primary[500] : '#FFFFFF'}
                        />
                    }
                />

                {/* Notifications */}
                <Text className="text-sm font-inter-semibold text-text-secondary-light dark:text-text-secondary-dark mb-2 mt-6 uppercase tracking-wide">
                    Notificações
                </Text>

                <SettingsItem
                    icon={<Clock color={colors.primary[500]} size={20} />}
                    title="Lembrete Diário"
                    subtitle={dailyReminderEnabled ? `Ativo às ${reminderTime.hour}:00` : 'Receba um lembrete para registrar gastos'}
                    rightElement={
                        <Switch
                            value={dailyReminderEnabled}
                            onValueChange={handleDailyReminderToggle}
                            trackColor={{ false: '#E2E8F0', true: colors.primary[200] }}
                            thumbColor={dailyReminderEnabled ? colors.primary[500] : '#FFFFFF'}
                        />
                    }
                />

                <SettingsItem
                    icon={<BellRing color={iconColor} size={20} />}
                    title="Testar Notificação"
                    subtitle="Enviar notificação de teste"
                    rightElement={<ChevronRight color={iconColor} size={20} />}
                    onPress={handleTestNotification}
                />

                {/* Export */}
                <Text className="text-sm font-inter-semibold text-text-secondary-light dark:text-text-secondary-dark mb-2 mt-6 uppercase tracking-wide">
                    Exportar Dados
                </Text>

                <SettingsItem
                    icon={<FileSpreadsheet color={colors.income} size={20} />}
                    title="Exportar Transações"
                    subtitle="Gerar arquivo CSV para Excel"
                    rightElement={<ChevronRight color={iconColor} size={20} />}
                    onPress={handleExportTransactions}
                    loading={exportingTransactions}
                />

                <SettingsItem
                    icon={<FileSpreadsheet color={colors.primary[500]} size={20} />}
                    title="Exportar Metas"
                    subtitle="Gerar arquivo CSV para Excel"
                    rightElement={<ChevronRight color={iconColor} size={20} />}
                    onPress={handleExportGoals}
                    loading={exportingGoals}
                />

                {/* Backup */}
                <Text className="text-sm font-inter-semibold text-text-secondary-light dark:text-text-secondary-dark mb-2 mt-6 uppercase tracking-wide">
                    Backup
                </Text>

                <SettingsItem
                    icon={<Save color={colors.primary[500]} size={20} />}
                    title="Criar Backup"
                    subtitle="Salvar todos os dados em JSON"
                    rightElement={<ChevronRight color={iconColor} size={20} />}
                    onPress={handleCreateBackup}
                    loading={creatingBackup}
                />

                {/* Danger Zone */}
                <Text className="text-sm font-inter-semibold text-error mb-2 mt-6 uppercase tracking-wide">
                    Zona de Perigo
                </Text>

                <SettingsItem
                    icon={<Trash2 color={colors.error} size={20} />}
                    title="Limpar Todos os Dados"
                    subtitle="Esta ação não pode ser desfeita"
                    rightElement={<ChevronRight color={iconColor} size={20} />}
                    onPress={handleClearData}
                />

                {/* App Info */}
                <View className="items-center mt-8 mb-4">
                    <Text className="text-sm font-inter-medium text-text-tertiary-light dark:text-text-tertiary-dark">
                        FinWallet v1.0.0
                    </Text>
                    <Text className="text-xs font-inter-regular text-text-tertiary-light dark:text-text-tertiary-dark mt-1">
                        Desenvolvido com ❤️ usando React Native
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
