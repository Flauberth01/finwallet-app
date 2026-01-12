import { View, Text, ScrollView, Pressable, Alert, KeyboardAvoidingView, Platform, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { X, Check, Calendar } from 'lucide-react-native';
import { useState, useEffect, useRef } from 'react';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Button, Card, Input } from '@/components/ui';
import { useThemeContext } from '@/providers';
import { useTransactionStore } from '@/stores';
import { categoryService } from '@/services';
import { colors } from '@/constants';
import { Category } from '@/types';

export default function NewTransactionScreen() {
    const router = useRouter();
    const { type: typeParam } = useLocalSearchParams<{ type?: string }>();
    const { isDark } = useThemeContext();
    const { addTransaction, isLoading } = useTransactionStore();
    const amountInputRef = useRef<TextInput>(null);

    // Form state
    const [type, setType] = useState<'income' | 'expense'>(typeParam === 'income' ? 'income' : 'expense');
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [date, setDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoadingCategories, setIsLoadingCategories] = useState(true);

    // Load categories directly from service
    useEffect(() => {
        async function loadCategories() {
            setIsLoadingCategories(true);
            try {
                const cats = await categoryService.getAll(type);
                setCategories(cats);
                if (cats.length > 0) {
                    setSelectedCategory(cats[0]);
                }
            } catch (error) {
                console.error('Error loading categories:', error);
            } finally {
                setIsLoadingCategories(false);
            }
        }
        loadCategories();
    }, [type]);

    const headerColor = type === 'expense' ? colors.expense : colors.income;

    // Parse amount to cents
    const parseAmount = (value: string): number => {
        const cleaned = value.replace(/[^\d]/g, '');
        return parseInt(cleaned) || 0;
    };

    // Format amount for display
    const formatAmountDisplay = (value: string): string => {
        const cents = parseAmount(value);
        if (cents === 0) return 'R$ 0,00';
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        }).format(cents / 100);
    };

    // Handle amount input
    const handleAmountChange = (text: string) => {
        const cleaned = text.replace(/[^\d]/g, '');
        setAmount(cleaned);
    };

    // Focus amount input
    const focusAmountInput = () => {
        amountInputRef.current?.focus();
    };

    // Handle save
    const handleSave = async () => {
        if (!amount || parseAmount(amount) === 0) {
            Alert.alert('Erro', 'Informe um valor válido');
            return;
        }

        if (!description.trim()) {
            Alert.alert('Erro', 'Informe uma descrição');
            return;
        }

        if (!selectedCategory) {
            Alert.alert('Erro', 'Selecione uma categoria');
            return;
        }

        try {
            await addTransaction({
                type,
                amount: parseAmount(amount),
                description: description.trim(),
                category_id: selectedCategory.id,
                date: date.toISOString().split('T')[0],
            });

            router.back();
        } catch (error) {
            Alert.alert('Erro', 'Não foi possível salvar a transação');
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
            <KeyboardAvoidingView
                className="flex-1"
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                {/* Header */}
                <View
                    className="px-4 py-4 flex-row items-center justify-between"
                    style={{ backgroundColor: headerColor }}
                >
                    <Pressable onPress={() => router.back()} className="p-2">
                        <X color="white" size={24} />
                    </Pressable>
                    <Text className="text-lg font-inter-semibold text-white">
                        Nova {type === 'expense' ? 'Despesa' : 'Receita'}
                    </Text>
                    <View className="w-10" />
                </View>

                {/* Type Toggle */}
                <View
                    className="flex-row px-4 pb-4"
                    style={{ backgroundColor: headerColor }}
                >
                    <Pressable
                        className={`flex-1 py-2 items-center rounded-l-lg ${type === 'expense' ? 'bg-white/20' : 'bg-transparent'}`}
                        onPress={() => {
                            setType('expense');
                            setSelectedCategory(null);
                        }}
                    >
                        <Text className="text-white font-inter-semibold">Despesa</Text>
                    </Pressable>
                    <Pressable
                        className={`flex-1 py-2 items-center rounded-r-lg ${type === 'income' ? 'bg-white/20' : 'bg-transparent'}`}
                        onPress={() => {
                            setType('income');
                            setSelectedCategory(null);
                        }}
                    >
                        <Text className="text-white font-inter-semibold">Receita</Text>
                    </Pressable>
                </View>

                {/* Amount Input */}
                <Pressable
                    onPress={focusAmountInput}
                    className="px-4 py-8 items-center"
                    style={{ backgroundColor: headerColor }}
                >
                    <Text className="text-sm font-inter-medium text-white/70 mb-2">
                        VALOR (toque para editar)
                    </Text>
                    <Text className="text-5xl font-inter-bold text-white">
                        {formatAmountDisplay(amount)}
                    </Text>
                    <TextInput
                        ref={amountInputRef}
                        value={amount}
                        onChangeText={handleAmountChange}
                        keyboardType="numeric"
                        style={{ position: 'absolute', opacity: 0, height: 1, width: 1 }}
                    />
                </Pressable>

                {/* Form */}
                <ScrollView className="flex-1 -mt-4">
                    <Card variant="elevated" className="mx-4 mb-4">
                        <Input
                            label="Descrição"
                            placeholder="Ex: Almoço no restaurante"
                            value={description}
                            onChangeText={setDescription}
                        />

                        {/* Category Selection */}
                        <View className="mt-4">
                            <Text className="text-sm font-inter-medium text-text-secondary-light dark:text-text-secondary-dark mb-2">
                                Categoria
                            </Text>

                            {isLoadingCategories ? (
                                <Text className="text-sm text-text-tertiary-light dark:text-text-tertiary-dark">
                                    Carregando categorias...
                                </Text>
                            ) : categories.length === 0 ? (
                                <Text className="text-sm text-text-tertiary-light dark:text-text-tertiary-dark">
                                    Nenhuma categoria encontrada
                                </Text>
                            ) : (
                                <View className="flex-row flex-wrap gap-2">
                                    {categories.map((cat) => (
                                        <Pressable
                                            key={cat.id}
                                            onPress={() => setSelectedCategory(cat)}
                                            className={`px-3 py-2 rounded-full flex-row items-center ${selectedCategory?.id === cat.id
                                                ? 'bg-primary-500'
                                                : 'bg-surface-variant-light dark:bg-surface-variant-dark'
                                                }`}
                                        >
                                            <View
                                                className="w-3 h-3 rounded-full mr-2"
                                                style={{ backgroundColor: cat.color }}
                                            />
                                            <Text
                                                className={`text-sm font-inter-medium ${selectedCategory?.id === cat.id
                                                    ? 'text-white'
                                                    : 'text-text-primary-light dark:text-text-primary-dark'
                                                    }`}
                                            >
                                                {cat.name}
                                            </Text>
                                            {selectedCategory?.id === cat.id && (
                                                <Check color="white" size={14} style={{ marginLeft: 4 }} />
                                            )}
                                        </Pressable>
                                    ))}
                                </View>
                            )}
                        </View>

                        {/* Date */}
                        <View className="mt-4">
                            <Text className="text-sm font-inter-medium text-text-secondary-light dark:text-text-secondary-dark mb-2">
                                Data
                            </Text>
                            <Pressable
                                onPress={() => setShowDatePicker(true)}
                                className="flex-row items-center bg-surface-variant-light dark:bg-surface-variant-dark rounded-xl px-4 py-3"
                            >
                                <Calendar color={isDark ? colors.dark.textSecondary : colors.light.textSecondary} size={20} />
                                <Text className="flex-1 ml-3 text-base font-inter-regular text-text-primary-light dark:text-text-primary-dark">
                                    {date.toLocaleDateString('pt-BR', {
                                        weekday: 'long',
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric',
                                    })}
                                </Text>
                                <Text className="text-sm text-primary-500 font-inter-medium">
                                    Alterar
                                </Text>
                            </Pressable>
                            {showDatePicker && (
                                <DateTimePicker
                                    value={date}
                                    mode="date"
                                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                    onChange={(event, selectedDate) => {
                                        setShowDatePicker(Platform.OS === 'ios');
                                        if (selectedDate) {
                                            setDate(selectedDate);
                                        }
                                    }}
                                    maximumDate={new Date()}
                                />
                            )}
                        </View>
                    </Card>

                    {/* Save Button */}
                    <View className="px-4 pb-4">
                        <Button
                            variant={type === 'expense' ? 'expense' : 'income'}
                            fullWidth
                            size="lg"
                            onPress={handleSave}
                            loading={isLoading}
                            disabled={isLoadingCategories || categories.length === 0}
                        >
                            Salvar {type === 'expense' ? 'Despesa' : 'Receita'}
                        </Button>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
