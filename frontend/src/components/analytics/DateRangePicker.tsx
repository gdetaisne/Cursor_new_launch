/**
 * Composant DateRangePicker pour sélectionner une période
 */

import { useState } from 'react';
import { format, subDays, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { Calendar } from 'lucide-react';
import { Button } from '../ui/Button';

interface DateRange {
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
}

interface DateRangePickerProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
}

export function DateRangePicker({ value, onChange }: DateRangePickerProps) {
  const presets = [
    {
      label: 'Derniers 7 jours',
      getValue: () => ({
        startDate: format(subDays(new Date(), 7), 'yyyy-MM-dd'),
        endDate: format(new Date(), 'yyyy-MM-dd'),
      }),
    },
    {
      label: 'Derniers 30 jours',
      getValue: () => ({
        startDate: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
        endDate: format(new Date(), 'yyyy-MM-dd'),
      }),
    },
    {
      label: 'Derniers 90 jours',
      getValue: () => ({
        startDate: format(subDays(new Date(), 90), 'yyyy-MM-dd'),
        endDate: format(new Date(), 'yyyy-MM-dd'),
      }),
    },
    {
      label: 'Ce mois',
      getValue: () => ({
        startDate: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
        endDate: format(endOfMonth(new Date()), 'yyyy-MM-dd'),
      }),
    },
    {
      label: 'Mois dernier',
      getValue: () => {
        const lastMonth = subMonths(new Date(), 1);
        return {
          startDate: format(startOfMonth(lastMonth), 'yyyy-MM-dd'),
          endDate: format(endOfMonth(lastMonth), 'yyyy-MM-dd'),
        };
      },
    },
  ];

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex items-center gap-2 text-sm text-gray-700">
        <Calendar className="w-4 h-4" />
        <span className="font-medium">Période :</span>
      </div>
      {presets.map((preset) => (
        <Button
          key={preset.label}
          variant="outline"
          size="sm"
          onClick={() => onChange(preset.getValue())}
          className={
            JSON.stringify(value) === JSON.stringify(preset.getValue())
              ? 'bg-blue-50 border-blue-300 text-blue-700'
              : ''
          }
        >
          {preset.label}
        </Button>
      ))}
      <div className="flex items-center gap-2 ml-4">
        <input
          type="date"
          value={value.startDate}
          onChange={(e) => onChange({ ...value, startDate: e.target.value })}
          className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <span className="text-gray-500">→</span>
        <input
          type="date"
          value={value.endDate}
          onChange={(e) => onChange({ ...value, endDate: e.target.value })}
          className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  );
}

