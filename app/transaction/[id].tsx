import { View, Text, ScrollView, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Calendar, Tag, FileText, Trash2, Edit } from 'lucide-react-native';
import { useState, useEffect } from 'react';
import { Card, Button, AmountDisplay } from '@/components/ui';
import { useThemeContext } from '@/providers';
import { transactionService } from '@/services';
import { useTransactionStore } from '@/stores';
import { colors } from '@/constants';
import { Transaction } from '@/types';

export default function TransactionDetailScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id: string }>();
    const { isDark } = useThemeContext();
    const { deleteTransaction } = useTransactionStore();

    const [transaction, setTransaction] = useState<Transaction | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const iconColor = isDark ? colors.dark.textSecondary : colors.light.textSecondary;

    // Load transaction
    useEffect(() => {
        const loadTransaction = async () => {
            if (!id) return;
            setIsLoading(true);
            try {
                const tx = await transactionService.getById(id);
                setTransaction(tx);
            } catch (error) {
                console.error('Error loading transaction:', error);
            } finally {
                setIsLoading(false);
            }
        };
        loadTransaction();
    }, [id]);

    // Handle delete
    const handleDelete = () => {
        if (!transaction) return;

        Alert.alert(
            'Excluir Transação',
            `Deseja realmente excluir "${transaction.description}"?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Excluir',
                    style: 'destructive',
                    onPress: async () => {
                        await deleteTransaction(transaction.id);
                        router.back();
                    },
                },
            ]
        );
    };

    if (isLoading || !transaction) {
        return (
            <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark items-center justify-center">
                <Text className="text-text-secondary-light dark:text-text-secondary-dark">
                    Carregando...
                </Text>
            </SafeAreaView>
        );
    }

    const headerColor = transaction.type === 'expense' ? colors.expense : colors.income;

    return (
        <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
            {/* Header */}
            <View
                className="px-4 py-4 flex-row items-center justify-between"
                style={{ backgroundColor: headerColor }}
            >
                <Pressable onPress={() => router.back()} className="p-2 -ml-2">
                    <ArrowLeft color="#FFFFFF" size={24} />
                </Pressable>
                <Text className="text-lg font-inter-semibold text-white">
                    Detalhes
                </Text>
                <Pressable onPress={handleDelete} className="p-2 -mr-2">
                    <Trash2 color="#FFFFFF" size={22} />
                </Pressable>
            </View>

            {/* Amount */}
            <View
                className="px-4 py-8 items-center"
                style={{ backgroundColor: headerColor }}
            >
                <Text className="text-sm font-inter-medium text-white/70 mb-2">
                    {transaction.type === 'expense' ? 'DESPESA' : 'RECEITA'}
                </Text>
                <Text className="text-5xl font-inter-bold text-white">
                    {transaction.type === 'expense' ? '-' : '+'} R$ {(transaction.amount / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </Text>
            </View>

            <ScrollView className="flex-1 -mt-4">
                <Card variant="elevated" className="mx-4 mb-4">
                    {/* Description */}
                    <View className="flex-row items-center py-3 border-b border-border-light dark:border-border-dark">
                        <FileText color={iconColor} size={20} />
                        <View className="flex-1 ml-4">
                            <Text className="text-xs font-inter-medium text-text-tertiary-light dark:text-text-tertiary-dark">
                                Descrição
                            </Text>
                            <Text className="text-base font-inter-regular text-text-primary-light dark:text-text-primary-dark">
                                {transaction.description}
                            </Text>
                        </View>
                    </View>

                    {/* Category */}
                    <View className="flex-row items-center py-3 border-b border-border-light dark:border-border-dark">
                        <View
                            className="w-5 h-5 rounded-full"
                            style={{ backgroundColor: transaction.category_color || colors.primary[500] }}
                        />
                        <View className="flex-1 ml-4">
                            <Text className="text-xs font-inter-medium text-text-tertiary-light dark:text-text-tertiary-dark">
                                Categoria
                            </Text>
                            <Text className="text-base font-inter-regular text-text-primary-light dark:text-text-primary-dark">
                                {transaction.category_name || 'Sem categoria'}
                            </Text>
                        </View>
                    </View>

                    {/* Date */}
                    <View className="flex-row items-center py-3">
                        <Calendar color={iconColor} size={20} />
                        <View className="flex-1 ml-4">
                            <Text className="text-xs font-inter-medium text-text-tertiary-light dark:text-text-tertiary-dark">
                                Data
                            </Text>
                            <Text className="text-base font-inter-regular text-text-primary-light dark:text-text-primary-dark">
                                {new Date(transaction.date).toLocaleDateString('pt-BR', {
                                    weekday: 'long',
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric',
                                })}
                            </Text>
                        </View>
                    </View>
                </Card>

                {/* Created at */}
                <Text className="text-xs font-inter-regular text-text-tertiary-light dark:text-text-tertiary-dark text-center mt-2 mb-4">
                    Criada em {new Date(transaction.created_at).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                    })}
                </Text>
            </ScrollView>

            {/* Delete Button */}
            <View className="px-4 pb-4">
                <Button
                    variant="ghost"
                    fullWidth
                    size="lg"
                    onPress={handleDelete}
                    leftIcon={<Trash2 color={colors.error} size={20} />}
                >
                    <Text style={{ color: colors.error }}>Excluir Transação</Text>
                </Button>
            </View>
        </SafeAreaView>
    );
}
