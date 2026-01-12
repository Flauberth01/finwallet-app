import { View, Text, ScrollView, Pressable, Alert, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Plus, Trash2, Calendar, CalendarCheck } from 'lucide-react-native';
import { useState, useCallback, useEffect, useRef } from 'react';
import { Button, Card, ProgressRing, AmountDisplay, Input } from '@/components/ui';
import { useThemeContext } from '@/providers';
import { useGoalStore } from '@/stores';
import { colors } from '@/constants';
import { TextInput } from 'react-native';

export default function GoalDetailScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id: string }>();
    const { isDark } = useThemeContext();
    const {
        selectedGoal,
        deposits,
        isLoading,
        fetchGoal,
        fetchDeposits,
        addDeposit,
        deleteDeposit,
        deleteGoal,
        clearSelectedGoal,
    } = useGoalStore();

    const [refreshing, setRefreshing] = useState(false);
    const [showDepositModal, setShowDepositModal] = useState(false);
    const [depositAmount, setDepositAmount] = useState('');
    const [depositNote, setDepositNote] = useState('');
    const depositInputRef = useRef<TextInput>(null);

    const iconColor = isDark ? colors.dark.textSecondary : colors.light.textSecondary;

    // Load goal data
    useEffect(() => {
        if (id) {
            fetchGoal(id);
            fetchDeposits(id);
        }
        return () => clearSelectedGoal();
    }, [id]);

    // Pull to refresh
    const onRefresh = useCallback(async () => {
        if (!id) return;
        setRefreshing(true);
        await Promise.all([fetchGoal(id), fetchDeposits(id)]);
        setRefreshing(false);
    }, [id]);

    // Parse amount
    const parseAmount = (value: string): number => {
        const cleaned = value.replace(/[^\d]/g, '');
        return parseInt(cleaned) || 0;
    };

    // Format amount
    const formatAmount = (value: string): string => {
        const cents = parseAmount(value);
        if (cents === 0) return 'R$ 0,00';
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        }).format(cents / 100);
    };

    // Handle deposit
    const handleAddDeposit = async () => {
        if (!id || !depositAmount || parseAmount(depositAmount) === 0) {
            Alert.alert('Erro', 'Informe um valor válido');
            return;
        }

        try {
            await addDeposit({
                goal_id: id,
                amount: parseAmount(depositAmount),
                date: new Date().toISOString().split('T')[0],
                note: depositNote.trim() || undefined,
            });
            setDepositAmount('');
            setDepositNote('');
            setShowDepositModal(false);
        } catch (error) {
            Alert.alert('Erro', 'Não foi possível adicionar o depósito');
        }
    };

    // Handle delete goal
    const handleDeleteGoal = () => {
        Alert.alert(
            'Excluir Meta',
            'Tem certeza que deseja excluir esta meta? Esta ação não pode ser desfeita.',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Excluir',
                    style: 'destructive',
                    onPress: async () => {
                        if (!id) return;
                        await deleteGoal(id);
                        router.back();
                    },
                },
            ]
        );
    };

    // Handle delete deposit
    const handleDeleteDeposit = (depositId: string) => {
        Alert.alert(
            'Excluir Depósito',
            'Tem certeza que deseja excluir este depósito?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Excluir',
                    style: 'destructive',
                    onPress: () => deleteDeposit(depositId),
                },
            ]
        );
    };

    if (!selectedGoal) {
        return (
            <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark items-center justify-center">
                <Text className="text-text-secondary-light dark:text-text-secondary-dark">
                    Carregando...
                </Text>
            </SafeAreaView>
        );
    }

    const progress = selectedGoal.target_amount > 0
        ? (selectedGoal.current_amount / selectedGoal.target_amount) * 100
        : 0;

    const remaining = Math.max(0, selectedGoal.target_amount - selectedGoal.current_amount);

    const daysLeft = Math.ceil(
        (new Date(selectedGoal.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );

    return (
        <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
            {/* Header */}
            <View
                className="px-4 py-4 flex-row items-center justify-between"
                style={{ backgroundColor: selectedGoal.color }}
            >
                <Pressable onPress={() => router.back()} className="p-2">
                    <ArrowLeft color="white" size={24} />
                </Pressable>
                <Text className="text-lg font-inter-semibold text-white flex-1 text-center" numberOfLines={1}>
                    {selectedGoal.name}
                </Text>
                <Pressable onPress={handleDeleteGoal} className="p-2">
                    <Trash2 color="white" size={20} />
                </Pressable>
            </View>

            <ScrollView
                className="flex-1"
                contentContainerClassName="p-4"
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {/* Progress Card */}
                <Card variant="elevated" className="mb-4 items-center py-6">
                    <ProgressRing
                        progress={progress}
                        size={160}
                        strokeWidth={12}
                        color={selectedGoal.color}
                        isDark={isDark}
                        showPercentage={true}
                    />
                    <View className="mt-4 items-center">
                        <Text className="text-sm font-inter-medium text-text-secondary-light dark:text-text-secondary-dark">
                            Valor acumulado
                        </Text>
                        <Text className="text-2xl font-inter-bold text-text-primary-light dark:text-text-primary-dark mt-1">
                            R$ {(selectedGoal.current_amount / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </Text>
                        <Text className="text-sm font-inter-regular text-text-tertiary-light dark:text-text-tertiary-dark mt-1">
                            de R$ {(selectedGoal.target_amount / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </Text>
                    </View>

                    {/* Stats */}
                    <View className="flex-row mt-6 w-full">
                        <View className="flex-1 items-center border-r border-border-light dark:border-border-dark">
                            <Text className="text-xs font-inter-medium text-text-tertiary-light dark:text-text-tertiary-dark">
                                FALTAM
                            </Text>
                            <Text className="text-base font-inter-semibold text-text-primary-light dark:text-text-primary-dark mt-1">
                                R$ {(remaining / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </Text>
                        </View>
                        <View className="flex-1 items-center">
                            <Text className="text-xs font-inter-medium text-text-tertiary-light dark:text-text-tertiary-dark">
                                {daysLeft >= 0 ? 'DIAS RESTANTES' : 'DIAS ATRASADO'}
                            </Text>
                            <Text className="text-base font-inter-semibold text-text-primary-light dark:text-text-primary-dark mt-1">
                                {Math.abs(daysLeft)} dias
                            </Text>
                        </View>
                    </View>

                    {/* Add Deposit Button */}
                    {!selectedGoal.is_completed && (
                        <Button
                            variant="primary"
                            size="lg"
                            className="mt-6"
                            leftIcon={<Plus color="white" size={20} />}
                            onPress={() => setShowDepositModal(true)}
                        >
                            Adicionar Depósito
                        </Button>
                    )}

                    {selectedGoal.is_completed && (
                        <View className="flex-row items-center mt-6 bg-green-100 dark:bg-green-900 px-4 py-2 rounded-full">
                            <CalendarCheck color={colors.income} size={20} />
                            <Text className="text-sm font-inter-semibold text-green-700 dark:text-green-300 ml-2">
                                Meta Concluída! 🎉
                            </Text>
                        </View>
                    )}
                </Card>

                {/* Deposits History */}
                <Text className="text-lg font-inter-semibold text-text-primary-light dark:text-text-primary-dark mb-3">
                    Histórico de Depósitos
                </Text>

                {deposits.length > 0 ? (
                    <Card variant="default">
                        {deposits.map((deposit, index) => (
                            <Pressable
                                key={deposit.id}
                                onLongPress={() => handleDeleteDeposit(deposit.id)}
                                className={`flex-row items-center ${index > 0 ? 'mt-3 pt-3 border-t border-border-light dark:border-border-dark' : ''
                                    }`}
                            >
                                <View
                                    className="w-10 h-10 rounded-full items-center justify-center mr-3"
                                    style={{ backgroundColor: selectedGoal.color + '20' }}
                                >
                                    <Plus color={selectedGoal.color} size={18} />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-sm font-inter-medium text-text-primary-light dark:text-text-primary-dark">
                                        {deposit.note || 'Depósito'}
                                    </Text>
                                    <Text className="text-xs font-inter-regular text-text-tertiary-light dark:text-text-tertiary-dark">
                                        {new Date(deposit.date).toLocaleDateString('pt-BR')}
                                    </Text>
                                </View>
                                <AmountDisplay amount={deposit.amount} type="income" size="sm" showSign />
                            </Pressable>
                        ))}
                    </Card>
                ) : (
                    <Card variant="filled" className="items-center py-8">
                        <Text className="text-sm font-inter-medium text-text-secondary-light dark:text-text-secondary-dark text-center">
                            Nenhum depósito ainda.{'\n'}
                            Comece a guardar dinheiro!
                        </Text>
                    </Card>
                )}

                <Text className="text-xs font-inter-regular text-text-tertiary-light dark:text-text-tertiary-dark text-center mt-4">
                    Pressione e segure para excluir um depósito
                </Text>
            </ScrollView>

            {/* Deposit Modal */}
            {showDepositModal && (
                <View
                    className="absolute inset-0 bg-black/50 items-center justify-center px-4"
                >
                    <Card variant="elevated" className="w-full max-w-sm">
                        <Text className="text-lg font-inter-semibold text-text-primary-light dark:text-text-primary-dark mb-4">
                            Novo Depósito
                        </Text>

                        <Pressable
                            onPress={() => depositInputRef.current?.focus()}
                            className="items-center py-4 mb-4 bg-surface-variant-light dark:bg-surface-variant-dark rounded-xl"
                        >
                            <Text className="text-xs font-inter-medium text-text-tertiary-light dark:text-text-tertiary-dark mb-1">
                                VALOR
                            </Text>
                            <Text className="text-3xl font-inter-bold text-text-primary-light dark:text-text-primary-dark">
                                {formatAmount(depositAmount)}
                            </Text>
                            <TextInput
                                ref={depositInputRef}
                                value={depositAmount}
                                onChangeText={(t) => setDepositAmount(t.replace(/[^\d]/g, ''))}
                                keyboardType="numeric"
                                style={{ position: 'absolute', opacity: 0, height: 1, width: 1 }}
                                autoFocus
                            />
                        </Pressable>

                        <Input
                            label="Observação (opcional)"
                            placeholder="Ex: Economia do mês"
                            value={depositNote}
                            onChangeText={setDepositNote}
                        />

                        <View className="flex-row gap-3 mt-4">
                            <Button
                                variant="ghost"
                                size="md"
                                onPress={() => {
                                    setShowDepositModal(false);
                                    setDepositAmount('');
                                    setDepositNote('');
                                }}
                                className="flex-1"
                            >
                                Cancelar
                            </Button>
                            <Button
                                variant="income"
                                size="md"
                                onPress={handleAddDeposit}
                                loading={isLoading}
                                className="flex-1"
                            >
                                Depositar
                            </Button>
                        </View>
                    </Card>
                </View>
            )}
        </SafeAreaView>
    );
}
