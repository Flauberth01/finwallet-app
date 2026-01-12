import { View, Text, ScrollView, Pressable, Alert, KeyboardAvoidingView, Platform, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { X, Wallet, Check } from 'lucide-react-native';
import { useState, useEffect, useRef } from 'react';
import { Button, Card, Input } from '@/components/ui';
import { useThemeContext } from '@/providers';
import { budgetService, categoryService } from '@/services';
import { colors } from '@/constants';
import { Category } from '@/types';

export default function NewBudgetScreen() {
    const router = useRouter();
    const { isDark } = useThemeContext();
    const inputRef = useRef<TextInput>(null);

    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [amount, setAmount] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const selectedMonth = new Date().getMonth() + 1;
    const selectedYear = new Date().getFullYear();

    const iconColor = isDark ? colors.dark.textSecondary : colors.light.textSecondary;

    // Load categories
    useEffect(() => {
        const loadCategories = async () => {
            const data = await categoryService.getAll();
            setCategories(data.filter(c => c.type === 'expense' || c.type === 'both'));
        };
        loadCategories();
    }, []);

    // Format amount
    const formatAmount = (value: string) => {
        const numbers = value.replace(/\D/g, '');
        const amount = parseInt(numbers || '0', 10);
        return (amount / 100).toLocaleString('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
    };

    const handleAmountChange = (value: string) => {
        const numbers = value.replace(/\D/g, '');
        setAmount(numbers);
    };

    // Save budget
    const handleSave = async () => {
        if (!selectedCategory) {
            Alert.alert('Erro', 'Selecione uma categoria');
            return;
        }

        const amountNumber = parseInt(amount || '0', 10);
        if (amountNumber <= 0) {
            Alert.alert('Erro', 'Informe um valor válido');
            return;
        }

        setIsLoading(true);
        try {
            // Check if budget already exists
            const exists = await budgetService.existsForCategory(
                selectedCategory.id,
                selectedMonth,
                selectedYear
            );

            if (exists) {
                Alert.alert('Aviso', 'Já existe um orçamento para esta categoria neste mês');
                setIsLoading(false);
                return;
            }

            await budgetService.create({
                category_id: selectedCategory.id,
                amount: amountNumber,
                month: selectedMonth,
                year: selectedYear,
            });

            router.back();
        } catch (error) {
            console.error('Error creating budget:', error);
            Alert.alert('Erro', 'Não foi possível criar o orçamento');
        } finally {
            setIsLoading(false);
        }
    };

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
                            <X color={iconColor} size={24} />
                        </Pressable>
                        <Text className="text-lg font-inter-semibold text-text-primary-light dark:text-text-primary-dark ml-2">
                            Novo Orçamento
                        </Text>
                    </View>
                </View>

                <ScrollView
                    className="flex-1"
                    contentContainerClassName="p-4"
                    showsVerticalScrollIndicator={false}
                >
                    {/* Amount Input */}
                    <Card variant="elevated" className="mb-6">
                        <Text className="text-sm font-inter-medium text-text-secondary-light dark:text-text-secondary-dark mb-2">
                            Limite Mensal
                        </Text>
                        <View className="flex-row items-center">
                            <Text className="text-2xl font-inter-bold text-text-primary-light dark:text-text-primary-dark">
                                R$
                            </Text>
                            <TextInput
                                ref={inputRef}
                                value={formatAmount(amount)}
                                onChangeText={handleAmountChange}
                                placeholder="0,00"
                                keyboardType="numeric"
                                style={{
                                    flex: 1,
                                    fontSize: 32,
                                    fontWeight: 'bold',
                                    color: isDark ? colors.dark.textPrimary : colors.light.textPrimary,
                                    marginLeft: 8,
                                }}
                                placeholderTextColor={isDark ? colors.dark.textTertiary : colors.light.textTertiary}
                            />
                        </View>
                    </Card>

                    {/* Category Selection */}
                    <Text className="text-base font-inter-semibold text-text-primary-light dark:text-text-primary-dark mb-3">
                        Selecione a Categoria
                    </Text>

                    <View className="flex-row flex-wrap" style={{ gap: 8 }}>
                        {categories.map((category) => {
                            const isSelected = selectedCategory?.id === category.id;
                            return (
                                <Pressable
                                    key={category.id}
                                    onPress={() => setSelectedCategory(category)}
                                    style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        paddingHorizontal: 12,
                                        paddingVertical: 10,
                                        borderRadius: 12,
                                        backgroundColor: isSelected
                                            ? category.color + '20'
                                            : isDark ? colors.dark.surface : colors.light.surface,
                                        borderWidth: 2,
                                        borderColor: isSelected ? category.color : 'transparent',
                                    }}
                                >
                                    <View
                                        style={{
                                            width: 32,
                                            height: 32,
                                            borderRadius: 8,
                                            backgroundColor: category.color + '30',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            marginRight: 8,
                                        }}
                                    >
                                        <Wallet color={category.color} size={16} />
                                    </View>
                                    <Text style={{
                                        fontSize: 14,
                                        fontWeight: isSelected ? '600' : '400',
                                        color: isDark ? colors.dark.textPrimary : colors.light.textPrimary,
                                    }}>
                                        {category.name}
                                    </Text>
                                    {isSelected && (
                                        <View style={{ marginLeft: 8 }}>
                                            <Check color={category.color} size={16} />
                                        </View>
                                    )}
                                </Pressable>
                            );
                        })}
                    </View>

                    {/* Tips */}
                    <Card variant="filled" className="mt-6">
                        <View className="flex-row items-center mb-2">
                            <Wallet color={colors.warning} size={16} />
                            <Text className="text-sm font-inter-semibold text-text-primary-light dark:text-text-primary-dark ml-2">
                                Dica
                            </Text>
                        </View>
                        <Text className="text-xs font-inter-regular text-text-secondary-light dark:text-text-secondary-dark">
                            Você receberá alertas quando atingir 80% do limite definido. Isso ajuda a controlar os gastos antes de exceder o orçamento.
                        </Text>
                    </Card>
                </ScrollView>

                {/* Save Button */}
                <View className="px-4 pb-4">
                    <Button
                        variant="primary"
                        fullWidth
                        size="lg"
                        onPress={handleSave}
                        disabled={!selectedCategory || !amount || isLoading}
                    >
                        {isLoading ? 'Salvando...' : 'Criar Orçamento'}
                    </Button>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
