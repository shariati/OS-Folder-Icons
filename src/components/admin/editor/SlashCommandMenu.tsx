'use client';

import { forwardRef, useEffect, useImperativeHandle, useState, useCallback, useRef } from 'react';
import {
  Type,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  CheckSquare,
  Quote,
  Code,
  AtSign,
  Smile,
  Table,
  Minus,
  Image as ImageIcon
} from 'lucide-react';
import clsx from 'clsx';

export interface SlashCommandItem {
  title: string;
  description?: string;
  icon: React.ReactNode;
  command: (editor: any) => void;
  section: 'style' | 'insert' | 'upload';
}

interface SlashCommandMenuProps {
  items: SlashCommandItem[];
  command: (item: SlashCommandItem) => void;
}

export const SlashCommandMenu = forwardRef<any, SlashCommandMenuProps>(
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
      return null;
    }

    // Group items by section
    const sections = {
      style: items.filter(item => item.section === 'style'),
      insert: items.filter(item => item.section === 'insert'),
      upload: items.filter(item => item.section === 'upload'),
    };

    let globalIndex = -1;

    return (
      <div
        ref={containerRef}
        className="bg-gray-900 rounded-xl shadow-2xl border border-gray-700 overflow-hidden min-w-[220px] max-h-[400px] overflow-y-auto"
      >
        {sections.style.length > 0 && (
          <div className="p-2">
            <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Style
            </div>
            {sections.style.map((item) => {
              globalIndex++;
              const index = globalIndex;
              return (
                <button
                  key={`style-${item.title}`}
                  data-index={index}
                  onClick={() => selectItem(index)}
                  className={clsx(
                    "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors",
                    selectedIndex === index
                      ? "bg-gray-700 text-white"
                      : "text-gray-300 hover:bg-gray-800"
                  )}
                >
                  <span className="text-gray-400">{item.icon}</span>
                  <span className="font-medium text-sm">{item.title}</span>
                </button>
              );
            })}
          </div>
        )}

        {sections.insert.length > 0 && (
          <div className="p-2 border-t border-gray-700">
            <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Insert
            </div>
            {sections.insert.map((item) => {
              globalIndex++;
              const index = globalIndex;
              return (
                <button
                  key={`insert-${item.title}`}
                  data-index={index}
                  onClick={() => selectItem(index)}
                  className={clsx(
                    "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors",
                    selectedIndex === index
                      ? "bg-gray-700 text-white"
                      : "text-gray-300 hover:bg-gray-800"
                  )}
                >
                  <span className="text-gray-400">{item.icon}</span>
                  <span className="font-medium text-sm">{item.title}</span>
                </button>
              );
            })}
          </div>
        )}

        {sections.upload.length > 0 && (
          <div className="p-2 border-t border-gray-700">
            <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Upload
            </div>
            {sections.upload.map((item) => {
              globalIndex++;
              const index = globalIndex;
              return (
                <button
                  key={`upload-${item.title}`}
                  data-index={index}
                  onClick={() => selectItem(index)}
                  className={clsx(
                    "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors",
                    selectedIndex === index
                      ? "bg-gray-700 text-white"
                      : "text-gray-300 hover:bg-gray-800"
                  )}
                >
                  <span className="text-gray-400">{item.icon}</span>
                  <span className="font-medium text-sm">{item.title}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  }
);

SlashCommandMenu.displayName = 'SlashCommandMenu';

// Helper to create default slash command items
export function getDefaultSlashCommands(
  editor: any,
  onImageUpload: () => void
): SlashCommandItem[] {
  return [
    // Style Section
    {
      title: 'Text',
      icon: <Type size={18} />,
      section: 'style',
      command: () => editor.chain().focus().setParagraph().run(),
    },
    {
      title: 'Heading 1',
      icon: <Heading1 size={18} />,
      section: 'style',
      command: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
    },
    {
      title: 'Heading 2',
      icon: <Heading2 size={18} />,
      section: 'style',
      command: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
    },
    {
      title: 'Heading 3',
      icon: <Heading3 size={18} />,
      section: 'style',
      command: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
    },
    {
      title: 'Bullet List',
      icon: <List size={18} />,
      section: 'style',
      command: () => editor.chain().focus().toggleBulletList().run(),
    },
    {
      title: 'Numbered List',
      icon: <ListOrdered size={18} />,
      section: 'style',
      command: () => editor.chain().focus().toggleOrderedList().run(),
    },
    {
      title: 'To-do list',
      icon: <CheckSquare size={18} />,
      section: 'style',
      command: () => editor.chain().focus().toggleTaskList().run(),
    },
    {
      title: 'Blockquote',
      icon: <Quote size={18} />,
      section: 'style',
      command: () => editor.chain().focus().toggleBlockquote().run(),
    },
    {
      title: 'Code Block',
      icon: <Code size={18} />,
      section: 'style',
      command: () => editor.chain().focus().toggleCodeBlock().run(),
    },
    // Insert Section
    {
      title: 'Mention',
      icon: <AtSign size={18} />,
      section: 'insert',
      command: () => {
        // Insert @ to trigger mention
        editor.chain().focus().insertContent('@').run();
      },
    },
    {
      title: 'Emoji',
      icon: <Smile size={18} />,
      section: 'insert',
      command: () => {
        // Insert : to trigger emoji
        editor.chain().focus().insertContent(':').run();
      },
    },
    {
      title: 'Table',
      icon: <Table size={18} />,
      section: 'insert',
      command: () => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(),
    },
    {
      title: 'Separator',
      icon: <Minus size={18} />,
      section: 'insert',
      command: () => editor.chain().focus().setHorizontalRule().run(),
    },
    // Upload Section
    {
      title: 'Image',
      icon: <ImageIcon size={18} />,
      section: 'upload',
      command: () => onImageUpload(),
    },
  ];
}
