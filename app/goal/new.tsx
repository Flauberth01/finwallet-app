import { View, Text, ScrollView, Pressable, Alert, KeyboardAvoidingView, Platform, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { X, Calendar, Palette, Target, Lightbulb } from 'lucide-react-native';
import { useState, useRef } from 'react';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Button, Card, Input } from '@/components/ui';
import { useThemeContext } from '@/providers';
import { useGoalStore } from '@/stores';
import { colors } from '@/constants';

// Preset colors for goals
const GOAL_COLORS = [
    '#6366F1', // Primary purple
    '#22C55E', // Green
    '#EF4444', // Red
    '#F59E0B', // Amber
    '#3B82F6', // Blue
    '#EC4899', // Pink
    '#8B5CF6', // Violet
    '#14B8A6', // Teal
];

export default function NewGoalScreen() {
    const router = useRouter();
    const { isDark } = useThemeContext();
    const { addGoal, isLoading } = useGoalStore();
    const amountInputRef = useRef<TextInput>(null);

    // Form state
    const [name, setName] = useState('');
    const [amount, setAmount] = useState('');
    const [deadlineDate, setDeadlineDate] = useState(() => {
        // Default to 1 month from now
        const date = new Date();
        date.setMonth(date.getMonth() + 1);
        return date;
    });
    const [selectedColor, setSelectedColor] = useState(GOAL_COLORS[0]);
    const [showDatePicker, setShowDatePicker] = useState(false);

    const iconColor = isDark ? colors.dark.textSecondary : colors.light.textSecondary;

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

    // Handle date change
    const handleDateChange = (event: any, selectedDate?: Date) => {
        setShowDatePicker(Platform.OS === 'ios');
        if (selectedDate) {
            setDeadlineDate(selectedDate);
        }
    };

    // Handle save
    const handleSave = async () => {
        if (!name.trim()) {
            Alert.alert('Erro', 'Informe um nome para a meta');
            return;
        }

        if (!amount || parseAmount(amount) === 0) {
            Alert.alert('Erro', 'Informe um valor alvo válido');
            return;
        }

        try {
            await addGoal({
                name: name.trim(),
                target_amount: parseAmount(amount),
                deadline: deadlineDate.toISOString().split('T')[0],
                color: selectedColor,
                icon: 'target',
            });

            router.back();
        } catch (error) {
            Alert.alert('Erro', 'Não foi possível criar a meta');
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
                    style={{ backgroundColor: selectedColor }}
                >
                    <Pressable onPress={() => router.back()} className="p-2">
                        <X color="white" size={24} />
                    </Pressable>
                    <Text className="text-lg font-inter-semibold text-white">
                        Nova Meta
                    </Text>
                    <View className="w-10" />
                </View>

                {/* Target Amount Input */}
                <Pressable
                    onPress={focusAmountInput}
                    className="px-4 py-8 items-center"
                    style={{ backgroundColor: selectedColor }}
                >
                    <View className="flex-row items-center mb-2">
                        <Target color="white" size={20} />
                        <Text className="text-sm font-inter-medium text-white/70 ml-2">
                            VALOR DA META (toque para editar)
                        </Text>
                    </View>
                    <Text className="text-4xl font-inter-bold text-white">
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
                            label="Nome da Meta"
                            placeholder="Ex: Viagem para Europa"
                            value={name}
                            onChangeText={setName}
                        />

                        {/* Deadline */}
                        <View className="mt-4">
                            <Text className="text-sm font-inter-medium text-text-secondary-light dark:text-text-secondary-dark mb-2">
                                Prazo
                            </Text>
                            <Pressable
                                onPress={() => setShowDatePicker(true)}
                                className="flex-row items-center bg-surface-variant-light dark:bg-surface-variant-dark rounded-xl px-4 py-3"
                            >
                                <Calendar color={iconColor} size={20} />
                                <Text className="flex-1 ml-3 text-base font-inter-regular text-text-primary-light dark:text-text-primary-dark">
                                    {deadlineDate.toLocaleDateString('pt-BR', {
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric',
                                    })}
                                </Text>
                                <Text className="text-sm text-primary-500">Alterar</Text>
                            </Pressable>
                        </View>

                        {/* Date Picker */}
                        {showDatePicker && (
                            <DateTimePicker
                                value={deadlineDate}
                                mode="date"
                                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                onChange={handleDateChange}
                                minimumDate={new Date()}
                                locale="pt-BR"
                            />
                        )}

                        {/* Color Selection */}
                        <View className="mt-4">
                            <View className="flex-row items-center mb-2">
                                <Palette color={iconColor} size={16} />
                                <Text className="text-sm font-inter-medium text-text-secondary-light dark:text-text-secondary-dark ml-2">
                                    Cor
                                </Text>
                            </View>
                            <View className="flex-row flex-wrap gap-3">
                                {GOAL_COLORS.map((color) => (
                                    <Pressable
                                        key={color}
                                        onPress={() => setSelectedColor(color)}
                                        style={{
                                            width: 40,
                                            height: 40,
                                            borderRadius: 20,
                                            backgroundColor: color,
                                            borderWidth: selectedColor === color ? 3 : 0,
                                            borderColor: isDark ? '#FFFFFF' : '#1E293B',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        {selectedColor === color && (
                                            <View
                                                style={{
                                                    width: 12,
                                                    height: 12,
                                                    borderRadius: 6,
                                                    backgroundColor: 'white',
                                                }}
                                            />
                                        )}
                                    </Pressable>
                                ))}
                            </View>
                        </View>
                    </Card>

                    {/* Tips */}
                    <Card variant="filled" className="mx-4 mb-4">
                        <View className="flex-row items-center mb-2">
                            <Lightbulb color={colors.warning} size={16} />
                            <Text className="text-sm font-inter-semibold text-text-primary-light dark:text-text-primary-dark ml-2">
                                Dicas para suas metas
                            </Text>
                        </View>
                        <Text className="text-xs font-inter-regular text-text-secondary-light dark:text-text-secondary-dark">
                            • Seja específico: "Viagem para Paris" é melhor que "Reserva"{'\n'}
                            • Defina prazos realistas para manter a motivação{'\n'}
                            • Faça depósitos regulares, mesmo que pequenos
                        </Text>
                    </Card>

                    {/* Save Button */}
                    <View className="px-4 pb-4">
                        <Button
                            variant="primary"
                            fullWidth
                            size="lg"
                            onPress={handleSave}
                            loading={isLoading}
                        >
                            Criar Meta
                        </Button>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
