import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Plus, TrendingUp, TrendingDown, BarChart2, Wallet } from 'lucide-react-native';
import { Card, Button, AmountDisplay } from '@/components/ui';
import { PieChart, BarChart } from '@/components/charts';
import { useThemeContext } from '@/providers';
import { useTransactionStore } from '@/stores';
import { colors } from '@/constants';
import { useEffect } from 'react';

export default function HomeScreen() {
    const router = useRouter();
    const { isDark } = useThemeContext();

    // Get data from store
    const {
        transactions,
        totalIncome,
        totalExpense,
        balance,
        categoryDistribution,
        monthlyEvolution,
        fetchTransactions,
        fetchSummary,
        fetchCategoryDistribution,
        fetchMonthlyEvolution,
    } = useTransactionStore();

    // Get current month data
    useEffect(() => {
        const now = new Date();
        fetchSummary(now.getFullYear(), now.getMonth() + 1);
        fetchCategoryDistribution(now.getFullYear(), now.getMonth() + 1);
        fetchTransactions({ limit: 5 });
        fetchMonthlyEvolution();
    }, []);

    // Get last 5 transactions
    const recentTransactions = transactions.slice(0, 5);

    const iconColor = isDark ? colors.dark.textSecondary : colors.light.textSecondary;

    // Calculate percentage change (mock for now - would need previous month data)
    const percentChange = balance > 0 ? '+12%' : '-5%';

    return (
        <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
            <ScrollView
                className="flex-1"
                contentContainerClassName="p-4"
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <View className="flex-row items-center justify-between mb-6">
                    <View>
                        <Text className="text-sm font-inter-medium text-text-secondary-light dark:text-text-secondary-dark">
                            Olá!
                        </Text>
                        <Text className="text-xl font-inter-bold text-text-primary-light dark:text-text-primary-dark">
                            Bem-vindo ao FinWallet
                        </Text>
                    </View>
                    <View className="flex-row" style={{ gap: 8 }}>
                        <Pressable
                            onPress={() => router.push('/budgets' as any)}
                            className="w-10 h-10 rounded-full bg-secondary-100 dark:bg-secondary-900 items-center justify-center"
                        >
                            <Wallet color={colors.secondary[500]} size={20} />
                        </Pressable>
                        <Pressable
                            onPress={() => router.push('/reports')}
                            className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900 items-center justify-center"
                        >
                            <BarChart2 color={colors.primary[500]} size={20} />
                        </Pressable>
                    </View>
                </View>

                {/* Balance Card */}
                <View
                    style={{
                        backgroundColor: colors.primary[500],
                        borderRadius: 20,
                        padding: 24,
                        marginBottom: 16,
                        shadowColor: colors.primary[700],
                        shadowOffset: { width: 0, height: 8 },
                        shadowOpacity: 0.25,
                        shadowRadius: 16,
                        elevation: 8,
                    }}
                >
                    <View style={{ alignItems: 'center', paddingVertical: 16 }}>
                        <Text style={{ fontSize: 12, fontWeight: '600', color: colors.primary[200], marginBottom: 8, letterSpacing: 1 }}>
                            SALDO ATUAL
                        </Text>
                        <Text style={{ fontSize: 40, fontWeight: 'bold', color: '#FFFFFF' }}>
                            R$ {(balance / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12 }}>
                            {balance >= 0 ? (
                                <TrendingUp color={colors.primary[200]} size={16} />
                            ) : (
                                <TrendingDown color="#FCA5A5" size={16} />
                            )}
                            <Text style={{ fontSize: 14, fontWeight: '500', color: colors.primary[200], marginLeft: 6 }}>
                                {percentChange} vs mês passado
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Income & Expenses */}
                <View className="flex-row gap-4 mb-6">
                    <Card variant="default" className="flex-1">
                        <View className="flex-row items-center mb-2">
                            <View className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900 items-center justify-center mr-2">
                                <TrendingUp color={colors.income} size={16} />
                            </View>
                            <Text className="text-sm font-inter-medium text-text-secondary-light dark:text-text-secondary-dark">
                                Receitas
                            </Text>
                        </View>
                        <AmountDisplay amount={totalIncome} type="income" size="lg" />
                    </Card>

                    <Card variant="default" className="flex-1">
                        <View className="flex-row items-center mb-2">
                            <View className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900 items-center justify-center mr-2">
                                <TrendingDown color={colors.expense} size={16} />
                            </View>
                            <Text className="text-sm font-inter-medium text-text-secondary-light dark:text-text-secondary-dark">
                                Despesas
                            </Text>
                        </View>
                        <AmountDisplay amount={totalExpense} type="expense" size="lg" />
                    </Card>
                </View>

                {/* Quick Actions */}
                <Text className="text-lg font-inter-semibold text-text-primary-light dark:text-text-primary-dark mb-3">
                    Ações Rápidas
                </Text>
                <View className="flex-row gap-3 mb-6">
                    <Button
                        variant="income"
                        size="md"
                        leftIcon={<Plus color="white" size={20} />}
                        onPress={() => router.push('/transaction/new?type=income')}
                        className="flex-1"
                    >
                        Receita
                    </Button>
                    <Button
                        variant="expense"
                        size="md"
                        leftIcon={<Plus color="white" size={20} />}
                        onPress={() => router.push('/transaction/new?type=expense')}
                        className="flex-1"
                    >
                        Despesa
                    </Button>
                </View>

                {/* Category Distribution - Pie Chart */}
                <Text className="text-lg font-inter-semibold text-text-primary-light dark:text-text-primary-dark mb-3">
                    Gastos por Categoria
                </Text>
                <Card variant="default" className="mb-6">
                    <PieChart data={categoryDistribution} isDark={isDark} />
                </Card>

                {/* Monthly Evolution - Bar Chart */}
                <Text className="text-lg font-inter-semibold text-text-primary-light dark:text-text-primary-dark mb-3">
                    Evolução Mensal
                </Text>
                <Card variant="default" className="mb-6">
                    <BarChart data={monthlyEvolution} isDark={isDark} />
                </Card>

                {/* Recent Transactions */}
                <View className="flex-row items-center justify-between mb-3">
                    <Text className="text-lg font-inter-semibold text-text-primary-light dark:text-text-primary-dark">
                        Últimas Transações
                    </Text>
                    <Button variant="ghost" size="sm" onPress={() => router.push('/transactions')}>
                        Ver todas
                    </Button>
                </View>

                {recentTransactions.length > 0 ? (
                    <Card variant="default">
                        {recentTransactions.map((tx, index) => (
                            <View
                                key={tx.id}
                                className={`flex-row items-center justify-between ${index > 0 ? 'mt-4 pt-4 border-t border-border-light dark:border-border-dark' : ''}`}
                            >
                                <View className="flex-row items-center flex-1">
                                    <View
                                        className="w-10 h-10 rounded-full items-center justify-center mr-3"
                                        style={{ backgroundColor: tx.category_color + '20' }}
                                    >
                                        <Text style={{ color: tx.category_color }}>
                                            {tx.category_name?.charAt(0) || '?'}
                                        </Text>
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-sm font-inter-medium text-text-primary-light dark:text-text-primary-dark" numberOfLines={1}>
                                            {tx.description}
                                        </Text>
                                        <Text className="text-xs font-inter-regular text-text-tertiary-light dark:text-text-tertiary-dark">
                                            {new Date(tx.date).toLocaleDateString('pt-BR')}
                                        </Text>
                                    </View>
                                </View>
                                <AmountDisplay
                                    amount={tx.amount}
                                    type={tx.type}
                                    size="sm"
                                    showSign
                                />
                            </View>
                        ))}
                    </Card>
                ) : (
                    <Card variant="filled" className="items-center py-8">
                        <Text className="text-base font-inter-medium text-text-secondary-light dark:text-text-secondary-dark text-center">
                            Nenhuma transação ainda.{'\n'}Adicione sua primeira transação!
                        </Text>
                        <Button
                            variant="primary"
                            size="md"
                            className="mt-4"
                            leftIcon={<Plus color="white" size={20} />}
                            onPress={() => router.push('/transaction/new')}
                        >
                            Nova Transação
                        </Button>
                    </Card>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}
