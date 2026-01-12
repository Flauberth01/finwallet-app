import { View, Text, Dimensions } from 'react-native';
import Svg, { Rect, Line, G, Text as SvgText } from 'react-native-svg';
import { colors } from '@/constants';

interface MonthlyData {
    month: string;
    year: number;
    income: number;
    expense: number;
}

interface BarChartProps {
    data: MonthlyData[];
    isDark?: boolean;
}

const { width } = Dimensions.get('window');
const CHART_WIDTH = width - 64;
const CHART_HEIGHT = 180;
const PADDING = { top: 20, right: 16, bottom: 40, left: 50 };
const BAR_WIDTH = 12;
const BAR_GAP = 4;

const MONTH_NAMES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

export function BarChart({ data, isDark = false }: BarChartProps) {
    if (data.length === 0) {
        return (
            <View style={{ alignItems: 'center', padding: 20 }}>
                <Text style={{ color: isDark ? '#94A3B8' : '#64748B', fontSize: 14 }}>
                    Adicione transações para ver o gráfico
                </Text>
            </View>
        );
    }

    const chartAreaWidth = CHART_WIDTH - PADDING.left - PADDING.right;
    const chartAreaHeight = CHART_HEIGHT - PADDING.top - PADDING.bottom;

    // Find max value for scale
    const maxValue = Math.max(
        ...data.map((d) => Math.max(d.income, d.expense))
    ) / 100;

    // Round up to nice number
    const scale = maxValue > 0 ? Math.ceil(maxValue / 1000) * 1000 || 100 : 100;

    // Bar group width
    const groupWidth = chartAreaWidth / data.length;

    const textColor = isDark ? '#94A3B8' : '#64748B';
    const gridColor = isDark ? '#334155' : '#E2E8F0';

    // Y-axis labels (4 lines)
    const yLabels = [0, scale * 0.25, scale * 0.5, scale * 0.75, scale];

    return (
        <View style={{ alignItems: 'center' }}>
            {/* Legend */}
            <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 12 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 20 }}>
                    <View style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: colors.income, marginRight: 6 }} />
                    <Text style={{ fontSize: 12, color: textColor }}>Receitas</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: colors.expense, marginRight: 6 }} />
                    <Text style={{ fontSize: 12, color: textColor }}>Despesas</Text>
                </View>
            </View>

            {/* Chart */}
            <Svg width={CHART_WIDTH} height={CHART_HEIGHT}>
                {/* Grid lines */}
                {yLabels.map((label, i) => {
                    const y = PADDING.top + chartAreaHeight - (label / scale) * chartAreaHeight;
                    return (
                        <G key={i}>
                            <Line
                                x1={PADDING.left}
                                y1={y}
                                x2={CHART_WIDTH - PADDING.right}
                                y2={y}
                                stroke={gridColor}
                                strokeWidth={1}
                                strokeDasharray="4,4"
                            />
                            <SvgText
                                x={PADDING.left - 8}
                                y={y + 4}
                                textAnchor="end"
                                fontSize={10}
                                fill={textColor}
                            >
                                {label >= 1000 ? `${label / 1000}k` : label}
                            </SvgText>
                        </G>
                    );
                })}

                {/* Bars */}
                {data.map((item, index) => {
                    const groupX = PADDING.left + index * groupWidth + groupWidth / 2;
                    const incomeHeight = (item.income / 100 / scale) * chartAreaHeight;
                    const expenseHeight = (item.expense / 100 / scale) * chartAreaHeight;

                    const monthName = MONTH_NAMES[parseInt(item.month) - 1] || item.month;

                    return (
                        <G key={index}>
                            {/* Income bar */}
                            <Rect
                                x={groupX - BAR_WIDTH - BAR_GAP / 2}
                                y={PADDING.top + chartAreaHeight - incomeHeight}
                                width={BAR_WIDTH}
                                height={incomeHeight || 1}
                                fill={colors.income}
                                rx={4}
                            />
                            {/* Expense bar */}
                            <Rect
                                x={groupX + BAR_GAP / 2}
                                y={PADDING.top + chartAreaHeight - expenseHeight}
                                width={BAR_WIDTH}
                                height={expenseHeight || 1}
                                fill={colors.expense}
                                rx={4}
                            />
                            {/* Month label */}
                            <SvgText
                                x={groupX}
                                y={CHART_HEIGHT - 10}
                                textAnchor="middle"
                                fontSize={10}
                                fill={textColor}
                            >
                                {monthName}
                            </SvgText>
                        </G>
                    );
                })}
            </Svg>
        </View>
    );
}
