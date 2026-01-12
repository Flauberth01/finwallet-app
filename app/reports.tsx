import { View, Text, ScrollView, RefreshControl, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, ChevronLeft, ChevronRight, TrendingUp, TrendingDown, Minus, Lightbulb, Wallet, Target, PartyPopper, AlertTriangle, FileText, type LucideIcon } from 'lucide-react-native';
import { useState, useEffect, useCallback } from 'react';
import { Card, AmountDisplay, ProgressRing } from '@/components/ui';
import { BarChart } from '@/components/charts';
import { useThemeContext } from '@/providers';
import { analyticsService } from '@/services';
import { colors } from '@/constants';

interface Insight {
    type: 'warning' | 'success' | 'info';
    icon: string;
    title: string;
    description: string;
}

interface MonthlyReport {
    month: number;
    year: number;
    totalIncome: number;
    totalExpense: number;
    balance: number;
    topCategories: Array<{
        category_id: string;
        category_name: string;
        category_color: string;
        total: number;
        percentage: number;
    }>;
    transactionCount: number;
}

const MONTH_NAMES = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

export default function ReportsScreen() {
    const router = useRouter();
    const { isDark } = useThemeContext();

    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [report, setReport] = useState<MonthlyReport | null>(null);
    const [insights, setInsights] = useState<Insight[]>([]);
    const [comparison, setComparison] = useState<{ incomeChange: number; expenseChange: number } | null>(null);
    const [chartData, setChartData] = useState<Array<{ month: string; year: number; income: number; expense: number }>>([]);
    const [refreshing, setRefreshing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const iconColor = isDark ? colors.dark.textSecondary : colors.light.textSecondary;

    // Load data
    const loadData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [reportData, insightsData, comparisonData, last6Months] = await Promise.all([
                analyticsService.getMonthlyReport(selectedMonth, selectedYear),
                analyticsService.generateInsights(selectedMonth, selectedYear),
                analyticsService.getMonthComparison(selectedMonth, selectedYear),
                analyticsService.getLast6MonthsSummary(),
            ]);

            setReport(reportData);
            setInsights(insightsData);
            setComparison({
                incomeChange: comparisonData.incomeChange,
                expenseChange: comparisonData.expenseChange,
            });

            // Format chart data for BarChart (which expects MonthlyData)
            const now = new Date();
            setChartData(last6Months.map((item, index) => {
                const monthIndex = now.getMonth() - (5 - index);
                const date = new Date(now.getFullYear(), monthIndex, 1);
                return {
                    month: String(date.getMonth() + 1),
                    year: date.getFullYear(),
                    income: item.income,
                    expense: item.expense,
                };
            }));
        } catch (error) {
            console.error('Error loading analytics:', error);
        } finally {
            setIsLoading(false);
        }
    }, [selectedMonth, selectedYear]);

    useEffect(() => {
        loadData();
    }, [loadData]);

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
        const now = new Date();
        const isCurrentMonth = selectedMonth === now.getMonth() + 1 && selectedYear === now.getFullYear();
        if (isCurrentMonth) return;

        if (selectedMonth === 12) {
            setSelectedMonth(1);
            setSelectedYear(selectedYear + 1);
        } else {
            setSelectedMonth(selectedMonth + 1);
        }
    };

    // Render change indicator
    const renderChangeIndicator = (change: number, label: string) => {
        const isPositive = change > 0;
        const isNegative = change < 0;
        const Icon = isPositive ? TrendingUp : isNegative ? TrendingDown : Minus;
        const color = label === 'Receita'
            ? (isPositive ? colors.income : colors.expense)
            : (isPositive ? colors.expense : colors.income);

        return (
            <View className="flex-row items-center">
                <Icon color={color} size={14} />
                <Text style={{ color, marginLeft: 4, fontSize: 12, fontFamily: 'Inter_500Medium' }}>
                    {Math.abs(change).toFixed(0)}%
                </Text>
            </View>
        );
    };

    // Icon map for insights
    const iconMap: Record<string, LucideIcon> = {
        TrendingUp,
        TrendingDown,
        Wallet,
        Target,
        PartyPopper,
        AlertTriangle,
        FileText,
    };

    // Get icon color based on type
    const getInsightIconColor = (type: 'warning' | 'success' | 'info') => {
        switch (type) {
            case 'success': return colors.income;
            case 'warning': return colors.expense;
            case 'info': return colors.primary[500];
        }
    };

    // Render insight card
    const renderInsight = (insight: Insight, index: number) => {
        const bgColor = insight.type === 'success'
            ? 'bg-green-50 dark:bg-green-900/20'
            : insight.type === 'warning'
                ? 'bg-orange-50 dark:bg-orange-900/20'
                : 'bg-blue-50 dark:bg-blue-900/20';

        const IconComponent = iconMap[insight.icon] || Lightbulb;
        const iconColor = getInsightIconColor(insight.type);

        return (
            <View
                key={index}
                className={`flex-row items-center p-3 rounded-xl mb-2 ${bgColor}`}
            >
                <View className="w-10 h-10 rounded-full items-center justify-center mr-3" style={{ backgroundColor: `${iconColor}20` }}>
                    <IconComponent color={iconColor} size={20} />
                </View>
                <View className="flex-1">
                    <Text className="text-sm font-inter-semibold text-text-primary-light dark:text-text-primary-dark">
                        {insight.title}
                    </Text>
                    <Text className="text-xs font-inter-regular text-text-secondary-light dark:text-text-secondary-dark">
                        {insight.description}
                    </Text>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
            {/* Header */}
            <View className="px-4 py-4 flex-row items-center">
                <Pressable onPress={() => router.back()} className="p-2 -ml-2">
                    <ArrowLeft color={iconColor} size={24} />
                </Pressable>
                <Text className="text-xl font-inter-bold text-text-primary-light dark:text-text-primary-dark ml-2">
                    Relatórios
                </Text>
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
                    <ChevronRight
                        color={selectedMonth === new Date().getMonth() + 1 && selectedYear === new Date().getFullYear()
                            ? colors.dark.textTertiary
                            : colors.primary[500]}
                        size={24}
                    />
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
                <Card variant="elevated" className="mb-4">
                    <Text className="text-sm font-inter-semibold text-text-secondary-light dark:text-text-secondary-dark mb-4">
                        RESUMO DO MÊS
                    </Text>

                    <View className="flex-row justify-between mb-4">
                        {/* Income */}
                        <View className="flex-1">
                            <Text className="text-xs font-inter-medium text-text-tertiary-light dark:text-text-tertiary-dark">
                                Receitas
                            </Text>
                            <AmountDisplay
                                amount={report?.totalIncome || 0}
                                type="income"
                                size="md"
                            />
                            {comparison && renderChangeIndicator(comparison.incomeChange, 'Receita')}
                        </View>

                        {/* Expenses */}
                        <View className="flex-1 items-center">
                            <Text className="text-xs font-inter-medium text-text-tertiary-light dark:text-text-tertiary-dark">
                                Despesas
                            </Text>
                            <AmountDisplay
                                amount={report?.totalExpense || 0}
                                type="expense"
                                size="md"
                            />
                            {comparison && renderChangeIndicator(comparison.expenseChange, 'Despesa')}
                        </View>

                        {/* Balance */}
                        <View className="flex-1 items-end">
                            <Text className="text-xs font-inter-medium text-text-tertiary-light dark:text-text-tertiary-dark">
                                Saldo
                            </Text>
                            <AmountDisplay
                                amount={report?.balance || 0}
                                type={report?.balance && report.balance >= 0 ? 'income' : 'expense'}
                                size="md"
                            />
                        </View>
                    </View>

                    <Text className="text-xs font-inter-regular text-text-tertiary-light dark:text-text-tertiary-dark text-center">
                        {report?.transactionCount || 0} transações registradas
                    </Text>
                </Card>

                {/* Insights */}
                {insights.length > 0 && (
                    <>
                        <View className="flex-row items-center mb-3">
                            <Lightbulb color={colors.warning} size={18} />
                            <Text className="text-base font-inter-semibold text-text-primary-light dark:text-text-primary-dark ml-2">
                                Insights
                            </Text>
                        </View>
                        {insights.map((insight, index) => renderInsight(insight, index))}
                    </>
                )}

                {/* Top Categories */}
                {report?.topCategories && report.topCategories.length > 0 && (
                    <Card variant="default" className="mt-4 mb-4">
                        <Text className="text-sm font-inter-semibold text-text-secondary-light dark:text-text-secondary-dark mb-4">
                            TOP CATEGORIAS DE DESPESAS
                        </Text>
                        {report.topCategories.map((cat, index) => (
                            <View key={cat.category_id || index} className="mb-3">
                                <View className="flex-row justify-between mb-1">
                                    <Text className="text-sm font-inter-medium text-text-primary-light dark:text-text-primary-dark">
                                        {cat.category_name || 'Sem categoria'}
                                    </Text>
                                    <Text className="text-sm font-inter-semibold text-text-primary-light dark:text-text-primary-dark">
                                        {cat.percentage.toFixed(0)}%
                                    </Text>
                                </View>
                                <View className="h-2 bg-surface-variant-light dark:bg-surface-variant-dark rounded-full overflow-hidden">
                                    <View
                                        className="h-full rounded-full"
                                        style={{
                                            width: `${cat.percentage}%`,
                                            backgroundColor: cat.category_color || colors.primary[500],
                                        }}
                                    />
                                </View>
                                <Text className="text-xs font-inter-regular text-text-tertiary-light dark:text-text-tertiary-dark mt-1">
                                    R$ {(cat.total / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </Text>
                            </View>
                        ))}
                    </Card>
                )}

                {/* 6 Month Chart */}
                {chartData.length > 0 && (
                    <Card variant="default" className="mb-4">
                        <Text className="text-sm font-inter-semibold text-text-secondary-light dark:text-text-secondary-dark mb-4">
                            ÚLTIMOS 6 MESES - DESPESAS
                        </Text>
                        <BarChart
                            data={chartData}
                            isDark={isDark}
                        />
                    </Card>
                )}

                {/* Empty state */}
                {!isLoading && report?.transactionCount === 0 && (
                    <Card variant="filled" className="items-center py-8">
                        <View className="w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900 items-center justify-center mb-3">
                            <FileText color={colors.primary[500]} size={32} />
                        </View>
                        <Text className="text-base font-inter-semibold text-text-primary-light dark:text-text-primary-dark">
                            Sem dados para este mês
                        </Text>
                        <Text className="text-sm font-inter-regular text-text-secondary-light dark:text-text-secondary-dark text-center mt-1">
                            Registre transações para ver seus relatórios e insights
                        </Text>
                    </Card>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}
