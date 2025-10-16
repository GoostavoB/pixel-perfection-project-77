import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card } from '@/components/ui/card';

interface PerformanceDataPoint {
  time_bucket: string;
  avg_response_time: number;
  avg_cache_hit_rate: number;
  total_requests: number;
}

interface PerformanceLineChartProps {
  data: PerformanceDataPoint[];
}

export const PerformanceLineChart = ({ data }: PerformanceLineChartProps) => {
  const formattedData = data.map(point => ({
    time: new Date(point.time_bucket).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    responseTime: Number(point.avg_response_time),
    cacheHitRate: Number(point.avg_cache_hit_rate),
    requests: Number(point.total_requests)
  }));

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">Performance Trends (24 Hours)</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={formattedData}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis 
            dataKey="time" 
            className="text-xs text-muted-foreground"
          />
          <YAxis 
            yAxisId="left"
            className="text-xs text-muted-foreground"
            label={{ value: 'Response Time (ms)', angle: -90, position: 'insideLeft' }}
          />
          <YAxis 
            yAxisId="right" 
            orientation="right"
            className="text-xs text-muted-foreground"
            label={{ value: 'Cache Hit Rate (%)', angle: 90, position: 'insideRight' }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px'
            }}
          />
          <Legend />
          <Line 
            yAxisId="left"
            type="monotone" 
            dataKey="responseTime" 
            stroke="hsl(var(--primary))" 
            name="Avg Response Time (ms)"
            strokeWidth={2}
          />
          <Line 
            yAxisId="right"
            type="monotone" 
            dataKey="cacheHitRate" 
            stroke="hsl(var(--chart-2))" 
            name="Cache Hit Rate (%)"
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
};
