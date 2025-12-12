import React, { useState, useEffect, useRef, useMemo } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ChevronDown, Check } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { NeumorphInput } from './NeumorphInput';

export interface DropdownItem {
  label: string;
  value: string;
}

export interface NeumorphDropdownListProps {
  items: DropdownItem[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  icon?: React.ReactNode;
  error?: string;
  hint?: string;
  disabled?: boolean;
  className?: string;
}

export function NeumorphDropdownList({
  items,
  value,
  onChange,
  label,
  placeholder = 'Select an option',
  icon,
  error,
  hint,
  disabled,
  className,
}: NeumorphDropdownListProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync query with selected value
  useEffect(() => {
    const selectedItem = items.find((item) => item.value === value);
    if (selectedItem) {
      setQuery(selectedItem.label);
    } else {
      setQuery('');
    }
  }, [value, items]);

  // Filter items based on query
  const filteredItems = useMemo(() => {
    if (query === '') return items;
    const selectedItem = items.find((item) => item.value === value);
    if (selectedItem && query === selectedItem.label) {
      return items;
    }

    const lowerQuery = query.toLowerCase();
    return items.filter((item) => item.label.toLowerCase().includes(lowerQuery));
  }, [items, query, value]);

  // Handle outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        // Reset query to selected value if invalid
        const selectedItem = items.find((item) => item.value === value);
        if (selectedItem) {
          setQuery(selectedItem.label);
        } else {
          setQuery('');
        }
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [value, items]);

  const handleSelect = (itemValue: string) => {
    onChange(itemValue);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={twMerge('relative', className)}>
      <NeumorphInput
        label={label}
        placeholder={placeholder}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          if (!isOpen) setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        icon={icon}
        iconPosition="left"
        error={error}
        hint={hint}
        disabled={disabled}
        autoComplete="off"
        className="pr-10"
      />

      {/* Chevron indicator always visible */}
      <div className="pointer-events-none absolute bottom-4 right-4 ml-2 h-4 w-4 text-gray-400">
        <ChevronDown size={16} />
      </div>

      <AnimatePresence>
        {isOpen && !disabled && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-0 z-50 mt-2 w-full overflow-hidden rounded-xl bg-white p-1 shadow-xl ring-1 ring-black/5 dark:bg-gray-800 dark:ring-white/10"
          >
            <ul className="custom-scrollbar max-h-60 overflow-y-auto">
              {filteredItems.length === 0 ? (
                <li className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                  No results found.
                </li>
              ) : (
                filteredItems.map((item) => (
                  <li key={item.value}>
                    <button
                      type="button"
                      onClick={() => handleSelect(item.value)}
                      className={clsx(
                        'flex w-full items-center justify-between rounded-lg px-4 py-2.5 text-sm transition-colors',
                        value === item.value
                          ? 'bg-blue-50 font-medium text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                          : 'text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700'
                      )}
                    >
                      <span className="truncate">{item.label}</span>
                      {value === item.value && <Check size={16} />}
                    </button>
                  </li>
                ))
              )}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
