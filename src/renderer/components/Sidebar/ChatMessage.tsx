import { User, Sparkles, ClipboardCopy, ArrowDownToLine } from 'lucide-react';
import { useState, useCallback } from 'react';

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  isStreaming?: boolean;
  onInsertToEditor?: (text: string) => void;
}

export function ChatMessage({
  role,
  content,
  isStreaming,
  onInsertToEditor,
}: ChatMessageProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [content]);

  return (
    <div
      style={{
        display: 'flex',
        gap: '10px',
        padding: '12px 16px',
        borderBottom: '1px solid var(--color-border-subtle)',
        animation: 'fadeIn 0.15s ease-out',
      }}
    >
      <div
        style={{
          width: '26px',
          height: '26px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          background:
            role === 'assistant'
              ? 'var(--color-accent-subtle)'
              : 'var(--color-bg-secondary)',
          color:
            role === 'assistant' ? 'var(--color-accent)' : 'var(--color-text-secondary)',
        }}
      >
        {role === 'assistant' ? <Sparkles size={13} /> : <User size={13} />}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: '11px',
            fontWeight: 600,
            color: 'var(--color-text-tertiary)',
            marginBottom: '4px',
            fontFamily: 'var(--font-sans)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          {role === 'assistant' ? 'Inkwell AI' : 'You'}
        </div>

        <div
          style={{
            fontSize: '13px',
            lineHeight: 1.65,
            color: 'var(--color-text)',
            fontFamily: 'var(--font-sans)',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}
        >
          {content}
          {isStreaming && (
            <span
              style={{
                display: 'inline-block',
                width: '6px',
                height: '14px',
                background: 'var(--color-accent)',
                marginLeft: '2px',
                borderRadius: '1px',
                verticalAlign: 'text-bottom',
              }}
              className="animate-pulse-dot"
            />
          )}
        </div>

        {role === 'assistant' && !isStreaming && content && (
          <div
            style={{
              display: 'flex',
              gap: '4px',
              marginTop: '8px',
            }}
          >
            <button
              onClick={handleCopy}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 8px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--color-border)',
                background: 'transparent',
                color: 'var(--color-text-tertiary)',
                fontSize: '11px',
                fontFamily: 'var(--font-sans)',
                cursor: 'pointer',
                transition: 'all 0.1s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--color-surface-hover)';
                e.currentTarget.style.color = 'var(--color-text-secondary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = 'var(--color-text-tertiary)';
              }}
            >
              <ClipboardCopy size={11} />
              {copied ? 'Copied!' : 'Copy'}
            </button>
            {onInsertToEditor && (
              <button
                onClick={() => onInsertToEditor(content)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '4px 8px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-border)',
                  background: 'transparent',
                  color: 'var(--color-text-tertiary)',
                  fontSize: '11px',
                  fontFamily: 'var(--font-sans)',
                  cursor: 'pointer',
                  transition: 'all 0.1s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--color-surface-hover)';
                  e.currentTarget.style.color = 'var(--color-text-secondary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'var(--color-text-tertiary)';
                }}
              >
                <ArrowDownToLine size={11} />
                Insert
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
