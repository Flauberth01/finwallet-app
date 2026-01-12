import { View, Text, ScrollView, Pressable, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Plus, Search, Filter, Trash2 } from 'lucide-react-native';
import { useState, useCallback, useEffect } from 'react';
import { Card, Button, Input, AmountDisplay } from '@/components/ui';
import { useThemeContext } from '@/providers';
import { useTransactionStore } from '@/stores';
import { colors } from '@/constants';
import { TransactionType } from '@/types';

export default function TransactionsScreen() {
    const router = useRouter();
    const { isDark } = useThemeContext();
    const {
        transactions,
        isLoading,
        fetchTransactions,
        deleteTransaction,
        setFilters,
        clearFilters,
        filters
    } = useTransactionStore();

    const [searchText, setSearchText] = useState('');
    const [activeFilter, setActiveFilter] = useState<'all' | TransactionType>('all');
    const [refreshing, setRefreshing] = useState(false);

    const iconColor = isDark ? colors.dark.textSecondary : colors.light.textSecondary;

    // Refresh on pull
    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchTransactions();
        setRefreshing(false);
    }, []);

    // Load transactions on mount
    useEffect(() => {
        fetchTransactions();
    }, []);

    // Handle search
    const handleSearch = (text: string) => {
        setSearchText(text);
        if (text.trim()) {
            setFilters({ search: text.trim() });
        } else {
            setFilters({ search: undefined });
        }
    };

    // Handle filter
    const handleFilter = (filter: 'all' | TransactionType) => {
        setActiveFilter(filter);
        if (filter === 'all') {
            setFilters({ type: undefined });
        } else {
            setFilters({ type: filter });
        }
    };

    // Handle delete with confirmation
    const handleDelete = (id: string, description: string) => {
        Alert.alert(
            'Excluir Transação',
            `Deseja realmente excluir "${description}"?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Excluir',
                    style: 'destructive',
                    onPress: async () => {
                        await deleteTransaction(id);
                    },
                },
            ]
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
            {/* Header */}
            <View className="px-4 pt-4 pb-2">
                <Text className="text-2xl font-inter-bold text-text-primary-light dark:text-text-primary-dark mb-4">
                    Transações
                </Text>

                {/* Search */}
                <Input
                    placeholder="Buscar transações..."
                    leftIcon={<Search color={iconColor} size={20} />}
                    value={searchText}
                    onChangeText={handleSearch}
                />

                {/* Filters */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    className="mt-3"
                    contentContainerClassName="gap-2"
                >
                    <Pressable
                        onPress={() => handleFilter('all')}
                        className={`px-4 py-2 rounded-full ${activeFilter === 'all'
                            ? 'bg-primary-500'
                            : 'bg-surface-variant-light dark:bg-surface-variant-dark'
                            }`}
                    >
                        <Text className={`text-sm font-inter-medium ${activeFilter === 'all' ? 'text-white' : 'text-text-primary-light dark:text-text-primary-dark'
                            }`}>
                            Todas
                        </Text>
                    </Pressable>
                    <Pressable
                        onPress={() => handleFilter('income')}
                        className={`px-4 py-2 rounded-full ${activeFilter === 'income'
                            ? 'bg-income'
                            : 'bg-surface-variant-light dark:bg-surface-variant-dark'
                            }`}
                    >
                        <Text className={`text-sm font-inter-medium ${activeFilter === 'income' ? 'text-white' : 'text-text-primary-light dark:text-text-primary-dark'
                            }`}>
                            Receitas
                        </Text>
                    </Pressable>
                    <Pressable
                        onPress={() => handleFilter('expense')}
                        className={`px-4 py-2 rounded-full ${activeFilter === 'expense'
                            ? 'bg-expense'
                            : 'bg-surface-variant-light dark:bg-surface-variant-dark'
                            }`}
                    >
                        <Text className={`text-sm font-inter-medium ${activeFilter === 'expense' ? 'text-white' : 'text-text-primary-light dark:text-text-primary-dark'
                            }`}>
                            Despesas
                        </Text>
                    </Pressable>
                </ScrollView>
            </View>

            <ScrollView
                className="flex-1"
                contentContainerClassName="p-4"
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {transactions.length > 0 ? (
                    <Card variant="default">
                        {transactions.map((tx, index) => (
                            <Pressable
                                key={tx.id}
                                className={`flex-row items-center ${index > 0 ? 'mt-4 pt-4 border-t border-border-light dark:border-border-dark' : ''
                                    }`}
                                onPress={() => router.push({ pathname: '/transaction/[id]', params: { id: tx.id } } as any)}
                                onLongPress={() => handleDelete(tx.id, tx.description)}
                            >
                                <View
                                    className="w-12 h-12 rounded-xl items-center justify-center mr-3"
                                    style={{ backgroundColor: tx.category_color + '20' }}
                                >
                                    <Text
                                        className="text-base font-inter-bold"
                                        style={{ color: tx.category_color }}
                                    >
                                        {tx.category_name?.charAt(0) || '?'}
                                    </Text>
                                </View>
                                <View className="flex-1">
                                    <Text
                                        className="text-base font-inter-medium text-text-primary-light dark:text-text-primary-dark"
                                        numberOfLines={1}
                                    >
                                        {tx.description}
                                    </Text>
                                    <Text className="text-sm font-inter-regular text-text-tertiary-light dark:text-text-tertiary-dark">
                                        {tx.category_name} • {new Date(tx.date).toLocaleDateString('pt-BR')}
                                    </Text>
                                </View>
                                <AmountDisplay
                                    amount={tx.amount}
                                    type={tx.type}
                                    size="md"
                                    showSign
                                />
                            </Pressable>
                        ))}
                    </Card>
                ) : (
                    <Card variant="filled" className="items-center py-12">
                        <Text className="text-base font-inter-medium text-text-secondary-light dark:text-text-secondary-dark text-center mb-4">
                            {searchText || activeFilter !== 'all'
                                ? 'Nenhuma transação encontrada com esses filtros.'
                                : 'Nenhuma transação ainda.\nComece adicionando sua primeira!'}
                        </Text>
                        {!searchText && activeFilter === 'all' && (
                            <Button
                                variant="primary"
                                size="md"
                                leftIcon={<Plus color="white" size={20} />}
                                onPress={() => router.push('/transaction/new')}
                            >
                                Nova Transação
                            </Button>
                        )}
                    </Card>
                )}

                {/* Hint for delete */}
                {transactions.length > 0 && (
                    <Text className="text-xs font-inter-regular text-text-tertiary-light dark:text-text-tertiary-dark text-center mt-4">
                        Pressione e segure para excluir uma transação
                    </Text>
                )}
            </ScrollView>

            {/* FAB */}
            <View className="absolute bottom-6 right-6">
                <Button
                    variant="primary"
                    size="icon"
                    onPress={() => router.push('/transaction/new')}
                    className="w-14 h-14 rounded-full shadow-lg"
                >
                    <Plus color="white" size={28} />
                </Button>
            </View>
        </SafeAreaView>
    );
}
