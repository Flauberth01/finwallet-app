import { View, Text, Dimensions } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import Animated, {
    useSharedValue,
    useAnimatedProps,
    withTiming,
    Easing
} from 'react-native-reanimated';
import { useEffect } from 'react';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface ProgressRingProps {
    progress: number; // 0 to 100
    size?: number;
    strokeWidth?: number;
    color?: string;
    backgroundColor?: string;
    showPercentage?: boolean;
    centerText?: string;
    isDark?: boolean;
}

export function ProgressRing({
    progress,
    size = 120,
    strokeWidth = 10,
    color = '#6366F1',
    backgroundColor = '#E2E8F0',
    showPercentage = true,
    centerText,
    isDark = false,
}: ProgressRingProps) {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const center = size / 2;

    // Clamp progress between 0 and 100
    const clampedProgress = Math.min(100, Math.max(0, progress));

    // Animated progress value
    const animatedProgress = useSharedValue(0);

    useEffect(() => {
        animatedProgress.value = withTiming(clampedProgress, {
            duration: 800,
            easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        });
    }, [clampedProgress]);

    const animatedProps = useAnimatedProps(() => {
        const strokeDashoffset = circumference - (circumference * animatedProgress.value) / 100;
        return {
            strokeDashoffset,
        };
    });

    const displayProgress = Math.round(clampedProgress);

    return (
        <View style={{ alignItems: 'center', justifyContent: 'center' }}>
            <Svg width={size} height={size}>
                <G rotation="-90" origin={`${center}, ${center}`}>
                    {/* Background circle */}
                    <Circle
                        cx={center}
                        cy={center}
                        r={radius}
                        stroke={isDark ? '#334155' : backgroundColor}
                        strokeWidth={strokeWidth}
                        fill="transparent"
                    />
                    {/* Progress circle */}
                    <AnimatedCircle
                        cx={center}
                        cy={center}
                        r={radius}
                        stroke={color}
                        strokeWidth={strokeWidth}
                        fill="transparent"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        animatedProps={animatedProps}
                    />
                </G>
            </Svg>

            {/* Center content */}
            <View
                style={{
                    position: 'absolute',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                {showPercentage && (
                    <Text
                        style={{
                            fontSize: size / 4,
                            fontWeight: 'bold',
                            color: isDark ? '#F8FAFC' : '#1E293B',
                        }}
                    >
                        {displayProgress}%
                    </Text>
                )}
                {centerText && (
                    <Text
                        style={{
                            fontSize: size / 10,
                            color: isDark ? '#94A3B8' : '#64748B',
                            marginTop: 2,
                        }}
                    >
                        {centerText}
                    </Text>
                )}
            </View>
        </View>
    );
}
