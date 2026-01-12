import { View, Text, Pressable, Alert, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Wallet, Trash2 } from 'lucide-react-native';
import { useState, useEffect, useRef } from 'react';
import { Button, Card } from '@/components/ui';
import { useThemeContext } from '@/providers';
import { budgetService } from '@/services';
import { colors } from '@/constants';
import { Budget } from '@/types';

export default function EditBudgetScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id: string }>();
    const { isDark } = useThemeContext();
    const inputRef = useRef<TextInput>(null);

    const [budget, setBudget] = useState<Budget | null>(null);
    const [amount, setAmount] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const iconColor = isDark ? colors.dark.textSecondary : colors.light.textSecondary;

    // Load budget
    useEffect(() => {
        const loadBudget = async () => {
            if (!id) return;
            setIsLoading(true);
            try {
                const data = await budgetService.getById(id);
                if (data) {
                    setBudget(data);
                    setAmount((data.amount / 100).toString());
                }
            } catch (error) {
                console.error('Error loading budget:', error);
            } finally {
                setIsLoading(false);
            }
        };
        loadBudget();
    }, [id]);

    // Format amount
    const formatAmount = (value: string) => {
        const numbers = value.replace(/[^\d,\.]/g, '').replace(',', '.');
        return numbers;
    };

    const handleAmountChange = (value: string) => {
        setAmount(formatAmount(value));
    };

    // Save changes
    const handleSave = async () => {
        if (!budget) return;

        const newAmount = parseFloat(amount.replace(',', '.')) * 100;
        if (isNaN(newAmount) || newAmount <= 0) {
            Alert.alert('Erro', 'Informe um valor válido');
            return;
        }

        setIsSaving(true);
        try {
            await budgetService.update(budget.id, { amount: newAmount });
            router.back();
        } catch (error) {
            console.error('Error updating budget:', error);
            Alert.alert('Erro', 'Não foi possível atualizar o orçamento');
        } finally {
            setIsSaving(false);
        }
    };

    // Delete budget
    const handleDelete = () => {
        if (!budget) return;

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
                            router.back();
                        } catch (error) {
                            Alert.alert('Erro', 'Não foi possível excluir');
                        }
                    },
                },
            ]
        );
    };

    if (isLoading || !budget) {
        return (
            <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark items-center justify-center">
                <Text className="text-text-secondary-light dark:text-text-secondary-dark">
                    Carregando...
                </Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
            >
                {/* Header */}
                <View className="px-4 py-4 flex-row items-center justify-between border-b border-border-light dark:border-border-dark">
                    <View className="flex-row items-center">
                        <Pressable onPress={() => router.back()} className="p-2 -ml-2">
                            <ArrowLeft color={iconColor} size={24} />
                        </Pressable>
                        <Text className="text-lg font-inter-semibold text-text-primary-light dark:text-text-primary-dark ml-2">
                            Editar Orçamento
                        </Text>
                    </View>
                    <Pressable onPress={handleDelete} className="p-2 -mr-2">
                        <Trash2 color={colors.error} size={22} />
                    </Pressable>
                </View>

                {/* Category Info */}
                <View className="p-4">
                    <View className="flex-row items-center mb-6">
                        <View
                            style={{
                                width: 48,
                                height: 48,
                                borderRadius: 12,
                                backgroundColor: (budget.category_color || colors.primary[500]) + '20',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginRight: 12,
                            }}
                        >
                            <Wallet color={budget.category_color || colors.primary[500]} size={24} />
                        </View>
                        <View>
                            <Text className="text-lg font-inter-semibold text-text-primary-light dark:text-text-primary-dark">
                                {budget.category_name}
                            </Text>
                            <Text className="text-sm font-inter-regular text-text-secondary-light dark:text-text-secondary-dark">
                                Gasto atual: R$ {(budget.spent / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </Text>
                        </View>
                    </View>

                    {/* Amount Input */}
                    <Card variant="elevated">
                        <Text className="text-sm font-inter-medium text-text-secondary-light dark:text-text-secondary-dark mb-2">
                            Limite Mensal
                        </Text>
                        <View className="flex-row items-center">
                            <Text className="text-2xl font-inter-bold text-text-primary-light dark:text-text-primary-dark">
                                R$
                            </Text>
                            <TextInput
                                ref={inputRef}
                                value={amount}
                                onChangeText={handleAmountChange}
                                placeholder="0,00"
                                keyboardType="numeric"
                                autoFocus
                                style={{
                                    flex: 1,
                                    fontSize: 32,
                                    fontWeight: 'bold',
                                    color: isDark ? colors.dark.textPrimary : colors.light.textPrimary,
                                    marginLeft: 8,
                                    paddingVertical: 8,
                                }}
                                placeholderTextColor={isDark ? colors.dark.textTertiary : colors.light.textTertiary}
                            />
                        </View>
                    </Card>

                    {/* Progress Info */}
                    <View className="mt-4 p-4 rounded-xl bg-surface-variant-light dark:bg-surface-variant-dark">
                        <Text className="text-sm text-text-secondary-light dark:text-text-secondary-dark text-center">
                            {budget.spent > 0 ? (
                                <>
                                    Com este limite, você usou{' '}
                                    <Text className="font-inter-bold" style={{ color: budget.category_color }}>
                                        {((budget.spent / (parseFloat(amount.replace(',', '.')) * 100 || 1)) * 100).toFixed(0)}%
                                    </Text>
                                    {' '}do orçamento
                                </>
                            ) : (
                                'Nenhum gasto registrado nesta categoria'
                            )}
                        </Text>
                    </View>
                </View>

                {/* Save Button */}
                <View className="px-4 pb-4 mt-auto">
                    <Button
                        variant="primary"
                        fullWidth
                        size="lg"
                        onPress={handleSave}
                        loading={isSaving}
                        disabled={!amount || parseFloat(amount.replace(',', '.')) <= 0}
                    >
                        Salvar Alterações
                    </Button>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
