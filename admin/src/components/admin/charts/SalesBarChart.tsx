'use client';

import {
  Bar,
  BarChart,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

export interface BarDatum {
  label: string;
  value: number;
}

const BAR_COLORS = ['#C43C6E', '#E86A9A', '#F0A6BD', '#C9A6DE', '#B79BD6'];

export interface SalesBarChartProps {
  data: BarDatum[];
  height?: number;
  format?: (value: number) => string;
}

export function SalesBarChart({ data, height = 260, format }: SalesBarChartProps) {
  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 24, right: 8, bottom: 0, left: 4 }}>
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: '#7A6A72' }}
            tickLine={false}
            axisLine={false}
            interval={0}
          />
          <YAxis hide />
          <Tooltip
            cursor={{ fill: '#FDEDF2' }}
            contentStyle={{
              borderRadius: 16,
              border: '1px solid #F6C9D6',
              fontSize: 12,
            }}
            formatter={(value: number | string) => [
              format ? format(Number(value)) : String(value),
              'Value',
            ]}
          />
          <Bar dataKey="value" radius={[10, 10, 4, 4]} maxBarSize={56}>
            <LabelList
              dataKey="value"
              position="top"
              style={{ fill: '#6E2450', fontSize: 12, fontWeight: 600 }}
              formatter={(value: number) => (format ? format(value) : String(value))}
            />
            {data.map((_, i) => (
              <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
