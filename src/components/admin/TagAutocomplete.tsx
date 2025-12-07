'use client';

import { useState, useRef, useEffect } from 'react';
import { X, Plus } from 'lucide-react';
import { Tag } from '@/lib/types';
import clsx from 'clsx';

interface TagAutocompleteProps {
  selectedTags: string[];
  availableTags: Tag[];
  onChange: (tags: string[]) => void;
  onCreateTag?: (name: string) => Promise<Tag>;
}

/**
 * Normalize tag name to lowercase kebab-case
 */
export function normalizeTagName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export function TagAutocomplete({ selectedTags, availableTags, onChange, onCreateTag }: TagAutocompleteProps) {
  const [inputValue, setInputValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter available tags based on input
  const filteredTags = availableTags.filter(tag => 
    tag.name.toLowerCase().includes(inputValue.toLowerCase()) &&
    !selectedTags.includes(tag.id)
  );

  // Check if input matches an existing tag
  const normalizedInput = normalizeTagName(inputValue);
  const exactMatch = availableTags.find(t => t.slug === normalizedInput);
  const canCreateNew = inputValue.trim().length > 0 && !exactMatch && onCreateTag;

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectTag = (tagId: string) => {
    if (!selectedTags.includes(tagId)) {
      onChange([...selectedTags, tagId]);
    }
    setInputValue('');
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const handleRemoveTag = (tagId: string) => {
    onChange(selectedTags.filter(id => id !== tagId));
  };

  const handleCreateTag = async () => {
    if (!onCreateTag || !inputValue.trim()) return;
    
    setIsCreating(true);
    try {
      const newTag = await onCreateTag(inputValue.trim());
      onChange([...selectedTags, newTag.id]);
      setInputValue('');
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to create tag:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredTags.length > 0) {
        handleSelectTag(filteredTags[0].id);
      } else if (canCreateNew) {
        handleCreateTag();
      }
    } else if (e.key === 'Backspace' && inputValue === '' && selectedTags.length > 0) {
      handleRemoveTag(selectedTags[selectedTags.length - 1]);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  // Get tag display info
  const getTagName = (tagId: string) => {
    const tag = availableTags.find(t => t.id === tagId);
    return tag?.name || tagId;
  };

  return (
    <div ref={containerRef} className="relative">
      {/* Selected Tags + Input */}
      <div 
        className="flex flex-wrap gap-2 p-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 min-h-[48px]"
        onClick={() => inputRef.current?.focus()}
      >
        {selectedTags.map(tagId => (
          <span
            key={tagId}
            className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium"
          >
            {getTagName(tagId)}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); handleRemoveTag(tagId); }}
              className="hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full p-0.5"
            >
              <X size={14} />
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => { setInputValue(e.target.value); setIsOpen(true); }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={selectedTags.length === 0 ? "Type to search or create tags..." : ""}
          className="flex-1 min-w-[120px] bg-transparent outline-none text-gray-900 dark:text-white placeholder-gray-400"
        />
      </div>

      {/* Dropdown */}
      {isOpen && (filteredTags.length > 0 || canCreateNew) && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg max-h-60 overflow-auto">
          {filteredTags.map(tag => (
            <button
              key={tag.id}
              type="button"
              onClick={() => handleSelectTag(tag.id)}
              className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-between"
            >
              <span className="text-gray-900 dark:text-white">{tag.name}</span>
              <span className="text-xs text-gray-500 font-mono">{tag.slug}</span>
            </button>
          ))}
          
          {canCreateNew && (
            <>
              {filteredTags.length > 0 && <div className="border-t border-gray-200 dark:border-gray-700" />}
              <button
                type="button"
                onClick={handleCreateTag}
                disabled={isCreating}
                className={clsx(
                  "w-full px-4 py-2 text-left flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20",
                  isCreating && "opacity-50 cursor-not-allowed"
                )}
              >
                <Plus size={16} />
                <span>Create &quot;{normalizedInput}&quot;</span>
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
