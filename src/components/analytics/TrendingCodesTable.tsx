import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { TrendingUp } from 'lucide-react';

interface TrendingCode {
  cpt_code: string;
  usage_count: number;
  avg_charged: number;
  description: string | null;
  medicare_rate: number | null;
}

interface TrendingCodesTableProps {
  data: TrendingCode[];
}

export const TrendingCodesTable = ({ data }: TrendingCodesTableProps) => {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
        <TrendingUp className="h-5 w-5 text-primary" />
        Top 10 Trending CPT Codes (Last 7 Days)
      </h3>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Rank</TableHead>
              <TableHead>CPT Code</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Usage</TableHead>
              <TableHead className="text-right">Avg Charged</TableHead>
              <TableHead className="text-right">Medicare Rate</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.slice(0, 10).map((code, index) => (
              <TableRow key={code.cpt_code}>
                <TableCell>
                  <Badge variant={index < 3 ? "default" : "outline"}>
                    #{index + 1}
                  </Badge>
                </TableCell>
                <TableCell className="font-mono font-semibold">
                  {code.cpt_code}
                </TableCell>
                <TableCell className="max-w-xs truncate">
                  {code.description || 'No description'}
                </TableCell>
                <TableCell className="text-right font-semibold">
                  {code.usage_count}
                </TableCell>
                <TableCell className="text-right">
                  ${Number(code.avg_charged || 0).toFixed(2)}
                </TableCell>
                <TableCell className="text-right">
                  {code.medicare_rate ? `$${Number(code.medicare_rate).toFixed(2)}` : 'N/A'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
};
