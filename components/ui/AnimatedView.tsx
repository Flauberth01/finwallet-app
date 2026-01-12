import React, { useEffect } from 'react';
import { ViewStyle } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withDelay,
    withSpring,
    Easing,
    FadeIn,
    FadeInDown,
    FadeInUp,
    FadeInLeft,
    FadeInRight,
    SlideInDown,
    SlideInUp,
    SlideInLeft,
    SlideInRight,
    ZoomIn,
} from 'react-native-reanimated';

interface AnimatedViewProps {
    children: React.ReactNode;
    animation?: 'fadeIn' | 'fadeInDown' | 'fadeInUp' | 'fadeInLeft' | 'fadeInRight' |
    'slideInDown' | 'slideInUp' | 'slideInLeft' | 'slideInRight' |
    'zoomIn' | 'scale' | 'custom';
    delay?: number;
    duration?: number;
    style?: ViewStyle;
    className?: string;
}

// Map animation names to Reanimated entering animations
const animationMap = {
    fadeIn: FadeIn,
    fadeInDown: FadeInDown,
    fadeInUp: FadeInUp,
    fadeInLeft: FadeInLeft,
    fadeInRight: FadeInRight,
    slideInDown: SlideInDown,
    slideInUp: SlideInUp,
    slideInLeft: SlideInLeft,
    slideInRight: SlideInRight,
    zoomIn: ZoomIn,
};

export function AnimatedView({
    children,
    animation = 'fadeInDown',
    delay = 0,
    duration = 400,
    style,
    className,
}: AnimatedViewProps) {
    // For built-in animations
    if (animation !== 'scale' && animation !== 'custom') {
        const EnteringAnimation = animationMap[animation];
        const entering = EnteringAnimation
            .delay(delay)
            .duration(duration)
            .springify()
            .damping(15);

        return (
            <Animated.View entering={entering} style={style} className={className}>
                {children}
            </Animated.View>
        );
    }

    // Custom scale animation
    const scale = useSharedValue(0.9);
    const opacity = useSharedValue(0);

    useEffect(() => {
        opacity.value = withDelay(
            delay,
            withTiming(1, { duration, easing: Easing.out(Easing.cubic) })
        );
        scale.value = withDelay(
            delay,
            withSpring(1, { damping: 15, stiffness: 150 })
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [{ scale: scale.value }],
    }));

    return (
        <Animated.View style={[animatedStyle, style]} className={className}>
            {children}
        </Animated.View>
    );
}

// Stagger helper - creates delays for list items
export function getStaggerDelay(index: number, baseDelay: number = 50): number {
    return index * baseDelay;
}
