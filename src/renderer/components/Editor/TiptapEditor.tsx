import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import type { Editor } from '@tiptap/core';
import { getExtensions } from './extensions';
import { SlashCommandExtension } from './slash-commands';
import { getSuggestionConfig } from './suggestion';
import { AIBubbleMenu } from './AIBubbleMenu';
import { useAppStore } from '@/lib/store';
import { runAIAction } from '@/lib/ai-client';

export interface TiptapEditorRef {
  getEditor: () => Editor | null;
  getMarkdown: () => string;
  setContent: (content: string) => void;
}

export const TiptapEditor = forwardRef<TiptapEditorRef>((_props, ref) => {
  const { setIsModified, apiKey, aiModel } = useAppStore();
  const editorContainerRef = useRef<HTMLDivElement>(null);

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
    },
    onUpdate: () => {
      setIsModified(true);
    },
  });

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

  // Handle slash AI write command
  useEffect(() => {
    const handleSlashAI = async (e: Event) => {
      const customEvent = e as CustomEvent;
      const targetEditor = customEvent.detail?.editor as Editor;
      if (!targetEditor || !apiKey) {
        if (!apiKey) useAppStore.getState().setSettingsOpen(true);
        return;
      }

      const { from } = targetEditor.state.selection;
      const textBefore = targetEditor.state.doc.textBetween(0, from, '\n');
      const lastParagraph = textBefore.split('\n').filter(Boolean).slice(-3).join('\n');

      try {
        let accumulated = '';
        await runAIAction(apiKey, aiModel, 'continue-writing', lastParagraph, (text) => {
          accumulated = text;
        });
        if (accumulated) {
          targetEditor.chain().focus().insertContent(accumulated).run();
        }
      } catch (error) {
        console.error('AI write failed:', error);
      }
    };

    window.addEventListener('slash-ai-write', handleSlashAI);
    return () => window.removeEventListener('slash-ai-write', handleSlashAI);
  }, [apiKey, aiModel]);

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
    </div>
  );
});

TiptapEditor.displayName = 'TiptapEditor';
