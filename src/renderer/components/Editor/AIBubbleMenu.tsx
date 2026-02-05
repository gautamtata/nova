import { useState, useRef, useEffect, useCallback } from 'react';
import { BubbleMenu } from '@tiptap/react/menus';
import type { Editor } from '@tiptap/core';
import {
  Copy,
  Scissors,
  Sparkles,
  RefreshCw,
  Minimize2,
  PenLine,
  SpellCheck,
  ArrowDownNarrowWide,
  ArrowUpNarrowWide,
  Briefcase,
  Coffee,
  MessageSquarePlus,
  Loader2,
  Check,
  X,
} from 'lucide-react';
import { runAIAction, type AIAction } from '@/lib/ai-client';
import { useAppStore } from '@/lib/store';

interface AIBubbleMenuProps {
  editor: Editor;
}

const aiActions: {
  action: AIAction;
  label: string;
  icon: React.ReactNode;
}[] = [
  { action: 'rewrite', label: 'Rewrite', icon: <RefreshCw size={14} /> },
  { action: 'simplify', label: 'Simplify', icon: <Minimize2 size={14} /> },
  { action: 'improve', label: 'Improve Writing', icon: <PenLine size={14} /> },
  { action: 'fix-grammar', label: 'Fix Grammar', icon: <SpellCheck size={14} /> },
  { action: 'make-shorter', label: 'Make Shorter', icon: <ArrowDownNarrowWide size={14} /> },
  { action: 'make-longer', label: 'Make Longer', icon: <ArrowUpNarrowWide size={14} /> },
  { action: 'change-tone-formal', label: 'Formal Tone', icon: <Briefcase size={14} /> },
  { action: 'change-tone-casual', label: 'Casual Tone', icon: <Coffee size={14} /> },
];

export function AIBubbleMenu({ editor }: AIBubbleMenuProps) {
  const [showAIDropdown, setShowAIDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [aiResult, setAiResult] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { apiKey, aiModel, setSidebarOpen, setSidebarContext } = useAppStore();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowAIDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Reset state when selection changes
  useEffect(() => {
    const onSelectionUpdate = () => {
      setShowAIDropdown(false);
      setAiResult(null);
      setIsLoading(false);
    };
    editor.on('selectionUpdate', onSelectionUpdate);
    return () => {
      editor.off('selectionUpdate', onSelectionUpdate);
    };
  }, [editor]);

  const handleCopy = useCallback(() => {
    const { from, to } = editor.state.selection;
    const text = editor.state.doc.textBetween(from, to, '\n');
    navigator.clipboard.writeText(text);
  }, [editor]);

  const handleCut = useCallback(() => {
    const { from, to } = editor.state.selection;
    const text = editor.state.doc.textBetween(from, to, '\n');
    navigator.clipboard.writeText(text);
    editor.chain().focus().deleteSelection().run();
  }, [editor]);

  const handleSendToChat = useCallback(() => {
    const { from, to } = editor.state.selection;
    const text = editor.state.doc.textBetween(from, to, '\n');
    setSidebarContext(text);
    setSidebarOpen(true);
  }, [editor, setSidebarContext, setSidebarOpen]);

  const handleAIAction = useCallback(
    async (action: AIAction) => {
      if (!apiKey) {
        useAppStore.getState().setSettingsOpen(true);
        return;
      }

      const { from, to } = editor.state.selection;
      const selectedText = editor.state.doc.textBetween(from, to, '\n');

      setIsLoading(true);
      setShowAIDropdown(false);
      setAiResult(null);

      try {
        const result = await runAIAction(apiKey, aiModel, action, selectedText, (text) => {
          setAiResult(text);
        });
        setAiResult(result);
        setIsLoading(false);
      } catch (error) {
        console.error('AI action failed:', error);
        setAiResult(null);
        setIsLoading(false);
      }
    },
    [apiKey, aiModel, editor],
  );

  const handleAcceptAI = useCallback(() => {
    if (aiResult) {
      editor.chain().focus().insertContent(aiResult).run();
    }
    setAiResult(null);
    setIsLoading(false);
  }, [editor, aiResult]);

  const handleRejectAI = useCallback(() => {
    setAiResult(null);
    setIsLoading(false);
  }, []);

  return (
    <BubbleMenu editor={editor}>
      <div className="bubble-menu animate-fade-in">
        {isLoading || aiResult ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            {isLoading && !aiResult && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 10px',
                  color: 'var(--color-accent)',
                  fontSize: '12px',
                  fontFamily: 'var(--font-sans)',
                }}
              >
                <Loader2 size={14} className="animate-pulse-dot" />
                Thinking...
              </div>
            )}
            {aiResult && (
              <>
                <div
                  style={{
                    maxWidth: '300px',
                    maxHeight: '120px',
                    overflow: 'auto',
                    padding: '6px 10px',
                    fontSize: '12px',
                    fontFamily: 'var(--font-serif)',
                    lineHeight: 1.5,
                    color: 'var(--color-text-secondary)',
                  }}
                >
                  {aiResult}
                </div>
                <div className="bubble-menu-divider" />
                <button className="bubble-menu-btn" onClick={handleAcceptAI} title="Accept">
                  <Check size={14} style={{ color: 'var(--color-success)' }} />
                </button>
                <button className="bubble-menu-btn" onClick={handleRejectAI} title="Reject">
                  <X size={14} style={{ color: 'var(--color-error)' }} />
                </button>
              </>
            )}
          </div>
        ) : (
          <>
            <button className="bubble-menu-btn" onClick={handleCopy} title="Copy">
              <Copy size={14} />
            </button>
            <button className="bubble-menu-btn" onClick={handleCut} title="Cut">
              <Scissors size={14} />
            </button>

            <div className="bubble-menu-divider" />

            <div style={{ position: 'relative' }} ref={dropdownRef}>
              <button
                className="bubble-menu-btn ai"
                onClick={() => setShowAIDropdown(!showAIDropdown)}
                title="AI Actions"
              >
                <Sparkles size={14} />
                AI
              </button>

              {showAIDropdown && (
                <div className="ai-dropdown animate-fade-in">
                  {aiActions.map(({ action, label, icon }) => (
                    <button
                      key={action}
                      className="ai-dropdown-item"
                      onClick={() => handleAIAction(action)}
                    >
                      <span className="ai-icon">{icon}</span>
                      {label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="bubble-menu-divider" />

            <button
              className="bubble-menu-btn"
              onClick={handleSendToChat}
              title="Send to AI Chat (⌘L)"
            >
              <MessageSquarePlus size={14} />
            </button>
          </>
        )}
      </div>
    </BubbleMenu>
  );
}
