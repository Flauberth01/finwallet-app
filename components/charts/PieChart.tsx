import { View, Text, Dimensions } from 'react-native';
import Svg, { Path, Circle, G, Text as SvgText } from 'react-native-svg';
import { colors } from '@/constants';

interface CategoryData {
    category_id: string;
    category_name: string;
    category_color: string;
    total: number;
    percentage: number;
}

interface PieChartProps {
    data: CategoryData[];
    isDark?: boolean;
}

const { width } = Dimensions.get('window');
const CHART_SIZE = Math.min(width - 100, 200);
const CENTER = CHART_SIZE / 2;
const RADIUS = CHART_SIZE / 2 - 10;
const INNER_RADIUS = RADIUS * 0.6;

function polarToCartesian(centerX: number, centerY: number, radius: number, angleInDegrees: number) {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
        x: centerX + radius * Math.cos(angleInRadians),
        y: centerY + radius * Math.sin(angleInRadians),
    };
}

function createArcPath(startAngle: number, endAngle: number, outerRadius: number, innerRadius: number): string {
    const start = polarToCartesian(CENTER, CENTER, outerRadius, endAngle);
    const end = polarToCartesian(CENTER, CENTER, outerRadius, startAngle);
    const innerStart = polarToCartesian(CENTER, CENTER, innerRadius, endAngle);
    const innerEnd = polarToCartesian(CENTER, CENTER, innerRadius, startAngle);

    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

    const d = [
        'M', start.x, start.y,
        'A', outerRadius, outerRadius, 0, largeArcFlag, 0, end.x, end.y,
        'L', innerEnd.x, innerEnd.y,
        'A', innerRadius, innerRadius, 0, largeArcFlag, 1, innerStart.x, innerStart.y,
        'Z',
    ].join(' ');

    return d;
}

export function PieChart({ data, isDark = false }: PieChartProps) {
    if (data.length === 0) {
        return (
            <View style={{ alignItems: 'center', padding: 20 }}>
                <Text style={{ color: isDark ? '#94A3B8' : '#64748B', fontSize: 14 }}>
                    Adicione despesas para ver o gráfico
                </Text>
            </View>
        );
    }

    const totalAmount = data.reduce((sum, item) => sum + item.total, 0);

    // Create pie slices
    let currentAngle = 0;
    const slices = data.map((item) => {
        const sliceAngle = (item.total / totalAmount) * 360;
        const startAngle = currentAngle;
        const endAngle = currentAngle + sliceAngle;
        currentAngle = endAngle;

        return {
            ...item,
            startAngle,
            endAngle,
            path: createArcPath(startAngle, endAngle - 0.5, RADIUS, INNER_RADIUS),
        };
    });

    return (
        <View style={{ alignItems: 'center' }}>
            {/* Pie Chart */}
            <View style={{ width: CHART_SIZE, height: CHART_SIZE, marginBottom: 16 }}>
                <Svg width={CHART_SIZE} height={CHART_SIZE}>
                    <G>
                        {slices.map((slice) => (
                            <Path
                                key={slice.category_id}
                                d={slice.path}
                                fill={slice.category_color}
                            />
                        ))}
                        {/* Center circle */}
                        <Circle
                            cx={CENTER}
                            cy={CENTER}
                            r={INNER_RADIUS - 5}
                            fill={isDark ? '#1E293B' : '#FFFFFF'}
                        />
                        {/* Center text */}
                        <SvgText
                            x={CENTER}
                            y={CENTER - 8}
                            textAnchor="middle"
                            fontSize={12}
                            fill={isDark ? '#94A3B8' : '#64748B'}
                        >
                            Total
                        </SvgText>
                        <SvgText
                            x={CENTER}
                            y={CENTER + 12}
                            textAnchor="middle"
                            fontSize={14}
                            fontWeight="bold"
                            fill={isDark ? '#F8FAFC' : '#1E293B'}
                        >
                            {`R$ ${(totalAmount / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                        </SvgText>
                    </G>
                </Svg>
            </View>

            {/* Legend */}
            <View style={{ width: '100%' }}>
                {data.map((item, index) => (
                    <View
                        key={item.category_id}
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            marginTop: index > 0 ? 8 : 0,
                            paddingHorizontal: 4,
                        }}
                    >
                        <View
                            style={{
                                width: 10,
                                height: 10,
                                borderRadius: 5,
                                backgroundColor: item.category_color,
                                marginRight: 8,
                            }}
                        />
                        <Text
                            style={{
                                flex: 1,
                                fontSize: 13,
                                color: isDark ? '#F8FAFC' : '#1E293B',
                            }}
                            numberOfLines={1}
                        >
                            {item.category_name}
                        </Text>
                        <Text
                            style={{
                                fontSize: 13,
                                fontWeight: '600',
                                color: isDark ? '#94A3B8' : '#64748B',
                                marginRight: 8,
                                minWidth: 40,
                                textAlign: 'right',
                            }}
                        >
                            {item.percentage.toFixed(0)}%
                        </Text>
                        <Text
                            style={{
                                fontSize: 13,
                                fontWeight: '600',
                                color: colors.expense,
                                minWidth: 80,
                                textAlign: 'right',
                            }}
                        >
                            R$ {(item.total / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </Text>
                    </View>
                ))}
            </View>
        </View>
    );
}
