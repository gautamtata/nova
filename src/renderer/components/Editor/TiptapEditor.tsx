import { useState, useEffect, useRef, useCallback, forwardRef, useImperativeHandle } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import type { Editor } from '@tiptap/core';
import { getExtensions } from './extensions';
import { SlashCommandExtension } from './slash-commands';
import { getSuggestionConfig } from './suggestion';
import { AIBubbleMenu } from './AIBubbleMenu';
import { AIPromptInput } from './AIPromptInput';
import { useAppStore } from '@/lib/store';

/**
 * Heuristic to detect if pasted plain text is likely markdown.
 * Requires at least 2 distinct markdown patterns to trigger.
 */
function isLikelyMarkdown(text: string): boolean {
  const lines = text.split('\n');
  let hits = 0;

  for (const line of lines) {
    const t = line.trim();
    if (/^#{1,6}\s/.test(t)) hits++;       // headings
    if (/^[-*+]\s/.test(t)) hits++;         // unordered lists
    if (/^\d+\.\s/.test(t)) hits++;         // ordered lists
    if (/^>\s/.test(t)) hits++;             // blockquotes
    if (/^```/.test(t)) hits++;             // code fences
    if (/^(---|\*\*\*|___)$/.test(t)) hits++; // horizontal rules
  }

  // inline patterns (check once across entire text)
  if (/\*\*[^*]+\*\*/.test(text)) hits++;   // bold
  if (/(?<!\*)\*[^*]+\*(?!\*)/.test(text)) hits++; // italic
  if (/\[.+?\]\(.+?\)/.test(text)) hits++;  // links
  if (/`[^`]+`/.test(text)) hits++;          // inline code
  if (/!\[.*?\]\(.+?\)/.test(text)) hits++;  // images

  return hits >= 2;
}

export interface TiptapEditorRef {
  getEditor: () => Editor | null;
  getMarkdown: () => string;
  setContent: (content: string) => void;
}

export const TiptapEditor = forwardRef<TiptapEditorRef>((_props, ref) => {
  const { setIsModified, apiKey } = useAppStore();
  const editorContainerRef = useRef<HTMLDivElement>(null);
  const [showAIPrompt, setShowAIPrompt] = useState(false);
  const editorInstanceRef = useRef<Editor | null>(null);

  const editor = useEditor({
    extensions: [
      ...getExtensions(),
      SlashCommandExtension.configure({
        suggestion: getSuggestionConfig(),
      }),
    ],
    content: '',
    editorProps: {
      attributes: {
        class: 'tiptap-editor',
      },
      handlePaste: (_view, event) => {
        const text = event.clipboardData?.getData('text/plain');
        const html = event.clipboardData?.getData('text/html');

        // Only handle plain-text-only pastes that look like markdown
        if (!text || html) return false;
        if (!isLikelyMarkdown(text)) return false;

        const ed = editorInstanceRef.current;
        if (!ed) return false;

        event.preventDefault();

        try {
          // Use the @tiptap/markdown parser stored in editor.storage
          const parser = (ed.storage as any).markdown?.parser;
          if (parser) {
            const doc = parser.parse(text);
            const jsonContent = doc.toJSON().content;
            ed.commands.insertContent(jsonContent);
            return true;
          }
        } catch (e) {
          console.error('Markdown paste failed, falling back to plain text:', e);
        }

        return false;
      },
    },
    onUpdate: () => {
      setIsModified(true);
    },
  });

  // Keep a ref so the handlePaste closure can access the editor
  useEffect(() => {
    editorInstanceRef.current = editor ?? null;
  }, [editor]);

  useImperativeHandle(ref, () => ({
    getEditor: () => editor,
    getMarkdown: () => {
      if (!editor) return '';
      // Tiptap v3 markdown extension exposes getMarkdown() on the editor
      try {
        return (editor as any).getMarkdown?.() ?? editor.getHTML();
      } catch {
        return editor.getHTML();
      }
    },
    setContent: (content: string) => {
      if (!editor) return;
      try {
        editor.commands.setContent(content, false, { contentType: 'markdown' as any });
      } catch {
        editor.commands.setContent(content);
      }
      setIsModified(false);
    },
  }));

  // Handle slash AI write command — show prompt input
  useEffect(() => {
    const handleSlashAI = (e: Event) => {
      const customEvent = e as CustomEvent;
      const targetEditor = customEvent.detail?.editor as Editor;
      if (!targetEditor || !apiKey) {
        if (!apiKey) useAppStore.getState().setSettingsOpen(true);
        return;
      }
      setShowAIPrompt(true);
    };

    window.addEventListener('slash-ai-write', handleSlashAI);
    return () => window.removeEventListener('slash-ai-write', handleSlashAI);
  }, [apiKey]);

  const handleCloseAIPrompt = useCallback(() => {
    setShowAIPrompt(false);
    editor?.commands.focus();
  }, [editor]);

  // Keyboard shortcut: Cmd+L to send selection to sidebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'l') {
        e.preventDefault();
        if (!editor) return;

        const { from, to } = editor.state.selection;
        if (from !== to) {
          const text = editor.state.doc.textBetween(from, to, '\n');
          useAppStore.getState().setSidebarContext(text);
        }
        useAppStore.getState().setSidebarOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [editor]);

  if (!editor) return null;

  return (
    <div
      ref={editorContainerRef}
      style={{
        flex: 1,
        overflow: 'auto',
        position: 'relative',
      }}
    >
      <AIBubbleMenu editor={editor} />
      <EditorContent editor={editor} />
      {showAIPrompt && (
        <AIPromptInput editor={editor} onClose={handleCloseAIPrompt} />
      )}
    </div>
  );
});

TiptapEditor.displayName = 'TiptapEditor';
