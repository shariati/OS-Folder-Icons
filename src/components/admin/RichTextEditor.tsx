'use client';

import { useEditor, EditorContent, BubbleMenu, FloatingMenu } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Youtube from '@tiptap/extension-youtube';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { useCallback, useEffect } from 'react';
import { 
  Bold, Italic, Strikethrough, Code, List, ListOrdered, 
  Quote, Image as ImageIcon, Youtube as YoutubeIcon, 
  Link as LinkIcon, Heading1, Heading2, Heading3
} from 'lucide-react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function RichTextEditor({ value, onChange, placeholder = 'Start writing...', className }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'rounded-xl shadow-lg my-8 max-w-full',
        },
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
    ],
    content: value,
    editorProps: {
      attributes: {
        class: 'prose prose-lg dark:prose-invert max-w-none focus:outline-none min-h-[300px]',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  // Sync content updates from parent if strictly needed (careful with loops)
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      // Only update if content is different to avoid cursor jumps
      // editor.commands.setContent(value);
    }
  }, [value, editor]);

  const addImage = useCallback(() => {
    const url = window.prompt('Enter image URL');
    if (url && editor) {
      editor.chain().focus().setImage({ src: url }).run();
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

    // cancelled
    if (url === null) {
      return;
    }

    // empty
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    // update
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className={twMerge("relative w-full", className)}>
      {/* Bubble Menu (Floating on selection) */}
      {editor && (
        <BubbleMenu 
          editor={editor} 
          tippyOptions={{ duration: 100 }}
          className="flex items-center gap-1 p-1 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
        >
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={clsx(
              "p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors",
              editor.isActive('bold') && "bg-gray-100 dark:bg-gray-700 text-blue-500"
            )}
          >
            <Bold size={16} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={clsx(
              "p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors",
              editor.isActive('italic') && "bg-gray-100 dark:bg-gray-700 text-blue-500"
            )}
          >
            <Italic size={16} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={clsx(
              "p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors",
              editor.isActive('strike') && "bg-gray-100 dark:bg-gray-700 text-blue-500"
            )}
          >
            <Strikethrough size={16} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleCode().run()}
            className={clsx(
              "p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors",
              editor.isActive('code') && "bg-gray-100 dark:bg-gray-700 text-blue-500"
            )}
          >
            <Code size={16} />
          </button>
          <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1" />
          <button
            onClick={setLink}
            className={clsx(
              "p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors",
              editor.isActive('link') && "bg-gray-100 dark:bg-gray-700 text-blue-500"
            )}
          >
            <LinkIcon size={16} />
          </button>
          <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1" />
           <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={clsx(
              "p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors",
              editor.isActive('heading', { level: 2 }) && "bg-gray-100 dark:bg-gray-700 text-blue-500"
            )}
          >
            <Heading2 size={16} />
          </button>
        </BubbleMenu>
      )}

      {/* Floating Menu (On empty line) */}
      {editor && (
        <FloatingMenu 
          editor={editor} 
          tippyOptions={{ duration: 100 }}
          className="flex items-center gap-1 p-1 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
        >
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={clsx(
              "p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors",
              editor.isActive('heading', { level: 1 }) && "bg-gray-100 dark:bg-gray-700 text-blue-500"
            )}
            title="Heading 1"
          >
            <Heading1 size={18} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={clsx(
              "p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors",
              editor.isActive('heading', { level: 2 }) && "bg-gray-100 dark:bg-gray-700 text-blue-500"
            )}
            title="Heading 2"
          >
            <Heading2 size={18} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={clsx(
              "p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors",
              editor.isActive('bulletList') && "bg-gray-100 dark:bg-gray-700 text-blue-500"
            )}
            title="Bullet List"
          >
            <List size={18} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={clsx(
              "p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors",
              editor.isActive('orderedList') && "bg-gray-100 dark:bg-gray-700 text-blue-500"
            )}
            title="Ordered List"
          >
            <ListOrdered size={18} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={clsx(
              "p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors",
              editor.isActive('blockquote') && "bg-gray-100 dark:bg-gray-700 text-blue-500"
            )}
            title="Quote"
          >
            <Quote size={18} />
          </button>
          <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1" />
          <button
            onClick={addImage}
            className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="Image"
          >
            <ImageIcon size={18} />
          </button>
          <button
            onClick={addYoutube}
            className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="YouTube"
          >
            <YoutubeIcon size={18} />
          </button>
        </FloatingMenu>
      )}

      <EditorContent editor={editor} />
    </div>
  );
}
