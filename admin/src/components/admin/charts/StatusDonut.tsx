'use client';

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import type { StatusSlice } from '@/types';

export const STATUS_TONE_COLORS: Record<StatusSlice['tone'], string> = {
  success: '#3F9D6B',
  info: '#4C6FBF',
  lavender: '#C9A6DE',
  blush: '#F0A6BD',
  warn: '#E7972E',
  muted: '#C9B7BF',
};

export interface StatusDonutProps {
  slices: StatusSlice[];
  centerValue: string;
  centerLabel: string;
  size?: number;
}

export function StatusDonut({ slices, centerValue, centerLabel, size = 200 }: StatusDonutProps) {
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={slices}
            dataKey="count"
            nameKey="label"
            cx="50%"
            cy="50%"
            innerRadius="66%"
            outerRadius="100%"
            paddingAngle={2}
            stroke="none"
          >
            {slices.map((s) => (
              <Cell key={s.key} fill={STATUS_TONE_COLORS[s.tone]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ borderRadius: 14, border: '1px solid #F6C9D6', fontSize: 12 }}
            formatter={(value: number | string, name) => [`${value} orders`, String(name)]}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-2xl font-semibold text-plum">{centerValue}</span>
        <span className="text-xs text-ink-muted">{centerLabel}</span>
      </div>
    </div>
  );
}
