import React from 'react';
import { View, Pressable } from 'react-native';
import { cva, type VariantProps } from 'class-variance-authority';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const cardVariants = cva(
    'rounded-2xl',
    {
        variants: {
            variant: {
                default: 'bg-surface-light dark:bg-surface-dark',
                elevated: 'bg-surface-light dark:bg-surface-dark shadow-lg shadow-black/10',
                outlined: 'bg-transparent border border-border-light dark:border-border-dark',
                filled: 'bg-surface-variant-light dark:bg-surface-variant-dark',
            },
            padding: {
                none: 'p-0',
                sm: 'p-3',
                md: 'p-4',
                lg: 'p-6',
            },
        },
        defaultVariants: {
            variant: 'default',
            padding: 'md',
        },
    }
);

interface CardProps extends VariantProps<typeof cardVariants> {
    children: React.ReactNode;
    onPress?: () => void;
    className?: string;
}

export function Card({
    children,
    variant,
    padding,
    onPress,
    className,
}: CardProps) {
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const handlePressIn = () => {
        if (onPress) {
            scale.value = withSpring(0.98, { damping: 15, stiffness: 400 });
        }
    };

    const handlePressOut = () => {
        if (onPress) {
            scale.value = withSpring(1, { damping: 15, stiffness: 400 });
        }
    };

    if (onPress) {
        return (
            <AnimatedPressable
                onPress={onPress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                style={animatedStyle}
                className={`${cardVariants({ variant, padding })} ${className || ''}`}
            >
                {children}
            </AnimatedPressable>
        );
    }

    return (
        <View className={`${cardVariants({ variant, padding })} ${className || ''}`}>
            {children}
        </View>
    );
}
