'use client';

import { forwardRef, useEffect, useImperativeHandle, useState, useCallback, useRef } from 'react';
import { authenticatedFetch } from '@/lib/fetch-auth';
import clsx from 'clsx';

interface MentionItem {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface MentionListProps {
  items: MentionItem[];
  command: (item: MentionItem) => void;
}

export const MentionList = forwardRef<any, MentionListProps>(
  ({ items, command }, ref) => {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);

    const selectItem = useCallback((index: number) => {
      const item = items[index];
      if (item) {
        command(item);
      }
    }, [items, command]);

    useImperativeHandle(ref, () => ({
      onKeyDown: ({ event }: { event: KeyboardEvent }) => {
        if (event.key === 'ArrowUp') {
          setSelectedIndex((selectedIndex + items.length - 1) % items.length);
          return true;
        }

        if (event.key === 'ArrowDown') {
          setSelectedIndex((selectedIndex + 1) % items.length);
          return true;
        }

        if (event.key === 'Enter') {
          selectItem(selectedIndex);
          return true;
        }

        return false;
      },
    }), [selectedIndex, items.length, selectItem]);

    useEffect(() => setSelectedIndex(0), [items]);

    // Scroll selected item into view
    useEffect(() => {
      const container = containerRef.current;
      if (!container) return;
      
      const selectedElement = container.querySelector(`[data-index="${selectedIndex}"]`);
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest' });
      }
    }, [selectedIndex]);

    if (items.length === 0) {
      return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-3">
          <p className="text-sm text-gray-500">No users found</p>
        </div>
      );
    }

    return (
      <div
        ref={containerRef}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden min-w-[240px] max-h-[300px] overflow-y-auto"
      >
        <div className="p-1">
          {items.map((item, index) => (
            <button
              key={item.id}
              data-index={index}
              onClick={() => selectItem(index)}
              className={clsx(
                "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors",
                selectedIndex === index
                  ? "bg-blue-50 dark:bg-blue-900/30"
                  : "hover:bg-gray-50 dark:hover:bg-gray-700"
              )}
            >
              {item.avatar ? (
                <img 
                  src={item.avatar} 
                  alt={item.name} 
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                  {item.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {item.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {item.email}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }
);

MentionList.displayName = 'MentionList';

// Helper function to fetch admin users for mentions
export async function fetchMentionableUsers(query: string): Promise<MentionItem[]> {
  try {
    const response = await authenticatedFetch(`/api/admin/users?role=admin&search=${encodeURIComponent(query)}`);
    if (!response.ok) return [];
    
    const data = await response.json();
    return (data.users || []).map((user: any) => ({
      id: user.uid || user.id,
      name: user.displayName || user.email?.split('@')[0] || 'Unknown',
      email: user.email || '',
      avatar: user.photoURL || null,
    }));
  } catch (error) {
    console.error('Error fetching mentionable users:', error);
    return [];
  }
}
