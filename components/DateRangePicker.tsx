'use client';

import { useState } from 'react';
import { format, subDays } from 'date-fns';

type DateRange = {
  from: string;
  to: string;
};

interface DateRangePickerProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
}

const presets = [
  { label: '7 Tage', days: 7 },
  { label: '28 Tage', days: 28 },
  { label: '90 Tage', days: 90 },
];

export function DateRangePicker({ value, onChange }: DateRangePickerProps) {
  const [showCustom, setShowCustom] = useState(false);

  const applyPreset = (days: number) => {
    const to = format(new Date(), 'yyyy-MM-dd');
    const from = format(subDays(new Date(), days - 1), 'yyyy-MM-dd');
    onChange({ from, to });
    setShowCustom(false);
  };

  return (
    <div className="flex items-center gap-2">
      {presets.map((preset) => (
        <button
          key={preset.days}
          onClick={() => applyPreset(preset.days)}
          className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
        >
          {preset.label}
        </button>
      ))}
      <button
        onClick={() => setShowCustom(!showCustom)}
        className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
      >
        Custom
      </button>
      {showCustom && (
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={value.from}
            onChange={(e) => onChange({ ...value, from: e.target.value })}
            className="px-2 py-1 text-sm border border-gray-300 rounded"
          />
          <span>bis</span>
          <input
            type="date"
            value={value.to}
            onChange={(e) => onChange({ ...value, to: e.target.value })}
            className="px-2 py-1 text-sm border border-gray-300 rounded"
          />
        </div>
      )}
    </div>
  );
}

