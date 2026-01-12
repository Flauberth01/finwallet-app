import React from 'react';
import { Pressable, Text, ActivityIndicator, View } from 'react-native';
import { cva, type VariantProps } from 'class-variance-authority';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { hapticService } from '@/services';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const buttonVariants = cva(
    'flex-row items-center justify-center rounded-xl',
    {
        variants: {
            variant: {
                primary: 'bg-primary-500',
                secondary: 'bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark',
                destructive: 'bg-error',
                ghost: 'bg-transparent',
                income: 'bg-income',
                expense: 'bg-expense',
            },
            size: {
                sm: 'h-10 px-4',
                md: 'h-12 px-6',
                lg: 'h-14 px-8',
                icon: 'h-12 w-12',
            },
            fullWidth: {
                true: 'w-full',
            },
        },
        defaultVariants: {
            variant: 'primary',
            size: 'md',
        },
    }
);

const textVariants = cva(
    'font-inter-semibold text-base',
    {
        variants: {
            variant: {
                primary: 'text-white',
                secondary: 'text-text-primary-light dark:text-text-primary-dark',
                destructive: 'text-white',
                ghost: 'text-primary-500',
                income: 'text-white',
                expense: 'text-white',
            },
            size: {
                sm: 'text-sm',
                md: 'text-base',
                lg: 'text-lg',
                icon: 'text-base',
            },
        },
        defaultVariants: {
            variant: 'primary',
            size: 'md',
        },
    }
);

interface ButtonProps extends VariantProps<typeof buttonVariants> {
    children: React.ReactNode;
    onPress?: () => void;
    disabled?: boolean;
    loading?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    className?: string;
}

export function Button({
    children,
    variant,
    size,
    fullWidth,
    onPress,
    disabled = false,
    loading = false,
    leftIcon,
    rightIcon,
    className,
}: ButtonProps) {
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const handlePressIn = () => {
        scale.value = withSpring(0.96, { damping: 15, stiffness: 400 });
        hapticService.light();
    };

    const handlePressOut = () => {
        scale.value = withSpring(1, { damping: 15, stiffness: 400 });
    };

    const isDisabled = disabled || loading;

    return (
        <AnimatedPressable
            onPress={onPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            disabled={isDisabled}
            style={animatedStyle}
            className={`${buttonVariants({ variant, size, fullWidth })} ${isDisabled ? 'opacity-50' : ''} ${className || ''}`}
        >
            {loading ? (
                <ActivityIndicator
                    color={variant === 'secondary' || variant === 'ghost' ? '#6366F1' : '#FFFFFF'}
                    size="small"
                />
            ) : (
                <>
                    {leftIcon && <View className="mr-2">{leftIcon}</View>}
                    <Text className={textVariants({ variant, size })}>
                        {children}
                    </Text>
                    {rightIcon && <View className="ml-2">{rightIcon}</View>}
                </>
            )}
        </AnimatedPressable>
    );
}
