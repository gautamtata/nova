import { useState, useRef, useEffect, useCallback } from 'react';
import { Sparkles, Loader2, Send } from 'lucide-react';
import type { Editor } from '@tiptap/core';
import { runCustomWrite } from '@/lib/ai-client';
import { useAppStore } from '@/lib/store';

interface AIPromptInputProps {
  editor: Editor;
  onClose: () => void;
}

export function AIPromptInput({ editor, onClose }: AIPromptInputProps) {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { apiKey, aiModel } = useAppStore();

  // Position the popup at the cursor
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);

  useEffect(() => {
    const { from } = editor.state.selection;
    const coords = editor.view.coordsAtPos(from);
    const editorRect = editor.view.dom.closest('.tiptap-editor')?.getBoundingClientRect();

    if (coords && editorRect) {
      setPosition({
        top: coords.bottom + 8,
        left: coords.left,
      });
    }

    // Focus the input
    setTimeout(() => inputRef.current?.focus(), 50);
  }, [editor]);

  // Close on Escape or click outside
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  const handleSubmit = useCallback(async () => {
    if (!prompt.trim() || isGenerating || !apiKey) return;

    setIsGenerating(true);

    const { from } = editor.state.selection;
    const textBefore = editor.state.doc.textBetween(0, from, '\n');
    const context = textBefore.split('\n').filter(Boolean).slice(-3).join('\n');

    try {
      let accumulated = '';
      await runCustomWrite(apiKey, aiModel, prompt.trim(), context, (text) => {
        accumulated = text;
      });
      if (accumulated) {
        editor.chain().focus().insertContent(accumulated).run();
      }
      onClose();
    } catch (error) {
      console.error('AI custom write failed:', error);
      setIsGenerating(false);
    }
  }, [prompt, isGenerating, apiKey, aiModel, editor, onClose]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit],
  );

  if (!position) return null;

  return (
    <div
      ref={containerRef}
      className="ai-prompt-input animate-fade-in"
      style={{
        position: 'fixed',
        top: position.top,
        left: position.left,
        zIndex: 1000,
      }}
    >
      <div className="ai-prompt-icon">
        {isGenerating ? (
          <Loader2 size={14} className="animate-pulse-dot" />
        ) : (
          <Sparkles size={14} />
        )}
      </div>
      <input
        ref={inputRef}
        type="text"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={isGenerating ? 'Writing...' : 'Tell AI what to write...'}
        disabled={isGenerating}
        className="ai-prompt-field"
      />
      {!isGenerating && (
        <button
          className="ai-prompt-submit"
          onClick={handleSubmit}
          disabled={!prompt.trim()}
          title="Submit (Enter)"
        >
          <Send size={14} />
        </button>
      )}
    </div>
  );
}
