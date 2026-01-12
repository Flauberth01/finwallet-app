import { View, Text, ScrollView, Pressable, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Plus, Target, Trophy, Sparkles, Calendar } from 'lucide-react-native';
import { useState, useCallback, useEffect } from 'react';
import { Card, Button, ProgressRing, AmountDisplay } from '@/components/ui';
import { useThemeContext } from '@/providers';
import { useGoalStore } from '@/stores';
import { colors } from '@/constants';
import { Goal } from '@/types';

export default function GoalsScreen() {
    const router = useRouter();
    const { isDark } = useThemeContext();
    const {
        goals,
        totalGoals,
        completedGoals,
        totalTarget,
        totalSaved,
        isLoading,
        fetchGoals,
        fetchSummary
    } = useGoalStore();

    const [refreshing, setRefreshing] = useState(false);

    const iconColor = isDark ? colors.dark.textSecondary : colors.light.textSecondary;

    // Load data on mount
    useEffect(() => {
        fetchGoals();
        fetchSummary();
    }, []);

    // Pull to refresh
    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await Promise.all([fetchGoals(), fetchSummary()]);
        setRefreshing(false);
    }, []);

    // Calculate overall progress
    const overallProgress = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;

    // Goal card component
    const GoalCard = ({ goal }: { goal: Goal }) => {
        const progress = goal.target_amount > 0
            ? (goal.current_amount / goal.target_amount) * 100
            : 0;

        const daysLeft = Math.ceil(
            (new Date(goal.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        );
        const daysLeftText = daysLeft > 0
            ? `${daysLeft} dias restantes`
            : daysLeft === 0
                ? 'Vence hoje!'
                : 'Prazo vencido';
        const isOverdue = daysLeft < 0;

        return (
            <Pressable
                onPress={() => router.push({ pathname: '/goal/[id]', params: { id: goal.id } })}
            >
                <View
                    style={{
                        backgroundColor: isDark ? colors.dark.surface : '#FFFFFF',
                        borderRadius: 16,
                        padding: 16,
                        marginBottom: 12,
                        borderWidth: 1,
                        borderColor: isDark ? colors.dark.border : colors.light.border,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.05,
                        shadowRadius: 8,
                        elevation: 2,
                    }}
                >
                    <View className="flex-row items-center">
                        {/* Progress Ring */}
                        <ProgressRing
                            progress={progress}
                            size={70}
                            strokeWidth={6}
                            color={goal.color || colors.primary[500]}
                            isDark={isDark}
                            showPercentage={true}
                        />

                        {/* Goal Info */}
                        <View className="flex-1 ml-4">
                            <Text
                                style={{
                                    fontSize: 16,
                                    fontWeight: '600',
                                    color: isDark ? colors.dark.textPrimary : colors.light.textPrimary,
                                }}
                                numberOfLines={1}
                            >
                                {goal.name}
                            </Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                                <Calendar color={isOverdue ? colors.error : goal.color || colors.primary[500]} size={12} />
                                <Text style={{
                                    fontSize: 12,
                                    color: isOverdue ? colors.error : (isDark ? colors.dark.textSecondary : colors.light.textSecondary),
                                    marginLeft: 4,
                                    fontWeight: isOverdue ? '600' : '400',
                                }}>
                                    {daysLeftText}
                                </Text>
                            </View>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
                                <Text style={{ fontSize: 16, fontWeight: '700', color: goal.color || colors.primary[500] }}>
                                    R$ {(goal.current_amount / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </Text>
                                <Text style={{ fontSize: 12, color: isDark ? colors.dark.textTertiary : colors.light.textTertiary, marginHorizontal: 4 }}>
                                    /
                                </Text>
                                <Text style={{ fontSize: 14, color: isDark ? colors.dark.textSecondary : colors.light.textSecondary }}>
                                    R$ {(goal.target_amount / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </Text>
                            </View>
                        </View>

                        {/* Completed badge */}
                        {goal.is_completed && (
                            <View
                                style={{
                                    backgroundColor: colors.success + '20',
                                    borderRadius: 20,
                                    padding: 8,
                                }}
                            >
                                <Trophy color={colors.success} size={20} />
                            </View>
                        )}
                    </View>
                </View>
            </Pressable>
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
            {/* Header */}
            <View className="px-4 pt-4 pb-2">
                <Text className="text-2xl font-inter-bold text-text-primary-light dark:text-text-primary-dark">
                    Metas
                </Text>
                <Text className="text-sm font-inter-regular text-text-secondary-light dark:text-text-secondary-dark mt-1">
                    Acompanhe suas metas de economia
                </Text>
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
                    <View className="flex-row items-center">
                        <ProgressRing
                            progress={overallProgress}
                            size={100}
                            strokeWidth={8}
                            color="#FFFFFF"
                            backgroundColor="rgba(255,255,255,0.25)"
                            isDark={true}
                            showPercentage={true}
                        />
                        <View className="flex-1 ml-4">
                            <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14, fontWeight: '500' }}>
                                Progresso Total
                            </Text>
                            <Text style={{ color: '#FFFFFF', fontSize: 26, fontWeight: 'bold', marginTop: 4 }}>
                                R$ {(totalSaved / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </Text>
                            <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, marginTop: 4 }}>
                                de R$ {(totalTarget / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8, backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, alignSelf: 'flex-start' }}>
                                <Trophy color="#FFFFFF" size={14} />
                                <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: '600', marginLeft: 4 }}>
                                    {completedGoals} de {totalGoals} metas concluídas
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Goals List */}
                {goals.length > 0 ? (
                    <>
                        {/* Active Goals */}
                        {goals.filter(g => !g.is_completed).length > 0 && (
                            <>
                                <Text className="text-lg font-inter-semibold text-text-primary-light dark:text-text-primary-dark mb-3">
                                    Metas Ativas
                                </Text>
                                {goals.filter(g => !g.is_completed).map((goal) => (
                                    <GoalCard key={goal.id} goal={goal} />
                                ))}
                            </>
                        )}

                        {/* Completed Goals */}
                        {goals.filter(g => g.is_completed).length > 0 && (
                            <>
                                <Text className="text-lg font-inter-semibold text-text-primary-light dark:text-text-primary-dark mb-3 mt-4">
                                    🎉 Metas Concluídas
                                </Text>
                                {goals.filter(g => g.is_completed).map((goal) => (
                                    <GoalCard key={goal.id} goal={goal} />
                                ))}
                            </>
                        )}
                    </>
                ) : (
                    /* Empty State */
                    <Card variant="filled" className="items-center py-12">
                        <View className="w-20 h-20 rounded-full bg-primary-100 dark:bg-primary-900 items-center justify-center mb-4">
                            <Target color={colors.primary[500]} size={40} />
                        </View>
                        <Text className="text-lg font-inter-semibold text-text-primary-light dark:text-text-primary-dark text-center">
                            Nenhuma meta ainda
                        </Text>
                        <Text className="text-sm font-inter-regular text-text-secondary-light dark:text-text-secondary-dark text-center mt-2 px-8">
                            Comece a economia criando sua primeira meta. Pode ser uma viagem, um eletrônico ou uma reserva de emergência!
                        </Text>
                        <View className="flex-row items-center mt-4 bg-primary-50 dark:bg-primary-900/20 px-4 py-2 rounded-full">
                            <Sparkles color={colors.primary[500]} size={16} />
                            <Text className="text-sm font-inter-medium text-primary-600 dark:text-primary-400 ml-2">
                                Dica: Metas específicas são mais fáceis de alcançar!
                            </Text>
                        </View>
                        <Button
                            variant="primary"
                            size="lg"
                            className="mt-6"
                            leftIcon={<Plus color="white" size={20} />}
                            onPress={() => router.push('/goal/new')}
                        >
                            Criar Primeira Meta
                        </Button>
                    </Card>
                )}
            </ScrollView>

            {/* FAB */}
            {goals.length > 0 && (
                <View className="absolute bottom-6 right-6">
                    <Button
                        variant="primary"
                        size="icon"
                        onPress={() => router.push('/goal/new')}
                        className="w-14 h-14 rounded-full shadow-lg"
                    >
                        <Plus color="white" size={28} />
                    </Button>
                </View>
            )}
        </SafeAreaView>
    );
}
