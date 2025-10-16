import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card } from '@/components/ui/card';

interface CostDataPoint {
  time_bucket: string;
  total_codes_processed: number;
  total_requests: number;
}

interface CostSavingsBarChartProps {
  data: CostDataPoint[];
}

export const CostSavingsBarChart = ({ data }: CostSavingsBarChartProps) => {
  const formattedData = data.map(point => ({
    time: new Date(point.time_bucket).toLocaleTimeString('en-US', { hour: '2-digit' }),
    codesProcessed: Number(point.total_codes_processed),
    requests: Number(point.total_requests)
  }));

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">Request Volume (24 Hours)</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={formattedData}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis 
            dataKey="time" 
            className="text-xs text-muted-foreground"
          />
          <YAxis 
            className="text-xs text-muted-foreground"
            label={{ value: 'Count', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px'
            }}
          />
          <Legend />
          <Bar 
            dataKey="codesProcessed" 
            fill="hsl(var(--primary))" 
            name="Codes Processed"
            radius={[8, 8, 0, 0]}
          />
          <Bar 
            dataKey="requests" 
            fill="hsl(var(--chart-2))" 
            name="Total Requests"
            radius={[8, 8, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
};
