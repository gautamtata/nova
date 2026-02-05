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

interface EditState {
  /** The text before any AI edits (preserved across rewrites so Reject always restores the original). */
  originalText: string;
  lastAction: AIAction;
  /** Current range of the AI-modified text in the document. */
  newFrom: number;
  newTo: number;
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
  const [editState, setEditState] = useState<EditState | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  /**
   * Tracks the AI editing lifecycle so the selectionUpdate listener
   * can behave correctly:
   *   idle     – normal behaviour (reset on selection change)
   *   loading  – AI request in-flight, ignore all selection updates
   *   reviewing – edit is done, user is deciding; clicking away = accept
   */
  const aiPhaseRef = useRef<'idle' | 'loading' | 'reviewing'>('idle');
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

  // React to editor selection changes
  useEffect(() => {
    const onSelectionUpdate = () => {
      if (aiPhaseRef.current === 'loading') return;

      if (aiPhaseRef.current === 'reviewing') {
        // User clicked away from the modified text — implicit accept
        aiPhaseRef.current = 'idle';
        setEditState(null);
        return;
      }

      // idle — normal reset
      setShowAIDropdown(false);
      setEditState(null);
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

  /**
   * Core AI action handler.
   * @param preservedOriginalText  When rewriting, pass the *first* original
   *   text so that Reject always restores the pre-AI content.
   */
  const performAIAction = useCallback(
    async (action: AIAction, preservedOriginalText?: string) => {
      if (!apiKey) {
        useAppStore.getState().setSettingsOpen(true);
        return;
      }

      const { from, to } = editor.state.selection;
      const selectedText = editor.state.doc.textBetween(from, to, '\n');
      const originalText = preservedOriginalText ?? selectedText;

      aiPhaseRef.current = 'loading';
      setIsLoading(true);
      setShowAIDropdown(false);
      setEditState(null);

      try {
        const result = await runAIAction(apiKey, aiModel, action, selectedText, () => {
          /* streaming chunks not displayed in popover anymore */
        });

        if (!result) throw new Error('Empty AI result');

        // Replace the selected text in-place inside the editor
        editor
          .chain()
          .focus()
          .setTextSelection({ from, to })
          .insertContent(result)
          .run();

        // After insertContent the cursor sits at the end of the new text
        const newTo = editor.state.selection.from;

        // Re-select the new text so the bubble menu stays visible
        editor.chain().setTextSelection({ from, to: newTo }).run();

        aiPhaseRef.current = 'reviewing';
        setEditState({ originalText, lastAction: action, newFrom: from, newTo });
        setIsLoading(false);
      } catch (error) {
        console.error('AI action failed:', error);
        aiPhaseRef.current = 'idle';
        setEditState(null);
        setIsLoading(false);
      }
    },
    [apiKey, aiModel, editor],
  );

  const handleAIAction = useCallback(
    (action: AIAction) => {
      performAIAction(action);
    },
    [performAIAction],
  );

  // ---- Accept / Reject / Rewrite handlers ----

  const handleAcceptAI = useCallback(() => {
    aiPhaseRef.current = 'idle';
    if (editState) {
      editor.chain().focus().setTextSelection(editState.newTo).run();
    }
    setEditState(null);
    setIsLoading(false);
  }, [editor, editState]);

  const handleRejectAI = useCallback(() => {
    aiPhaseRef.current = 'idle';
    if (editState) {
      editor
        .chain()
        .focus()
        .setTextSelection({ from: editState.newFrom, to: editState.newTo })
        .insertContent(editState.originalText)
        .run();
    }
    setEditState(null);
    setIsLoading(false);
  }, [editor, editState]);

  const handleRewriteAI = useCallback(() => {
    if (!editState) return;
    // aiPhaseRef stays at 'reviewing' until performAIAction sets it to 'loading'
    performAIAction(editState.lastAction, editState.originalText);
  }, [editState, performAIAction]);

  // ---- Render ----

  return (
    <BubbleMenu editor={editor}>
      <div className="bubble-menu animate-fade-in">
        {isLoading ? (
          /* ---- Loading indicator ---- */
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
        ) : editState ? (
          /* ---- Accept / Reject / Rewrite toolbar ---- */
          <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
            <button className="bubble-menu-btn" onClick={handleAcceptAI} title="Accept">
              <Check size={14} style={{ color: 'var(--color-success)' }} />
              Accept
            </button>
            <div className="bubble-menu-divider" />
            <button className="bubble-menu-btn" onClick={handleRejectAI} title="Reject">
              <X size={14} style={{ color: 'var(--color-error)' }} />
              Reject
            </button>
            <div className="bubble-menu-divider" />
            <button className="bubble-menu-btn ai" onClick={handleRewriteAI} title="Rewrite">
              <RefreshCw size={14} />
              Rewrite
            </button>
          </div>
        ) : (
          /* ---- Default toolbar (Copy / Cut / AI / Chat) ---- */
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
