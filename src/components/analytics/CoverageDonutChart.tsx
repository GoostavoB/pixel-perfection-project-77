import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Card } from '@/components/ui/card';

interface CoverageData {
  specialty: string;
  total_codes: number;
  cached_codes: number;
  coverage_percent: number;
}

interface CoverageDonutChartProps {
  data: CoverageData[];
}

const COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))'
];

export const CoverageDonutChart = ({ data }: CoverageDonutChartProps) => {
  const chartData = data.slice(0, 5).map((item, index) => ({
    name: item.specialty,
    value: Number(item.coverage_percent),
    cached: item.cached_codes,
    total: item.total_codes
  }));

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">Coverage by Specialty</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            fill="hsl(var(--primary))"
            dataKey="value"
            label={({ name, value }) => `${name}: ${value}%`}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px'
            }}
            formatter={(value: number, name: string, props: any) => [
              `${value}% (${props.payload.cached}/${props.payload.total} codes)`,
              name
            ]}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </Card>
  );
};
