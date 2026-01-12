import React, { forwardRef } from 'react';
import { View, TextInput, Text, TextInputProps } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

interface InputProps extends TextInputProps {
    label?: string;
    error?: string;
    hint?: string;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}

export const Input = forwardRef<TextInput, InputProps>(
    ({ label, error, hint, leftIcon, rightIcon, className, onFocus, onBlur, ...props }, ref) => {
        const isFocused = useSharedValue(0);

        const animatedBorderStyle = useAnimatedStyle(() => ({
            borderColor: isFocused.value
                ? withTiming('#6366F1', { duration: 150 })
                : withTiming(error ? '#EF4444' : '#E2E8F0', { duration: 150 }),
        }));

        const handleFocus = (e: any) => {
            isFocused.value = 1;
            onFocus?.(e);
        };

        const handleBlur = (e: any) => {
            isFocused.value = 0;
            onBlur?.(e);
        };

        return (
            <View className="w-full">
                {label && (
                    <Text className="text-sm font-inter-medium text-text-secondary-light dark:text-text-secondary-dark mb-2">
                        {label}
                    </Text>
                )}

                <Animated.View
                    style={animatedBorderStyle}
                    className="flex-row items-center bg-surface-light dark:bg-surface-dark rounded-xl border-2 px-4"
                >
                    {leftIcon && <View className="mr-3">{leftIcon}</View>}

                    <AnimatedTextInput
                        ref={ref}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        placeholderTextColor="#94A3B8"
                        className={`flex-1 h-14 text-base font-inter-regular text-text-primary-light dark:text-text-primary-dark ${className || ''}`}
                        {...props}
                    />

                    {rightIcon && <View className="ml-3">{rightIcon}</View>}
                </Animated.View>

                {error && (
                    <Text className="text-sm font-inter-regular text-error mt-1">
                        {error}
                    </Text>
                )}

                {hint && !error && (
                    <Text className="text-sm font-inter-regular text-text-tertiary-light dark:text-text-tertiary-dark mt-1">
                        {hint}
                    </Text>
                )}
            </View>
        );
    }
);

Input.displayName = 'Input';
