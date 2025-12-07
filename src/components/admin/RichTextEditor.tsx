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
  Table as TableIcon, Code2, CheckSquare, Undo, Redo, Minus,
  X, ExternalLink, Play, Volume2, VolumeX, AlignLeft, AlignCenter, AlignRight, Type
} from 'lucide-react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

// Import editor components
import { ImageUploadModal } from './editor/ImageUploadModal';
import { InputModal } from '../ui/InputModal';

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

interface YouTubeOptions {
  url: string;
  width?: number;
  height?: number;
  controls?: boolean;
  autoplay?: boolean;
  muted?: boolean;
  loop?: boolean;
  start?: number;
}

interface LinkOptions {
  url: string;
  text?: string;
  title?: string;
  openInNewTab: boolean;
}

// YouTube Modal Component
function YouTubeModal({ 
  isOpen, 
  onClose, 
  onInsert,
  initialValues
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onInsert: (options: YouTubeOptions) => void;
  initialValues?: {
    url: string;
    start: number;
    controls: boolean;
    autoplay: boolean;
    muted: boolean;
    loop: boolean;
  } | null;
}) {
  const [url, setUrl] = useState('');
  const [controls, setControls] = useState(true);
  const [autoplay, setAutoplay] = useState(false);
  const [muted, setMuted] = useState(false);
  const [loop, setLoop] = useState(false);
  const [startTime, setStartTime] = useState(0);
  const [videoId, setVideoId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && initialValues) {
      setUrl(initialValues.url);
      setControls(initialValues.controls);
      setAutoplay(initialValues.autoplay);
      setMuted(initialValues.muted);
      setLoop(initialValues.loop);
      setStartTime(initialValues.start);
    } else if (isOpen) {
      // Reset for new insert
      setUrl('');
      setControls(true);
      setAutoplay(false);
      setMuted(false);
      setLoop(false);
      setStartTime(0);
      setVideoId(null);
    }
  }, [isOpen, initialValues]);

  // Extract video ID from YouTube URL
  useEffect(() => {
    const extractVideoId = (url: string) => {
      const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
        /^([a-zA-Z0-9_-]{11})$/
      ];
      for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) return match[1];
      }
      return null;
    };
    setVideoId(extractVideoId(url));
  }, [url]);

  const handleInsert = () => {
    if (!videoId) return;
    onInsert({
      url,
      controls,
      autoplay,
      muted,
      loop,
      start: startTime,
    });
    onClose();
  };

  const handleClose = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50" onClick={handleClose}>
      <div 
        className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <YoutubeIcon className="text-red-500" size={20} />
            Insert YouTube Video
          </h3>
          <button onClick={handleClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* URL Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              YouTube URL
            </label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              autoFocus
            />
            {url && !videoId && (
              <p className="mt-2 text-sm text-red-500">Please enter a valid YouTube URL</p>
            )}
          </div>

          {/* Preview */}
          {videoId && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Preview
              </label>
              <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden">
                <iframe
                  src={`https://www.youtube.com/embed/${videoId}?start=${startTime}${autoplay ? '&autoplay=1' : ''}${muted ? '&mute=1' : ''}${loop ? '&loop=1' : ''}${!controls ? '&controls=0' : ''}`}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          )}

          {/* Options */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Player Options
            </label>
            <div className="grid grid-cols-2 gap-4">
              <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={controls}
                  onChange={(e) => setControls(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <div className="flex items-center gap-2">
                  <Play size={16} className="text-gray-500" />
                  <span className="text-sm">Show Controls</span>
                </div>
              </label>
              <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={autoplay}
                  onChange={(e) => setAutoplay(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <div className="flex items-center gap-2">
                  <Play size={16} className="text-gray-500" />
                  <span className="text-sm">Autoplay</span>
                </div>
              </label>
              <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={muted}
                  onChange={(e) => setMuted(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <div className="flex items-center gap-2">
                  {muted ? <VolumeX size={16} className="text-gray-500" /> : <Volume2 size={16} className="text-gray-500" />}
                  <span className="text-sm">Start Muted</span>
                </div>
              </label>
              <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={loop}
                  onChange={(e) => setLoop(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <div className="flex items-center gap-2">
                  <span className="text-sm">Loop Video</span>
                </div>
              </label>
            </div>
          </div>

          {/* Start Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Start Time (seconds)
            </label>
            <input
              type="number"
              min="0"
              value={startTime}
              onChange={(e) => setStartTime(parseInt(e.target.value) || 0)}
              className="w-32 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleInsert}
            disabled={!videoId}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            Insert Video
          </button>
        </div>
      </div>
    </div>
  );
}

// Link Modal Component
function LinkModal({ 
  isOpen, 
  onClose, 
  onInsert,
  initialUrl = '',
  initialText = '',
  initialTitle = '',
  initialTarget = true,
  isEditing = false
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onInsert: (options: LinkOptions) => void;
  initialUrl?: string;
  initialText?: string;
  initialTitle?: string;
  initialTarget?: boolean;
  isEditing?: boolean;
}) {
  const [url, setUrl] = useState(initialUrl);
  const [text, setText] = useState(initialText);
  const [title, setTitle] = useState(initialTitle);
  const [openInNewTab, setOpenInNewTab] = useState(initialTarget);

  useEffect(() => {
    if (isOpen) {
      setUrl(initialUrl);
      setText(initialText);
      setTitle(initialTitle);
      setOpenInNewTab(initialTarget);
    }
  }, [isOpen, initialUrl, initialText, initialTitle, initialTarget]);

  const handleInsert = () => {
    if (!url.trim()) return;
    onInsert({
      url: url.startsWith('http') ? url : `https://${url}`,
      text: text,
      title: title,
      openInNewTab,
    });
    handleClose();
  };

  const handleRemove = () => {
    onInsert({ url: '', openInNewTab: false });
    handleClose();
  };

  const handleClose = () => {
    setUrl('');
    setText('');
    setTitle('');
    setOpenInNewTab(true);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50" onClick={handleClose}>
      <div 
        className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <LinkIcon className="text-blue-500" size={20} />
            {isEditing ? 'Edit Link' : 'Insert Link'}
          </h3>
          <button onClick={handleClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Text Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Link Text
            </label>
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Click here"
              className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </div>

          {/* URL Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              URL
            </label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleInsert();
                }
              }}
            />
          </div>

          {/* Title Input */}
           <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tooltip (Title)
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="More info about this link"
              className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </div>

          {/* Options */}
          <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors">
            <input
              type="checkbox"
              checked={openInNewTab}
              onChange={(e) => setOpenInNewTab(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <div className="flex items-center gap-2">
              <ExternalLink size={16} className="text-gray-500" />
              <span className="text-sm">Open in new tab</span>
            </div>
          </label>

          {/* Preview */}
          {url && (
            <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">Preview:</p>
              <a 
                href={url.startsWith('http') ? url : `https://${url}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:text-blue-600 underline text-sm break-all"
              >
                {url}
              </a>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
          <div>
            {isEditing && (
              <button
                onClick={handleRemove}
                className="px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              >
                Remove Link
              </button>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleInsert}
              disabled={!url.trim()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {isEditing ? 'Update' : 'Insert'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
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
  const [isYouTubeModalOpen, setIsYouTubeModalOpen] = useState(false);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [currentLinkUrl, setCurrentLinkUrl] = useState('');
  const [isEditingLink, setIsEditingLink] = useState(false);
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [slashMenuPosition, setSlashMenuPosition] = useState({ top: 0, left: 0 });
  const [slashQuery, setSlashQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [hideFloatingMenu, setHideFloatingMenu] = useState(false);
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
        horizontalRule: false,
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
        inline: true,
      }),
      Youtube.configure({
        controls: true,
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
        // ESC key hides all menus including FloatingMenu
        if (event.key === 'Escape') {
          if (showSlashMenu) {
            setShowSlashMenu(false);
            return true;
          }
          setHideFloatingMenu(true);
          return true;
        }

        // Any typing resets FloatingMenu visibility
        if (event.key.length === 1 && !event.ctrlKey && !event.metaKey) {
          setHideFloatingMenu(false);
        }

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

        if (showSlashMenu) {
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

  const [editingYoutubeNode, setEditingYoutubeNode] = useState<{
    url: string;
    start: number;
    controls: boolean;
    autoplay: boolean;
    muted: boolean;
    loop: boolean;
  } | null>(null);

  const addImage = useCallback((url: string, alt: string) => {
    if (editor) {
      editor.chain().focus().setImage({ 
        src: url, 
        alt,
        title: alt,
      }).run();
    }
  }, [editor]);

  const addYoutube = useCallback((options: YouTubeOptions) => {
    if (editor) {
      editor.commands.setYoutubeVideo({ 
        src: options.url,
        start: options.start || 0,
        // @ts-ignore
        controls: options.controls,
        autoplay: options.autoplay,
        loop: options.loop,
        mute: options.muted
      });
    }
  }, [editor]);

  const openYoutubeEdit = useCallback(() => {
    if (!editor) return;
    const { selection } = editor.state;
    // @ts-ignore
    const node = selection.node;
    if (node && node.type.name === 'youtube') {
      setEditingYoutubeNode({
        url: node.attrs.src,
        start: node.attrs.start || 0,
        controls: node.attrs.controls !== false, // default true in tiptap
        autoplay: node.attrs.autoplay || false,
        muted: node.attrs.mute || false,
        loop: node.attrs.loop || false,
      });
      setIsYouTubeModalOpen(true);
    }
  }, [editor]);

  const [currentLinkText, setCurrentLinkText] = useState('');
  const [currentLinkTitle, setCurrentLinkTitle] = useState('');
  const [currentLinkTarget, setCurrentLinkTarget] = useState(true);

  // Alt Text Modal State
  const [isAltTextModalOpen, setIsAltTextModalOpen] = useState(false);
  const [currentAltText, setCurrentAltText] = useState('');

  const openLinkModal = useCallback(() => {
    if (!editor) return;
    const attrs = editor.getAttributes('link');
    const previousUrl = attrs.href || '';
    const previousTarget = attrs.target === '_blank';
    const previousTitle = attrs.title || ''; // May need to configure Link extension to support title
    
    // Get selected text
    const { from, to } = editor.state.selection;
    const text = editor.state.doc.textBetween(from, to, ' ');
    
    setCurrentLinkUrl(previousUrl);
    setCurrentLinkText(text);
    setCurrentLinkTitle(previousTitle);
    setCurrentLinkTarget(previousTarget);
    
    setIsEditingLink(!!previousUrl);
    setIsLinkModalOpen(true);
  }, [editor]);

  const handleLinkInsert = useCallback((options: LinkOptions) => {
    if (!editor) return;
    
    if (options.url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    // If text update is supported and provided (e.g. extending range or replacing)
    // For now standard Tiptap link mark just wraps text. 
    // If we want to change text we might need to insert content.
    
    // @ts-ignore
    editor.chain().focus().extendMarkRange('link').setLink({ 
      href: options.url,
      target: options.openInNewTab ? '_blank' : null,
    }).run();
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
      command: () => setIsYouTubeModalOpen(true),
    },
    {
      title: 'Table',
      description: 'Insert a table',
      icon: <TableIcon size={18} />,
      command: () => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(),
    },
    {
      title: 'Link',
      description: 'Add a hyperlink',
      icon: <LinkIcon size={18} />,
      command: () => openLinkModal(),
    },
  ] : [];

  const filteredCommands = slashCommands.filter(cmd =>
    cmd.title.toLowerCase().includes(slashQuery.toLowerCase()) ||
    cmd.description.toLowerCase().includes(slashQuery.toLowerCase())
  );

  const executeSlashCommand = useCallback((command: SlashCommandItem) => {
    if (!editor) return;
    
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
      {/* Modals */}
      <ImageUploadModal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        onImageInsert={addImage}
      />
      <YouTubeModal
        isOpen={isYouTubeModalOpen}
        onClose={() => {
          setIsYouTubeModalOpen(false);
          setEditingYoutubeNode(null);
        }}
        onInsert={addYoutube}
        initialValues={editingYoutubeNode}
      />
      <LinkModal
        isOpen={isLinkModalOpen}
        onClose={() => setIsLinkModalOpen(false)}
        onInsert={handleLinkInsert}
        initialUrl={currentLinkUrl}
        initialText={currentLinkText}
        initialTitle={currentLinkTitle}
        initialTarget={currentLinkTarget}
        isEditing={isEditingLink}
      />
      
      <InputModal
        isOpen={isAltTextModalOpen}
        onClose={() => setIsAltTextModalOpen(false)}
        onSubmit={(value) => {
          if (editor) {
            editor.chain().focus().updateAttributes('image', { alt: value }).run();
          }
        }}
        title="Edit Alt Text"
        label="Alternative Text"
        initialValue={currentAltText}
        placeholder="Describe the image..."
        confirmLabel="Save"
      />
      
      {editor && (
        <BubbleMenu 
          editor={editor} 
          shouldShow={({ editor }) => editor.isActive('image')}
          className="bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden flex flex-col min-w-[300px]"
        >
          {/* Alignment controls */}
          <div className="flex items-center gap-1 p-2 border-b border-gray-100 dark:border-gray-700">
            <button
              onClick={() => editor.chain().focus().updateAttributes('image', { style: 'float: left; margin-right: 1rem;' }).run()}
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-700 dark:text-gray-300"
              title="Align Left"
            >
              <AlignLeft size={16} />
            </button>
            <button
              onClick={() => editor.chain().focus().updateAttributes('image', { style: 'display: block; margin: 0 auto;' }).run()}
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-700 dark:text-gray-300"
              title="Align Center"
            >
              <AlignCenter size={16} />
            </button>
            <button
              onClick={() => editor.chain().focus().updateAttributes('image', { style: 'float: right; margin-left: 1rem;' }).run()}
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-700 dark:text-gray-300"
              title="Align Right"
            >
              <AlignRight size={16} />
            </button>
            <div className="w-px h-4 bg-gray-200 dark:bg-gray-700 mx-1" />
            
            {/* Size controls */}
            <button
              onClick={() => editor.chain().focus().updateAttributes('image', { width: '25%' }).run()}
              className="px-2 py-1 text-xs hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-700 dark:text-gray-300 font-medium"
            >
              S
            </button>
            <button
              onClick={() => editor.chain().focus().updateAttributes('image', { width: '50%' }).run()}
              className="px-2 py-1 text-xs hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-700 dark:text-gray-300 font-medium"
            >
              M
            </button>
            <button
              onClick={() => editor.chain().focus().updateAttributes('image', { width: '75%' }).run()}
              className="px-2 py-1 text-xs hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-700 dark:text-gray-300 font-medium"
            >
              L
            </button>
            <button
              onClick={() => editor.chain().focus().updateAttributes('image', { width: '100%' }).run()}
              className="px-2 py-1 text-xs hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-700 dark:text-gray-300 font-medium"
            >
              Full
            </button>
          </div>

          {/* Alt/Title controls and Swap */}
          <div className="flex items-center gap-1 p-2">
            <button
              onClick={() => setIsImageModalOpen(true)}
              className="flex-1 px-3 py-1.5 text-xs hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-700 dark:text-gray-300 flex items-center justify-center gap-1"
            >
              <ImageIcon size={14} /> Change Image
            </button>
            <button
              onClick={() => {
                setCurrentAltText(editor.getAttributes('image').alt || '');
                setIsAltTextModalOpen(true);
              }}
              className="flex-1 px-3 py-1.5 text-xs hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-700 dark:text-gray-300 flex items-center justify-center gap-1"
            >
              <Type size={14} /> Alt Text
            </button>
          </div>
        </BubbleMenu>
      )}

      {editor && (
        <BubbleMenu 
          editor={editor} 
          shouldShow={({ editor }) => editor.isActive('youtube')}
          className="bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden flex divide-x divide-gray-200 dark:divide-gray-700"
        >
          <button
            onClick={openYoutubeEdit}
            className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors"
          >
            <YoutubeIcon size={16} />
            Edit Settings
          </button>
        </BubbleMenu>
      )}

      {/* Static Toolbar */}
      {/* Static Toolbar */}
      <div className="sticky top-[84px] z-[90] flex flex-wrap items-center gap-1 p-2 bg-white dark:bg-gray-800 rounded-t-lg border border-gray-200 dark:border-gray-700 shadow-sm">
        {(
          [
            { icon: Bold, title: 'Bold (Ctrl+B)', action: () => editor.chain().focus().toggleBold().run(), isActive: editor.isActive('bold') },
            { icon: Italic, title: 'Italic (Ctrl+I)', action: () => editor.chain().focus().toggleItalic().run(), isActive: editor.isActive('italic') },
            { icon: Strikethrough, title: 'Strikethrough', action: () => editor.chain().focus().toggleStrike().run(), isActive: editor.isActive('strike') },
            { icon: Code, title: 'Inline Code', action: () => editor.chain().focus().toggleCode().run(), isActive: editor.isActive('code') },
            { type: 'divider' },
            { icon: Heading1, title: 'Heading 1', action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(), isActive: editor.isActive('heading', { level: 1 }) },
            { icon: Heading2, title: 'Heading 2', action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), isActive: editor.isActive('heading', { level: 2 }) },
            { icon: Heading3, title: 'Heading 3', action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(), isActive: editor.isActive('heading', { level: 3 }) },
            { type: 'divider' },
            { icon: List, title: 'Bullet List', action: () => editor.chain().focus().toggleBulletList().run(), isActive: editor.isActive('bulletList') },
            { icon: ListOrdered, title: 'Numbered List', action: () => editor.chain().focus().toggleOrderedList().run(), isActive: editor.isActive('orderedList') },
            { icon: CheckSquare, title: 'Task List', action: () => editor.chain().focus().toggleTaskList().run(), isActive: editor.isActive('taskList') },
            { icon: Quote, title: 'Quote', action: () => editor.chain().focus().toggleBlockquote().run(), isActive: editor.isActive('blockquote') },
            { icon: Code2, title: 'Code Block', action: () => editor.chain().focus().toggleCodeBlock().run(), isActive: editor.isActive('codeBlock') },
            { type: 'divider' },
            { icon: LinkIcon, title: 'Add Link', action: openLinkModal, isActive: editor.isActive('link') },
            { icon: Minus, title: 'Horizontal Divider', action: () => editor.chain().focus().setHorizontalRule().run() },
            { type: 'divider' },
            { icon: ImageIcon, title: 'Insert Image', action: () => setIsImageModalOpen(true) },
            { icon: YoutubeIcon, title: 'Insert YouTube Video', action: () => setIsYouTubeModalOpen(true) },
            { icon: TableIcon, title: 'Insert Table', action: () => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run() },
            { type: 'divider' },
            { icon: Undo, title: 'Undo (Ctrl+Z)', action: () => editor.chain().focus().undo().run(), disabled: !editor.can().undo() },
            { icon: Redo, title: 'Redo (Ctrl+Shift+Z)', action: () => editor.chain().focus().redo().run(), disabled: !editor.can().redo() },
          ] as const
        ).map((item, index) => {
          if ('type' in item && item.type === 'divider') {
            return <ToolbarDivider key={index} />;
          }
          // Type guard or cast for button items
          const buttonItem = item as { icon: React.ElementType, title: string, action: () => void, isActive?: boolean, disabled?: boolean };
          const Icon = buttonItem.icon;
          
          return (
            <ToolbarButton
              key={index}
              onClick={buttonItem.action}
              isActive={buttonItem.isActive}
              disabled={buttonItem.disabled}
              title={buttonItem.title}
            >
              <Icon size={18} />
            </ToolbarButton>
          );
        })}
      </div>

      {/* Bubble Menu */}
      {/* Bubble Menu - Text Formatting (Hidden for Images/YouTube/Links) */}
      {editor && (
        <BubbleMenu 
          editor={editor} 
          pluginKey="text-menu"
          shouldShow={({ editor, view, state, from, to }) => {
            // Default check from Tiptap (has selection and not empty)
            const { doc, selection } = state;
            const { empty } = selection;
            const isEmptyTextBlock = doc.textBetween(from, to).length === 0 && !editor.isActive('image') && !editor.isActive('youtube');
            const hasEditorFocus = view.hasFocus();

            if (!hasEditorFocus || empty || isEmptyTextBlock || editor.isActive('image') || editor.isActive('youtube') || editor.isActive('link')) {
              return false;
            }
            return true;
          }}
          className="flex items-center gap-1 p-1.5 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50"
        >
          <button onClick={() => editor.chain().focus().toggleBold().run()} className={clsx("p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors", editor.isActive('bold') && "bg-blue-100 dark:bg-blue-900/50 text-blue-600")} title="Bold">
            <Bold size={16} />
          </button>
          <button onClick={() => editor.chain().focus().toggleItalic().run()} className={clsx("p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors", editor.isActive('italic') && "bg-blue-100 dark:bg-blue-900/50 text-blue-600")} title="Italic">
            <Italic size={16} />
          </button>
          <button onClick={() => editor.chain().focus().toggleStrike().run()} className={clsx("p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors", editor.isActive('strike') && "bg-blue-100 dark:bg-blue-900/50 text-blue-600")} title="Strikethrough">
            <Strikethrough size={16} />
          </button>
          <button onClick={() => editor.chain().focus().toggleCode().run()} className={clsx("p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors", editor.isActive('code') && "bg-blue-100 dark:bg-blue-900/50 text-blue-600")} title="Code">
            <Code size={16} />
          </button>
        </BubbleMenu>
      )}

      {/* Image Bubble Menu */}
      {editor && (
        <BubbleMenu 
          editor={editor} 
          pluginKey="image-menu"
          shouldShow={({ editor }) => editor.isActive('image')}
          className="bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden flex flex-col min-w-[300px] z-50"
        >
          {/* Alignment controls */}
          <div className="flex items-center gap-1 p-2 border-b border-gray-100 dark:border-gray-700">
            <button
              onClick={() => editor.chain().focus().updateAttributes('image', { style: 'float: left; margin-right: 1rem;' }).run()}
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-700 dark:text-gray-300"
              title="Align Left"
            >
              <AlignLeft size={16} />
            </button>
            <button
              onClick={() => editor.chain().focus().updateAttributes('image', { style: 'display: block; margin: 0 auto;' }).run()}
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-700 dark:text-gray-300"
              title="Align Center"
            >
              <AlignCenter size={16} />
            </button>
            <button
              onClick={() => editor.chain().focus().updateAttributes('image', { style: 'float: right; margin-left: 1rem;' }).run()}
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-700 dark:text-gray-300"
              title="Align Right"
            >
              <AlignRight size={16} />
            </button>
            <div className="w-px h-4 bg-gray-200 dark:bg-gray-700 mx-1" />
            
            {/* Size controls */}
            <button
              onClick={() => editor.chain().focus().updateAttributes('image', { width: '25%' }).run()}
              className="px-2 py-1 text-xs hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-700 dark:text-gray-300 font-medium"
            >
              S
            </button>
            <button
              onClick={() => editor.chain().focus().updateAttributes('image', { width: '50%' }).run()}
              className="px-2 py-1 text-xs hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-700 dark:text-gray-300 font-medium"
            >
              M
            </button>
            <button
              onClick={() => editor.chain().focus().updateAttributes('image', { width: '75%' }).run()}
              className="px-2 py-1 text-xs hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-700 dark:text-gray-300 font-medium"
            >
              L
            </button>
            <button
              onClick={() => editor.chain().focus().updateAttributes('image', { width: '100%' }).run()}
              className="px-2 py-1 text-xs hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-700 dark:text-gray-300 font-medium"
            >
              Full
            </button>
          </div>

          {/* Alt/Title controls and Swap */}
          <div className="flex items-center gap-1 p-2">
            <button
              onClick={() => setIsImageModalOpen(true)}
              className="flex-1 px-3 py-1.5 text-xs hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-700 dark:text-gray-300 flex items-center justify-center gap-1"
            >
              <ImageIcon size={14} /> Change Image
            </button>
            <button
              onClick={() => {
                const alt = window.prompt('Enter alt text:', editor.getAttributes('image').alt);
                if (alt !== null) editor.chain().focus().updateAttributes('image', { alt }).run();
              }}
              className="flex-1 px-3 py-1.5 text-xs hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-700 dark:text-gray-300 flex items-center justify-center gap-1"
            >
              <Type size={14} /> Alt Text
            </button>
          </div>
        </BubbleMenu>
      )}

      {/* YouTube Bubble Menu */}
      {editor && (
        <BubbleMenu 
          editor={editor} 
          pluginKey="youtube-menu"
          shouldShow={({ editor }) => editor.isActive('youtube')}
          className="bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden flex divide-x divide-gray-200 dark:divide-gray-700 z-50"
        >
          <button
            onClick={openYoutubeEdit}
            className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors"
          >
            <YoutubeIcon size={16} />
            Edit Settings
          </button>
          <button 
            onClick={() => editor.chain().focus().deleteSelection().run()}
            className="flex items-center gap-2 px-3 py-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-sm font-medium text-red-600 transition-colors"
          >
            <X size={16} />
            Remove
          </button>
        </BubbleMenu>
      )}

      {/* Link Bubble Menu */}
      {editor && (
        <BubbleMenu
          editor={editor}
          pluginKey="link-menu"
          shouldShow={({ editor }) => editor.isActive('link')}
          className="flex items-center gap-1 p-1.5 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50"
        >
          <span className="text-xs text-gray-500 px-2 flex items-center gap-1">
            <LinkIcon size={14} />
            Link
          </span>
          <div className="w-px h-5 bg-gray-200 dark:bg-gray-600 mx-0.5" />
          <button 
            onClick={() => {
              const href = editor.getAttributes('link').href;
              window.open(href, '_blank');
            }}
            className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-xs text-gray-600 dark:text-gray-300 flex items-center gap-1"
            title="Open Link"
          >
            <ExternalLink size={14} />
            Open
          </button>
          <button 
            onClick={openLinkModal}
            className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-xs text-gray-600 dark:text-gray-300"
            title="Edit Link"
          >
            Edit
          </button>
          <button 
            onClick={() => editor.chain().focus().unsetLink().run()}
            className="p-1.5 rounded hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors text-red-500"
            title="Remove Link"
          >
            <X size={14} />
          </button>
        </BubbleMenu>
      )}

      {/* Floating Menu - Hidden when ESC is pressed */}
      {!hideFloatingMenu && (
        <FloatingMenu 
          editor={editor} 
          className="flex items-center gap-1 p-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50"
        >
          {[
            { icon: Heading1, title: 'Heading 1', action: () => editor.chain().focus().toggleHeading({ level: 1 }).run() },
            { icon: Heading2, title: 'Heading 2', action: () => editor.chain().focus().toggleHeading({ level: 2 }).run() },
            { icon: Heading3, title: 'Heading 3', action: () => editor.chain().focus().toggleHeading({ level: 3 }).run() },
            { type: 'divider' },
            { icon: List, title: 'Bullet List', action: () => editor.chain().focus().toggleBulletList().run() },
            { icon: ListOrdered, title: 'Numbered List', action: () => editor.chain().focus().toggleOrderedList().run() },
            { type: 'divider' },
            { icon: ImageIcon, title: 'Image', action: () => setIsImageModalOpen(true) },
            { icon: YoutubeIcon, title: 'YouTube', action: () => setIsYouTubeModalOpen(true) },
          ].map((item, index) => (
            item.type === 'divider' ? (
              <div key={index} className="w-px h-5 bg-gray-200 dark:bg-gray-600 mx-0.5" />
            ) : (
              <button 
                key={index}
                onClick={item.action} 
                className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" 
                title={item.title}
              >
                {item.icon && <item.icon size={16} />}
              </button>
            )
          ))}
        </FloatingMenu>
      )}

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
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide px-2 py-1">Commands</p>
              {filteredCommands.map((command, index) => (
                <button
                  key={command.title}
                  onClick={() => executeSlashCommand(command)}
                  className={clsx(
                    "w-full flex items-center gap-3 px-2 py-2 rounded-lg text-left transition-colors",
                    index === selectedIndex ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" : "hover:bg-gray-100 dark:hover:bg-gray-700"
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
