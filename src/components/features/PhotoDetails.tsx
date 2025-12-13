import { Calendar, Globe, Type } from 'lucide-react';
import React, { useMemo } from 'react';

import { NeumorphBox } from '@/components/ui/NeumorphBox';
import { NeumorphDropdownList } from '@/components/ui/NeumorphDropdownList';
import { NeumorphInput } from '@/components/ui/NeumorphInput';
import { COUNTRIES, Country } from '@/data/countries';

export interface PhotoDetailsProps {
  title: string;
  onTitleChange: (value: string) => void;
  month: string;
  onMonthChange: (value: string) => void;
  year: string;
  onYearChange: (value: string) => void;
  selectedCountry: Country;
  onCountryChange: (country: Country) => void;
  months?: string[];
  years?: string[];
}

export function PhotoDetails({
  title,
  onTitleChange,
  month,
  onMonthChange,
  year,
  onYearChange,
  selectedCountry,
  onCountryChange,
  months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ],
  years,
}: PhotoDetailsProps) {
  // Generate default years if not provided
  const defaultYears = useMemo(() => {
    if (years) return years;
    return Array.from({ length: 50 }, (_, i) => (new Date().getFullYear() - 25 + i).toString());
  }, [years]);

  const monthItems = useMemo(() => months.map((m) => ({ label: m, value: m })), [months]);
  const yearItems = useMemo(
    () => defaultYears.map((y) => ({ label: y, value: y })),
    [defaultYears]
  );

  const countryItems = useMemo(() => {
    return COUNTRIES.map((c) => ({
      label: `${c.flag} ${c.name}`,
      value: c.code,
    }));
  }, []);

  const handleCountrySelect = (code: string) => {
    const country = COUNTRIES.find((c) => c.code === code);
    if (country) {
      onCountryChange(country);
    }
  };

  return (
    <NeumorphBox title="Details" subtitle="Add context to your frame">
      <div className="space-y-4">
        {/* Title Input */}
        <NeumorphInput
          label="Title"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="e.g. Tumpak Sewu Waterfall"
          icon={<Type size={18} />}
        />

        {/* Date Selection */}
        <div className="flex gap-4">
          <div className="flex-1">
            <NeumorphDropdownList
              label="Month"
              items={monthItems}
              value={month}
              onChange={onMonthChange}
              icon={<Calendar size={18} />}
            />
          </div>
          <div className="flex-1">
            <NeumorphDropdownList
              label="Year"
              items={yearItems}
              value={year}
              onChange={onYearChange}
            />
          </div>
        </div>

        {/* Country Selection */}
        <NeumorphDropdownList
          label="Country Flag"
          items={countryItems}
          value={selectedCountry.code}
          onChange={handleCountrySelect}
          placeholder="Select a country..."
          icon={<Globe size={18} />}
        />
      </div>
    </NeumorphBox>
  );
}
