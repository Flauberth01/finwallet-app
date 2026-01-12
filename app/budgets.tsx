import { View, Text, ScrollView, Pressable, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { ArrowLeft, ChevronLeft, ChevronRight, Plus, Wallet, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react-native';
import { useState, useCallback } from 'react';
import { Card, Button } from '@/components/ui';
import { useThemeContext } from '@/providers';
import { budgetService, categoryService } from '@/services';
import { colors } from '@/constants';
import { Budget, BudgetSummary, Category } from '@/types';

const MONTH_NAMES = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

export default function BudgetsScreen() {
    const router = useRouter();
    const { isDark } = useThemeContext();

    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [budgets, setBudgets] = useState<Budget[]>([]);
    const [summary, setSummary] = useState<BudgetSummary | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const iconColor = isDark ? colors.dark.textSecondary : colors.light.textSecondary;

    // Load data
    const loadData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [budgetsData, summaryData, categoriesData] = await Promise.all([
                budgetService.getAll(selectedMonth, selectedYear),
                budgetService.getSummary(selectedMonth, selectedYear),
                categoryService.getAll(),
            ]);
            setBudgets(budgetsData);
            setSummary(summaryData);
            setCategories(categoriesData.filter(c => c.type === 'expense' || c.type === 'both'));
        } catch (error) {
            console.error('Error loading budgets:', error);
        } finally {
            setIsLoading(false);
        }
    }, [selectedMonth, selectedYear]);

    // Reload data when screen comes into focus
    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [selectedMonth, selectedYear])
    );

    // Pull to refresh
    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    }, [loadData]);

    // Navigate months
    const goToPreviousMonth = () => {
        if (selectedMonth === 1) {
            setSelectedMonth(12);
            setSelectedYear(selectedYear - 1);
        } else {
            setSelectedMonth(selectedMonth - 1);
        }
    };

    const goToNextMonth = () => {
        if (selectedMonth === 12) {
            setSelectedMonth(1);
            setSelectedYear(selectedYear + 1);
        } else {
            setSelectedMonth(selectedMonth + 1);
        }
    };

    // Get status color and icon
    const getBudgetStatus = (spent: number, amount: number) => {
        const percentage = amount > 0 ? (spent / amount) * 100 : 0;
        if (percentage >= 100) {
            return { color: colors.error, icon: AlertTriangle, label: 'Excedido' };
        } else if (percentage >= 80) {
            return { color: colors.warning, icon: TrendingUp, label: 'Atenção' };
        }
        return { color: colors.success, icon: CheckCircle, label: 'OK' };
    };

    // Overall progress
    const overallPercentage = summary && summary.totalBudget > 0
        ? (summary.totalSpent / summary.totalBudget) * 100
        : 0;

    // Handle budget actions
    const handleBudgetPress = (budget: Budget) => {
        Alert.alert(
            budget.category_name || 'Orçamento',
            `Limite: R$ ${(budget.amount / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Editar Limite',
                    onPress: () => handleEditBudget(budget),
                },
                {
                    text: 'Excluir',
                    style: 'destructive',
                    onPress: () => handleDeleteBudget(budget),
                },
            ]
        );
    };

    // Edit budget - navigate to edit screen
    const handleEditBudget = (budget: Budget) => {
        router.push({ pathname: '/budget/edit/[id]', params: { id: budget.id } } as any);
    };

    // Delete budget
    const handleDeleteBudget = (budget: Budget) => {
        Alert.alert(
            'Excluir Orçamento',
            `Deseja excluir o orçamento de ${budget.category_name}?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Excluir',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await budgetService.delete(budget.id);
                            await loadData();
                        } catch (error) {
                            Alert.alert('Erro', 'Não foi possível excluir');
                        }
                    },
                },
            ]
        );
    };

    // Render budget card
    const renderBudgetCard = (budget: Budget) => {
        const percentage = budget.amount > 0 ? (budget.spent / budget.amount) * 100 : 0;
        const status = getBudgetStatus(budget.spent, budget.amount);
        const StatusIcon = status.icon;

        return (
            <Pressable
                key={budget.id}
                onPress={() => handleBudgetPress(budget)}
                style={{
                    backgroundColor: isDark ? colors.dark.surface : '#FFFFFF',
                    borderRadius: 16,
                    padding: 16,
                    marginBottom: 12,
                    borderWidth: 1,
                    borderColor: isDark ? colors.dark.border : colors.light.border,
                }}
            >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                        <View
                            style={{
                                width: 40,
                                height: 40,
                                borderRadius: 12,
                                backgroundColor: (budget.category_color || colors.primary[500]) + '20',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginRight: 12,
                            }}
                        >
                            <Wallet color={budget.category_color || colors.primary[500]} size={20} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={{
                                fontSize: 16,
                                fontWeight: '600',
                                color: isDark ? colors.dark.textPrimary : colors.light.textPrimary,
                            }}>
                                {budget.category_name || 'Categoria'}
                            </Text>
                            <Text style={{
                                fontSize: 12,
                                color: isDark ? colors.dark.textSecondary : colors.light.textSecondary,
                            }}>
                                R$ {(budget.spent / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} de R$ {(budget.amount / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </Text>
                        </View>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <StatusIcon color={status.color} size={16} />
                        <Text style={{ fontSize: 14, fontWeight: '700', color: status.color, marginLeft: 4 }}>
                            {percentage.toFixed(0)}%
                        </Text>
                    </View>
                </View>

                {/* Progress bar */}
                <View style={{
                    height: 8,
                    backgroundColor: isDark ? colors.dark.surfaceVariant : colors.light.surfaceVariant,
                    borderRadius: 4,
                    overflow: 'hidden',
                }}>
                    <View
                        style={{
                            height: '100%',
                            width: `${Math.min(percentage, 100)}%`,
                            backgroundColor: status.color,
                            borderRadius: 4,
                        }}
                    />
                </View>

                {/* Hint */}
                <Text style={{
                    fontSize: 10,
                    color: isDark ? colors.dark.textTertiary : colors.light.textTertiary,
                    textAlign: 'center',
                    marginTop: 8,
                }}>
                    Toque para editar ou excluir
                </Text>
            </Pressable>
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
            {/* Header */}
            <View className="px-4 py-4 flex-row items-center justify-between">
                <View className="flex-row items-center">
                    <Pressable onPress={() => router.back()} className="p-2 -ml-2">
                        <ArrowLeft color={iconColor} size={24} />
                    </Pressable>
                    <Text className="text-xl font-inter-bold text-text-primary-light dark:text-text-primary-dark ml-2">
                        Orçamentos
                    </Text>
                </View>
                <Pressable
                    onPress={() => router.push('/budget/new' as any)}
                    style={{
                        backgroundColor: colors.primary[500],
                        borderRadius: 12,
                        padding: 8,
                    }}
                >
                    <Plus color="#FFFFFF" size={20} />
                </Pressable>
            </View>

            {/* Month Selector */}
            <View className="flex-row items-center justify-between px-4 pb-4">
                <Pressable onPress={goToPreviousMonth} className="p-2">
                    <ChevronLeft color={colors.primary[500]} size={24} />
                </Pressable>
                <Text className="text-lg font-inter-semibold text-text-primary-light dark:text-text-primary-dark">
                    {MONTH_NAMES[selectedMonth - 1]} {selectedYear}
                </Text>
                <Pressable onPress={goToNextMonth} className="p-2">
                    <ChevronRight color={colors.primary[500]} size={24} />
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
                {/* Summary Card */}
                {summary && summary.budgetsCount > 0 && (
                    <View
                        style={{
                            backgroundColor: colors.primary[500],
                            borderRadius: 20,
                            padding: 20,
                            marginBottom: 24,
                            shadowColor: colors.primary[700],
                            shadowOffset: { width: 0, height: 8 },
                            shadowOpacity: 0.25,
                            shadowRadius: 16,
                            elevation: 8,
                        }}
                    >
                        <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14, fontWeight: '500' }}>
                            Orçamento Total
                        </Text>
                        <Text style={{ color: '#FFFFFF', fontSize: 28, fontWeight: 'bold', marginTop: 4 }}>
                            R$ {(summary.totalSpent / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </Text>
                        <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, marginTop: 4 }}>
                            de R$ {(summary.totalBudget / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </Text>

                        {/* Progress bar */}
                        <View style={{
                            height: 8,
                            backgroundColor: 'rgba(255,255,255,0.25)',
                            borderRadius: 4,
                            overflow: 'hidden',
                            marginTop: 16,
                        }}>
                            <View
                                style={{
                                    height: '100%',
                                    width: `${Math.min(overallPercentage, 100)}%`,
                                    backgroundColor: overallPercentage > 100 ? colors.error : '#FFFFFF',
                                    borderRadius: 4,
                                }}
                            />
                        </View>

                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                {summary.overLimitCount > 0 && (
                                    <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(239,68,68,0.3)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, marginRight: 8 }}>
                                        <AlertTriangle color="#FFFFFF" size={12} />
                                        <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: '600', marginLeft: 4 }}>
                                            {summary.overLimitCount} excedido
                                        </Text>
                                    </View>
                                )}
                                {summary.nearLimitCount > 0 && (
                                    <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(245,158,11,0.3)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 }}>
                                        <TrendingUp color="#FFFFFF" size={12} />
                                        <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: '600', marginLeft: 4 }}>
                                            {summary.nearLimitCount} atenção
                                        </Text>
                                    </View>
                                )}
                            </View>
                            <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '700' }}>
                                {overallPercentage.toFixed(0)}%
                            </Text>
                        </View>
                    </View>
                )}

                {/* Budget List */}
                {budgets.length > 0 ? (
                    <>
                        <Text className="text-lg font-inter-semibold text-text-primary-light dark:text-text-primary-dark mb-3">
                            Por Categoria
                        </Text>
                        {budgets.map(renderBudgetCard)}
                    </>
                ) : (
                    <Card variant="filled" className="items-center py-8">
                        <View className="w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900 items-center justify-center mb-3">
                            <Wallet color={colors.primary[500]} size={32} />
                        </View>
                        <Text className="text-base font-inter-semibold text-text-primary-light dark:text-text-primary-dark">
                            Nenhum orçamento definido
                        </Text>
                        <Text className="text-sm font-inter-regular text-text-secondary-light dark:text-text-secondary-dark text-center mt-1 mb-4">
                            Defina limites para controlar seus gastos por categoria
                        </Text>
                        <Button
                            variant="primary"
                            onPress={() => router.push('/budget/new' as any)}
                        >
                            Criar Orçamento
                        </Button>
                    </Card>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}
