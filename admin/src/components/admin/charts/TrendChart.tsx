'use client';

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { TrendPoint } from '@/types';

export interface TrendChartProps {
  data: TrendPoint[];
  height?: number;
  /** Format a raw value (minor units) for tooltip/axis. */
  format: (value: number) => string;
  /** Show every Nth x-axis tick to avoid crowding on mobile. */
  tickEvery?: number;
}

export function TrendChart({ data, height = 260, format, tickEvery = 4 }: TrendChartProps) {
  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer>
        <AreaChart data={data} margin={{ top: 10, right: 12, bottom: 0, left: 4 }}>
          <defs>
            <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#E86A9A" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#E86A9A" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="#F6C9D6" strokeDasharray="3 6" />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: '#9A8791' }}
            tickLine={false}
            axisLine={false}
            interval={tickEvery - 1}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#9A8791' }}
            tickLine={false}
            axisLine={false}
            width={44}
            tickFormatter={(v) => format(Number(v))}
          />
          <Tooltip
            cursor={{ stroke: '#C43C6E', strokeWidth: 1, strokeDasharray: '4 4' }}
            contentStyle={{
              borderRadius: 16,
              border: '1px solid #F6C9D6',
              boxShadow: '0 12px 32px -18px rgba(122,42,82,0.28)',
              fontSize: 12,
            }}
            labelStyle={{ color: '#6E2450', fontWeight: 600 }}
            formatter={(value: number | string) => [format(Number(value)), 'Value']}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#C43C6E"
            strokeWidth={2.5}
            fill="url(#trendFill)"
            dot={{ r: 3, fill: '#C43C6E', strokeWidth: 0 }}
            activeDot={{ r: 5 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
