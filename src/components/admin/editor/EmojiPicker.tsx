'use client';

import { forwardRef, useEffect, useImperativeHandle, useState, useCallback, useRef } from 'react';
import clsx from 'clsx';

// Common emoji list for quick access
const COMMON_EMOJIS = [
  { emoji: '😀', name: 'grinning face' },
  { emoji: '😂', name: 'face with tears of joy' },
  { emoji: '😊', name: 'smiling face with smiling eyes' },
  { emoji: '😍', name: 'smiling face with heart-eyes' },
  { emoji: '🥰', name: 'smiling face with hearts' },
  { emoji: '😎', name: 'smiling face with sunglasses' },
  { emoji: '🤔', name: 'thinking face' },
  { emoji: '😅', name: 'grinning face with sweat' },
  { emoji: '🙌', name: 'raising hands' },
  { emoji: '👍', name: 'thumbs up' },
  { emoji: '👏', name: 'clapping hands' },
  { emoji: '🎉', name: 'party popper' },
  { emoji: '🔥', name: 'fire' },
  { emoji: '💯', name: 'hundred points' },
  { emoji: '✨', name: 'sparkles' },
  { emoji: '❤️', name: 'red heart' },
  { emoji: '💪', name: 'flexed biceps' },
  { emoji: '🚀', name: 'rocket' },
  { emoji: '⭐', name: 'star' },
  { emoji: '💡', name: 'light bulb' },
  { emoji: '👀', name: 'eyes' },
  { emoji: '🤝', name: 'handshake' },
  { emoji: '✅', name: 'check mark' },
  { emoji: '❌', name: 'cross mark' },
  { emoji: '⚡', name: 'high voltage' },
  { emoji: '📌', name: 'pushpin' },
  { emoji: '📝', name: 'memo' },
  { emoji: '💬', name: 'speech balloon' },
  { emoji: '🎯', name: 'bullseye' },
  { emoji: '💻', name: 'laptop' },
  { emoji: '📱', name: 'mobile phone' },
  { emoji: '🌟', name: 'glowing star' },
  { emoji: '🏆', name: 'trophy' },
  { emoji: '🎨', name: 'artist palette' },
  { emoji: '📊', name: 'bar chart' },
  { emoji: '🔗', name: 'link' },
  { emoji: '📷', name: 'camera' },
  { emoji: '🎵', name: 'musical note' },
  { emoji: '☕', name: 'hot beverage' },
  { emoji: '🍕', name: 'pizza' },
];

interface EmojiItem {
  emoji: string;
  name: string;
}

interface EmojiPickerProps {
  items: EmojiItem[];
  command: (item: EmojiItem) => void;
}

export const EmojiPicker = forwardRef<any, EmojiPickerProps>(({ items, command }, ref) => {
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

        if (event.key === 'ArrowLeft') {
          setSelectedIndex((selectedIndex + items.length - 1) % items.length);
          return true;
        }

        if (event.key === 'ArrowRight') {
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

  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-lg dark:border-gray-700 dark:bg-gray-800">
        <p className="text-sm text-gray-500">No emojis found</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="max-w-[300px] overflow-hidden rounded-lg border border-gray-200 bg-white p-2 shadow-lg dark:border-gray-700 dark:bg-gray-800"
    >
      <div className="grid grid-cols-8 gap-1">
        {items.map((item, index) => (
          <button
            key={`${item.emoji}-${index}`}
            data-index={index}
            onClick={() => selectItem(index)}
            title={item.name}
            className={clsx(
              'flex h-8 w-8 items-center justify-center rounded-lg text-xl transition-colors',
              selectedIndex === index
                ? 'bg-blue-100 dark:bg-blue-900/30'
                : 'hover:bg-gray-100 dark:hover:bg-gray-700'
            )}
          >
            {item.emoji}
          </button>
        ))}
      </div>
    </div>
  );
});

EmojiPicker.displayName = 'EmojiPicker';

// Helper function to filter emojis based on query
export function filterEmojis(query: string): EmojiItem[] {
  if (!query) {
    return COMMON_EMOJIS.slice(0, 40);
  }

  const lowerQuery = query.toLowerCase();
  return COMMON_EMOJIS.filter((e) => e.name.toLowerCase().includes(lowerQuery)).slice(0, 40);
}

export { COMMON_EMOJIS };
