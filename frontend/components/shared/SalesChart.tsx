import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface SalesData {
  name: string;
  sales: number;
}

interface SalesChartProps {
  data: SalesData[];
  title?: string;
}

export function SalesChart({ data, title = "Monthly Sales Overview" }: SalesChartProps) {
  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="pl-2">
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="sales" fill="#8B0000" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}