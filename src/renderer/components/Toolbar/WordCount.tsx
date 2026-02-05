import { useEffect, useState } from 'react';
import type { Editor } from '@tiptap/core';

interface WordCountProps {
  editor: Editor | null;
}

export function WordCount({ editor }: WordCountProps) {
  const [words, setWords] = useState(0);
  const [chars, setChars] = useState(0);

  useEffect(() => {
    if (!editor) return;

    const updateCount = () => {
      const text = editor.state.doc.textContent;
      const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
      setWords(wordCount);
      setChars(text.length);
    };

    updateCount();
    editor.on('update', updateCount);
    return () => {
      editor.off('update', updateCount);
    };
  }, [editor]);

  if (!editor || (words === 0 && chars === 0)) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '12px',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: '12px',
        padding: '4px 12px',
        borderRadius: 'var(--radius-md)',
        background: 'var(--color-bg-secondary)',
        border: '1px solid var(--color-border-subtle)',
        fontFamily: 'var(--font-sans)',
        fontSize: '11px',
        color: 'var(--color-text-tertiary)',
        zIndex: 40,
        opacity: 0.7,
        transition: 'opacity 0.2s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.opacity = '1';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.opacity = '0.7';
      }}
    >
      <span>{words} {words === 1 ? 'word' : 'words'}</span>
      <span style={{ color: 'var(--color-border)' }}>|</span>
      <span>{chars} {chars === 1 ? 'char' : 'chars'}</span>
    </div>
  );
}
