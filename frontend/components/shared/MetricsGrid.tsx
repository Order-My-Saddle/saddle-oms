import { DollarSign, Users, Package, TrendingUp } from 'lucide-react';
import { MetricCard } from './MetricCard';

interface Metric {
  title: string;
  value: string | number;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
}

interface MetricsGridProps {
  metrics: {
    revenue: Metric;
    customers: Metric;
    sales: Metric;
    activeUsers: Metric;
  };
}

export function MetricsGrid({ metrics }: MetricsGridProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <MetricCard
        title={metrics.revenue.title}
        value={metrics.revenue.value}
        icon={DollarSign}
        trend={metrics.revenue.trend}
      />
      <MetricCard
        title={metrics.customers.title}
        value={metrics.customers.value}
        icon={Users}
        trend={metrics.customers.trend}
      />
      <MetricCard
        title={metrics.sales.title}
        value={metrics.sales.value}
        icon={Package}
        trend={metrics.sales.trend}
      />
      <MetricCard
        title={metrics.activeUsers.title}
        value={metrics.activeUsers.value}
        icon={TrendingUp}
        trend={metrics.activeUsers.trend}
      />
    </div>
  );
}