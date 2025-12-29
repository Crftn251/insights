'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { format, parseISO } from 'date-fns';

interface DataPoint {
  date: string;
  value: number;
}

interface MetricsChartProps {
  data: DataPoint[];
  metric: string;
}

export function MetricsChart({ data, metric }: MetricsChartProps) {
  const chartData = data.map((d) => ({
    date: format(parseISO(d.date), 'dd.MM'),
    value: d.value,
  }));

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4 capitalize">
        {metric.replace('_', ' ')}
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#3b82f6"
            strokeWidth={2}
            name={metric}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

