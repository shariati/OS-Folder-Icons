'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import { BubbleMenu, FloatingMenu } from '@tiptap/react/menus';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Youtube from '@tiptap/extension-youtube';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { TaskList } from '@tiptap/extension-task-list';
import { TaskItem } from '@tiptap/extension-task-item';
import HorizontalRule from '@tiptap/extension-horizontal-rule';

import { useCallback, useState, useEffect, useRef } from 'react';
import { 
  Bold, Italic, Strikethrough, Code, List, ListOrdered, 
  Quote, Image as ImageIcon, Youtube as YoutubeIcon, 
  Link as LinkIcon, Heading1, Heading2, Heading3,
  Table as TableIcon, Code2, CheckSquare, Undo, Redo, Minus
} from 'lucide-react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

// Import editor components
import { ImageUploadModal } from './editor/ImageUploadModal';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

interface SlashCommandItem {
  title: string;
  description: string;
  icon: React.ReactNode;
  command: () => void;
}

// Toolbar Button Component
function ToolbarButton({ 
  onClick, 
  isActive = false, 
  disabled = false,
  title,
  children 
}: { 
  onClick: () => void; 
  isActive?: boolean; 
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={clsx(
        "p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
        isActive && "bg-gray-100 dark:bg-gray-700 text-blue-500"
      )}
    >
      {children}
    </button>
  );
}

function ToolbarDivider() {
  return <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1" />;
}

export function RichTextEditor({ value, onChange, placeholder = 'Start writing...', className }: RichTextEditorProps) {
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [slashMenuPosition, setSlashMenuPosition] = useState({ top: 0, left: 0 });
  const [slashQuery, setSlashQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const slashMenuRef = useRef<HTMLDivElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        codeBlock: {
          HTMLAttributes: {
            class: 'bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm overflow-x-auto',
          },
        },
        blockquote: {
          HTMLAttributes: {
            class: 'border-l-4 border-blue-500 pl-4 italic text-gray-600 dark:text-gray-400',
          },
        },
        horizontalRule: false, // We'll use our own
      }),
      HorizontalRule.configure({
        HTMLAttributes: {
          class: 'my-8 border-t-2 border-gray-200 dark:border-gray-700',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'rounded-xl shadow-lg my-4 max-w-full',
        },
        allowBase64: true,
      }),
      Youtube.configure({
        controls: false,
        HTMLAttributes: {
          class: 'aspect-video rounded-xl shadow-lg w-full my-8',
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-500 hover:text-blue-600 underline',
        },
      }),
      Placeholder.configure({
        placeholder,
        emptyEditorClass: 'is-editor-empty before:content-[attr(data-placeholder)] before:text-gray-400 before:float-left before:pointer-events-none before:h-0',
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: 'border-collapse border border-gray-200 dark:border-gray-700 my-4',
        },
      }),
      TableRow,
      TableHeader.configure({
        HTMLAttributes: {
          class: 'bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-3 py-2 font-semibold',
        },
      }),
      TableCell.configure({
        HTMLAttributes: {
          class: 'border border-gray-200 dark:border-gray-700 px-3 py-2',
        },
      }),
      TaskList.configure({
        HTMLAttributes: {
          class: 'pl-0 list-none',
        },
      }),
      TaskItem.configure({
        HTMLAttributes: {
          class: 'flex items-start gap-2',
        },
        nested: true,
      }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class: 'prose prose-lg dark:prose-invert max-w-none focus:outline-none min-h-[300px] p-4',
      },
      handleKeyDown: (view, event) => {
        // Handle slash command
        if (event.key === '/' && !showSlashMenu) {
          const { from } = view.state.selection;
          const coords = view.coordsAtPos(from);
          const editorRect = view.dom.getBoundingClientRect();
          
          setSlashMenuPosition({
            top: coords.bottom - editorRect.top + 8,
            left: coords.left - editorRect.left,
          });
          setShowSlashMenu(true);
          setSlashQuery('');
          setSelectedIndex(0);
          return false;
        }

        // Handle navigation in slash menu
        if (showSlashMenu) {
          if (event.key === 'Escape') {
            setShowSlashMenu(false);
            return true;
          }
          if (event.key === 'ArrowDown') {
            event.preventDefault();
            setSelectedIndex(prev => Math.min(prev + 1, filteredCommands.length - 1));
            return true;
          }
          if (event.key === 'ArrowUp') {
            event.preventDefault();
            setSelectedIndex(prev => Math.max(prev - 1, 0));
            return true;
          }
          if (event.key === 'Enter') {
            event.preventDefault();
            if (filteredCommands[selectedIndex]) {
              executeSlashCommand(filteredCommands[selectedIndex]);
            }
            return true;
          }
          if (event.key === 'Backspace' && slashQuery === '') {
            setShowSlashMenu(false);
            return false;
          }
        }

        return false;
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
      
      // Update slash query
      if (showSlashMenu) {
        const { from } = editor.state.selection;
        const text = editor.state.doc.textBetween(Math.max(0, from - 20), from);
        const slashIndex = text.lastIndexOf('/');
        if (slashIndex !== -1) {
          setSlashQuery(text.slice(slashIndex + 1));
        } else {
          setShowSlashMenu(false);
        }
      }
    },
    immediatelyRender: false,
  });

  const addImage = useCallback((url: string, alt: string) => {
    if (editor) {
      editor.chain().focus().setImage({ 
        src: url, 
        alt,
        title: alt,
      }).run();
    }
  }, [editor]);

  const addYoutube = useCallback(() => {
    const url = window.prompt('Enter YouTube URL');
    if (url && editor) {
      editor.commands.setYoutubeVideo({ src: url });
    }
  }, [editor]);

  const setLink = useCallback(() => {
    if (!editor) return;
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);

    if (url === null) return;

    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  // Slash command items
  const slashCommands: SlashCommandItem[] = editor ? [
    {
      title: 'Heading 1',
      description: 'Large section heading',
      icon: <Heading1 size={18} />,
      command: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
    },
    {
      title: 'Heading 2',
      description: 'Medium section heading',
      icon: <Heading2 size={18} />,
      command: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
    },
    {
      title: 'Heading 3',
      description: 'Small section heading',
      icon: <Heading3 size={18} />,
      command: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
    },
    {
      title: 'Bullet List',
      description: 'Create a simple bullet list',
      icon: <List size={18} />,
      command: () => editor.chain().focus().toggleBulletList().run(),
    },
    {
      title: 'Numbered List',
      description: 'Create a numbered list',
      icon: <ListOrdered size={18} />,
      command: () => editor.chain().focus().toggleOrderedList().run(),
    },
    {
      title: 'Task List',
      description: 'Create a task checklist',
      icon: <CheckSquare size={18} />,
      command: () => editor.chain().focus().toggleTaskList().run(),
    },
    {
      title: 'Quote',
      description: 'Capture a quote',
      icon: <Quote size={18} />,
      command: () => editor.chain().focus().toggleBlockquote().run(),
    },
    {
      title: 'Code Block',
      description: 'Add a code snippet',
      icon: <Code2 size={18} />,
      command: () => editor.chain().focus().toggleCodeBlock().run(),
    },
    {
      title: 'Divider',
      description: 'Add a horizontal divider',
      icon: <Minus size={18} />,
      command: () => editor.chain().focus().setHorizontalRule().run(),
    },
    {
      title: 'Image',
      description: 'Upload or embed an image',
      icon: <ImageIcon size={18} />,
      command: () => setIsImageModalOpen(true),
    },
    {
      title: 'YouTube',
      description: 'Embed a YouTube video',
      icon: <YoutubeIcon size={18} />,
      command: addYoutube,
    },
    {
      title: 'Table',
      description: 'Insert a table',
      icon: <TableIcon size={18} />,
      command: () => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(),
    },
  ] : [];

  const filteredCommands = slashCommands.filter(cmd =>
    cmd.title.toLowerCase().includes(slashQuery.toLowerCase()) ||
    cmd.description.toLowerCase().includes(slashQuery.toLowerCase())
  );

  const executeSlashCommand = useCallback((command: SlashCommandItem) => {
    if (!editor) return;
    
    // Delete the slash and query
    const { from } = editor.state.selection;
    const text = editor.state.doc.textBetween(Math.max(0, from - 20), from);
    const slashIndex = text.lastIndexOf('/');
    if (slashIndex !== -1) {
      const deleteFrom = from - (text.length - slashIndex);
      editor.chain().focus().deleteRange({ from: deleteFrom, to: from }).run();
    }
    
    command.command();
    setShowSlashMenu(false);
  }, [editor]);

  // Close slash menu on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (slashMenuRef.current && !slashMenuRef.current.contains(event.target as Node)) {
        setShowSlashMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!editor) {
    return (
      <div className="animate-pulse bg-gray-100 dark:bg-gray-800 rounded-lg h-64" />
    );
  }

  return (
    <div className={twMerge("relative w-full", className)}>
      {/* Image Upload Modal */}
      <ImageUploadModal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        onImageInsert={addImage}
      />

      {/* Static Toolbar */}
      <div className="sticky top-0 z-10 flex flex-wrap items-center gap-1 p-2 bg-white dark:bg-gray-800 rounded-t-lg border border-gray-200 dark:border-gray-700 shadow-sm">
        {/* Text Formatting */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive('bold')}
          title="Bold (Ctrl+B)"
        >
          <Bold size={18} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive('italic')}
          title="Italic (Ctrl+I)"
        >
          <Italic size={18} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          isActive={editor.isActive('strike')}
          title="Strikethrough"
        >
          <Strikethrough size={18} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCode().run()}
          isActive={editor.isActive('code')}
          title="Inline Code"
        >
          <Code size={18} />
        </ToolbarButton>

        <ToolbarDivider />

        {/* Headings */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          isActive={editor.isActive('heading', { level: 1 })}
          title="Heading 1"
        >
          <Heading1 size={18} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          isActive={editor.isActive('heading', { level: 2 })}
          title="Heading 2"
        >
          <Heading2 size={18} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          isActive={editor.isActive('heading', { level: 3 })}
          title="Heading 3"
        >
          <Heading3 size={18} />
        </ToolbarButton>

        <ToolbarDivider />

        {/* Lists */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive('bulletList')}
          title="Bullet List"
        >
          <List size={18} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive('orderedList')}
          title="Numbered List"
        >
          <ListOrdered size={18} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleTaskList().run()}
          isActive={editor.isActive('taskList')}
          title="Task List"
        >
          <CheckSquare size={18} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editor.isActive('blockquote')}
          title="Quote"
        >
          <Quote size={18} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          isActive={editor.isActive('codeBlock')}
          title="Code Block"
        >
          <Code2 size={18} />
        </ToolbarButton>

        <ToolbarDivider />

        {/* Link & Divider */}
        <ToolbarButton
          onClick={setLink}
          isActive={editor.isActive('link')}
          title="Add Link"
        >
          <LinkIcon size={18} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="Horizontal Divider"
        >
          <Minus size={18} />
        </ToolbarButton>

        <ToolbarDivider />

        {/* Media */}
        <ToolbarButton
          onClick={() => setIsImageModalOpen(true)}
          title="Insert Image"
        >
          <ImageIcon size={18} />
        </ToolbarButton>
        <ToolbarButton
          onClick={addYoutube}
          title="Insert YouTube Video"
        >
          <YoutubeIcon size={18} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
          title="Insert Table"
        >
          <TableIcon size={18} />
        </ToolbarButton>

        <ToolbarDivider />

        {/* Undo/Redo */}
        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Undo (Ctrl+Z)"
        >
          <Undo size={18} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Redo (Ctrl+Shift+Z)"
        >
          <Redo size={18} />
        </ToolbarButton>
      </div>

      {/* Bubble Menu - appears when text is selected */}
      <BubbleMenu 
        editor={editor} 
        tippyOptions={{ duration: 100 }}
        className="flex items-center gap-1 p-1.5 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700"
      >
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={clsx(
            "p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors",
            editor.isActive('bold') && "bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400"
          )}
          title="Bold"
        >
          <Bold size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={clsx(
            "p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors",
            editor.isActive('italic') && "bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400"
          )}
          title="Italic"
        >
          <Italic size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={clsx(
            "p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors",
            editor.isActive('strike') && "bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400"
          )}
          title="Strikethrough"
        >
          <Strikethrough size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleCode().run()}
          className={clsx(
            "p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors",
            editor.isActive('code') && "bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400"
          )}
          title="Code"
        >
          <Code size={16} />
        </button>
        <div className="w-px h-5 bg-gray-200 dark:bg-gray-600 mx-0.5" />
        <button
          onClick={setLink}
          className={clsx(
            "p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors",
            editor.isActive('link') && "bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400"
          )}
          title="Link"
        >
          <LinkIcon size={16} />
        </button>
      </BubbleMenu>

      {/* Floating Menu - appears on empty lines */}
      <FloatingMenu 
        editor={editor} 
        tippyOptions={{ duration: 100, placement: 'left-start' }}
        className="flex items-center gap-1 p-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700"
      >
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          title="Heading 1"
        >
          <Heading1 size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          title="Heading 2"
        >
          <Heading2 size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          title="Bullet List"
        >
          <List size={16} />
        </button>
        <button
          onClick={() => setIsImageModalOpen(true)}
          className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          title="Image"
        >
          <ImageIcon size={16} />
        </button>
      </FloatingMenu>

      {/* Editor Content */}
      <div className="relative border border-t-0 border-gray-200 dark:border-gray-700 rounded-b-lg bg-white dark:bg-gray-900">
        <EditorContent editor={editor} />

        {/* Slash Command Menu */}
        {showSlashMenu && filteredCommands.length > 0 && (
          <div
            ref={slashMenuRef}
            className="absolute z-50 w-72 max-h-80 overflow-y-auto bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700"
            style={{ top: slashMenuPosition.top, left: slashMenuPosition.left }}
          >
            <div className="p-2">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide px-2 py-1">
                Commands
              </p>
              {filteredCommands.map((command, index) => (
                <button
                  key={command.title}
                  onClick={() => executeSlashCommand(command)}
                  className={clsx(
                    "w-full flex items-center gap-3 px-2 py-2 rounded-lg text-left transition-colors",
                    index === selectedIndex
                      ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                      : "hover:bg-gray-100 dark:hover:bg-gray-700"
                  )}
                >
                  <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded bg-gray-100 dark:bg-gray-700">
                    {command.icon}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{command.title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{command.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Hint */}
      <p className="mt-2 text-xs text-gray-400">
        Type <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-gray-600 dark:text-gray-300">/</kbd> for commands
      </p>
    </div>
  );
}
