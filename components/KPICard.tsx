'use client';

import { TrendingUp, TrendingDown } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: number | string;
  previous?: number;
  delta?: number;
  deltaPercent?: number;
  format?: (value: number) => string;
}

export function KPICard({
  title,
  value,
  previous,
  delta = 0,
  deltaPercent = 0,
  format = (v) => v.toLocaleString('de-DE'),
}: KPICardProps) {
  const isPositive = delta >= 0;
  const hasDelta = previous !== undefined;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-sm font-medium text-gray-500 mb-2">{title}</h3>
      <div className="flex items-baseline justify-between">
        <p className="text-3xl font-bold text-gray-900">
          {typeof value === 'number' ? format(value) : value}
        </p>
        {hasDelta && (
          <div
            className={`flex items-center gap-1 text-sm ${
              isPositive ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {isPositive ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}
            <span>
              {isPositive ? '+' : ''}
              {deltaPercent.toFixed(1)}%
            </span>
          </div>
        )}
      </div>
      {hasDelta && (
        <p className="text-xs text-gray-500 mt-2">
          {isPositive ? '+' : ''}
          {format(delta)} vs. vorheriger Zeitraum
        </p>
      )}
    </div>
  );
}

