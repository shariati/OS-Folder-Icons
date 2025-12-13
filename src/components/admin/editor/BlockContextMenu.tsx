'use client';

import clsx from 'clsx';
import {
  Copy,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  Quote,
  RotateCcw,
  Trash2,
  Type,
} from 'lucide-react';

interface BlockContextMenuProps {
  editor: any;
  position: { x: number; y: number };
  onClose: () => void;
}

interface MenuItem {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  destructive?: boolean;
  dividerAfter?: boolean;
}

export function BlockContextMenu({ editor, position, onClose }: BlockContextMenuProps) {
  if (!editor) return null;

  const handleDuplicate = () => {
    // Get the current node and duplicate it
    const { from, to } = editor.state.selection;
    const node = editor.state.doc.nodeAt(from);
    if (node) {
      editor.chain().focus().insertContentAt(to, node.toJSON()).run();
    }
    onClose();
  };

  const handleDelete = () => {
    editor.chain().focus().deleteNode(editor.state.selection.$anchor.parent.type.name).run();
    onClose();
  };

  const handleCopy = () => {
    const { from, to } = editor.state.selection;
    const text = editor.state.doc.textBetween(from, to, '\n');
    navigator.clipboard.writeText(text);
    onClose();
  };

  const handleResetFormatting = () => {
    editor.chain().focus().clearNodes().unsetAllMarks().run();
    onClose();
  };

  const handleTransformTo = (type: string) => {
    switch (type) {
      case 'paragraph':
        editor.chain().focus().setParagraph().run();
        break;
      case 'heading1':
        editor.chain().focus().toggleHeading({ level: 1 }).run();
        break;
      case 'heading2':
        editor.chain().focus().toggleHeading({ level: 2 }).run();
        break;
      case 'bulletList':
        editor.chain().focus().toggleBulletList().run();
        break;
      case 'orderedList':
        editor.chain().focus().toggleOrderedList().run();
        break;
      case 'blockquote':
        editor.chain().focus().toggleBlockquote().run();
        break;
    }
    onClose();
  };

  const menuItems: MenuItem[] = [
    {
      icon: <Copy size={16} />,
      label: 'Copy',
      onClick: handleCopy,
    },
    {
      icon: <Copy size={16} />,
      label: 'Duplicate',
      onClick: handleDuplicate,
    },
    {
      icon: <RotateCcw size={16} />,
      label: 'Reset formatting',
      onClick: handleResetFormatting,
      dividerAfter: true,
    },
    {
      icon: <Type size={16} />,
      label: 'Text',
      onClick: () => handleTransformTo('paragraph'),
    },
    {
      icon: <Heading1 size={16} />,
      label: 'Heading 1',
      onClick: () => handleTransformTo('heading1'),
    },
    {
      icon: <Heading2 size={16} />,
      label: 'Heading 2',
      onClick: () => handleTransformTo('heading2'),
    },
    {
      icon: <List size={16} />,
      label: 'Bullet list',
      onClick: () => handleTransformTo('bulletList'),
    },
    {
      icon: <ListOrdered size={16} />,
      label: 'Numbered list',
      onClick: () => handleTransformTo('orderedList'),
    },
    {
      icon: <Quote size={16} />,
      label: 'Quote',
      onClick: () => handleTransformTo('blockquote'),
      dividerAfter: true,
    },
    {
      icon: <Trash2 size={16} />,
      label: 'Delete',
      onClick: handleDelete,
      destructive: true,
    },
  ];

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40" onClick={onClose} />

      {/* Menu */}
      <div
        className="fixed z-50 min-w-[180px] rounded-lg border border-gray-200 bg-white py-1 shadow-xl dark:border-gray-700 dark:bg-gray-800"
        style={{
          left: position.x,
          top: position.y,
        }}
      >
        {menuItems.map((item, index) => (
          <div key={index}>
            <button
              onClick={item.onClick}
              className={clsx(
                'flex w-full items-center gap-3 px-3 py-2 text-left transition-colors',
                item.destructive
                  ? 'text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20'
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
              )}
            >
              {item.icon}
              <span className="text-sm">{item.label}</span>
            </button>
            {item.dividerAfter && (
              <div className="my-1 border-t border-gray-200 dark:border-gray-700" />
            )}
          </div>
        ))}
      </div>
    </>
  );
}
