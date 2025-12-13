'use client';

import clsx from 'clsx';
import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';

import { authenticatedFetch } from '@/lib/fetch-auth';

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

export const MentionList = forwardRef<any, MentionListProps>(({ items, command }, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectItem = useCallback(
    (index: number) => {
      const item = items[index];
      if (item) {
        command(item);
      }
    },
    [items, command]
  );

  useImperativeHandle(
    ref,
    () => ({
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
    }),
    [selectedIndex, items.length, selectItem]
  );

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
      <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-lg dark:border-gray-700 dark:bg-gray-800">
        <p className="text-sm text-gray-500">No users found</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="max-h-[300px] min-w-[240px] overflow-hidden overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800"
    >
      <div className="p-1">
        {items.map((item, index) => (
          <button
            key={item.id}
            data-index={index}
            onClick={() => selectItem(index)}
            className={clsx(
              'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors',
              selectedIndex === index
                ? 'bg-blue-50 dark:bg-blue-900/30'
                : 'hover:bg-gray-50 dark:hover:bg-gray-700'
            )}
          >
            {item.avatar ? (
              <img
                src={item.avatar}
                alt={item.name}
                className="h-8 w-8 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-sm font-bold text-white">
                {item.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                {item.name}
              </p>
              <p className="truncate text-xs text-gray-500 dark:text-gray-400">{item.email}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
});

MentionList.displayName = 'MentionList';

// Helper function to fetch admin users for mentions
export async function fetchMentionableUsers(query: string): Promise<MentionItem[]> {
  try {
    const response = await authenticatedFetch(
      `/api/admin/users?role=admin&search=${encodeURIComponent(query)}`
    );
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
