import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

interface StatusData {
  label: string;
  count: number;
}

interface StatusCardsProps {
  urgentCount: number;
  statuses: Record<string, StatusData>;
  selectedStatus: string;
  onStatusSelect: (status: string) => void;
}

export function StatusCards({
  urgentCount,
  statuses,
  selectedStatus,
  onStatusSelect,
}: StatusCardsProps) {
  return (
    <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
      <Card 
        className={`bg-red-50 border-red-100 cursor-pointer transition-colors ${
          selectedStatus === 'Urgent' ? 'ring-2 ring-red-500' : ''
        }`}
        onClick={() => onStatusSelect('Urgent')}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-red-800">Urgent Orders</CardTitle>
          <AlertTriangle className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-800">{urgentCount}</div>
          <p className="text-xs text-red-600">Requires immediate attention</p>
        </CardContent>
      </Card>
      {Object.entries(statuses).map(([key, data]) => (
        <Card 
          key={key}
          className={`cursor-pointer transition-colors ${
            selectedStatus === data.label ? 'ring-2 ring-[#8B0000]' : ''
          }`}
          onClick={() => onStatusSelect(data.label)}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{data.label}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.count}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}