import { useRef, useCallback, useEffect, useState } from 'react';
import type { Editor } from '@tiptap/core';
import { ThemeProvider } from '@/components/Theme/ThemeProvider';
import { TopToolbar } from '@/components/Toolbar/TopToolbar';
import { WordCount } from '@/components/Toolbar/WordCount';
import { TiptapEditor, type TiptapEditorRef } from '@/components/Editor/TiptapEditor';
import { AISidebar } from '@/components/Sidebar/AISidebar';
import { SettingsModal } from '@/components/Settings/SettingsModal';
import { useAppStore } from '@/lib/store';

const electronAPI = typeof window !== 'undefined' ? (window as any).electronAPI : null;

export default function App() {
  const editorRef = useRef<TiptapEditorRef>(null);
  const [editorInstance, setEditorInstance] = useState<Editor | null>(null);
  const {
    setCurrentFilePath,
    setIsModified,
    sidebarOpen,
    setApiKey,
    setAiModel,
  } = useAppStore();

  // Load settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      if (!electronAPI?.settings) {
        setTimeout(() => useAppStore.getState().setSettingsOpen(true), 500);
        return;
      }

      const storedKey = (await electronAPI.settings.get('apiKey')) as string | null;
      if (storedKey) setApiKey(storedKey);

      const storedModel = (await electronAPI.settings.get('aiModel')) as string | null;
      if (storedModel) setAiModel(storedModel);

      if (!storedKey) {
        setTimeout(() => useAppStore.getState().setSettingsOpen(true), 500);
      }
    };
    loadSettings();
  }, [setApiKey, setAiModel]);

  // Poll for the editor instance
  useEffect(() => {
    const interval = setInterval(() => {
      const editor = editorRef.current?.getEditor();
      if (editor && !editorInstance) {
        setEditorInstance(editor);
        clearInterval(interval);
      }
    }, 100);
    return () => clearInterval(interval);
  }, [editorInstance]);

  const getMarkdown = useCallback(() => {
    return editorRef.current?.getMarkdown() ?? '';
  }, []);

  const handleNew = useCallback(() => {
    editorRef.current?.setContent('');
    setCurrentFilePath(null);
    setIsModified(false);
    electronAPI?.file?.new();
  }, [setCurrentFilePath, setIsModified]);

  const handleOpen = useCallback(async () => {
    if (!electronAPI?.file) return;
    const result = await electronAPI.file.open();
    if (result.success && result.content !== undefined) {
      editorRef.current?.setContent(result.content);
      setCurrentFilePath(result.filePath ?? null);
      setIsModified(false);
    }
  }, [setCurrentFilePath, setIsModified]);

  const handleSave = useCallback(async () => {
    if (!electronAPI?.file) return;
    const markdown = getMarkdown();
    const result = await electronAPI.file.save(markdown);
    if (result.success) {
      setCurrentFilePath(result.filePath ?? null);
      setIsModified(false);
    }
  }, [getMarkdown, setCurrentFilePath, setIsModified]);

  const handleSaveAs = useCallback(async () => {
    if (!electronAPI?.file) return;
    const markdown = getMarkdown();
    const result = await electronAPI.file.saveAs(markdown);
    if (result.success) {
      setCurrentFilePath(result.filePath ?? null);
      setIsModified(false);
    }
  }, [getMarkdown, setCurrentFilePath, setIsModified]);

  const handleCopyMarkdown = useCallback(() => {
    const markdown = getMarkdown();
    navigator.clipboard.writeText(markdown);
  }, [getMarkdown]);

  const handleExportMarkdown = useCallback(async () => {
    if (!electronAPI?.file) return;
    const markdown = getMarkdown();
    await electronAPI.file.saveAs(markdown);
  }, [getMarkdown]);

  const handleExportPdf = useCallback(async () => {
    if (!electronAPI?.file) return;
    await electronAPI.file.exportPdf();
  }, []);

  const handleInsertToEditor = useCallback((text: string) => {
    const editor = editorRef.current?.getEditor();
    if (editor) {
      editor.chain().focus().insertContent(text).run();
    }
  }, []);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;

      if (mod && e.key === 's' && !e.shiftKey) {
        e.preventDefault();
        handleSave();
      }
      if (mod && e.key === 's' && e.shiftKey) {
        e.preventDefault();
        handleSaveAs();
      }
      if (mod && e.key === 'o') {
        e.preventDefault();
        handleOpen();
      }
      if (mod && e.key === 'n') {
        e.preventDefault();
        handleNew();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSave, handleSaveAs, handleOpen, handleNew]);

  // Auto-save every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const state = useAppStore.getState();
      if (state.isModified && state.currentFilePath && electronAPI?.file) {
        const markdown = editorRef.current?.getMarkdown() ?? '';
        electronAPI.file.save(markdown);
        setIsModified(false);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [setIsModified]);

  return (
    <ThemeProvider>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          width: '100vw',
          overflow: 'hidden',
          background: 'var(--color-bg)',
        }}
      >
        <TopToolbar
          onNew={handleNew}
          onOpen={handleOpen}
          onSave={handleSave}
          onSaveAs={handleSaveAs}
          onExportMarkdown={handleExportMarkdown}
          onExportPdf={handleExportPdf}
          onCopyMarkdown={handleCopyMarkdown}
        />

        <div
          style={{
            display: 'flex',
            flex: 1,
            overflow: 'hidden',
          }}
        >
          <TiptapEditor ref={editorRef} />
          {sidebarOpen && (
            <AISidebar onInsertToEditor={handleInsertToEditor} />
          )}
        </div>

        <WordCount editor={editorInstance} />
      </div>

      <SettingsModal />
    </ThemeProvider>
  );
}
