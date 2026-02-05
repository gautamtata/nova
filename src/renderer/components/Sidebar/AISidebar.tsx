import { useState, useRef, useEffect, useCallback } from 'react';
import { X, Send, Trash2, Sparkles } from 'lucide-react';
import { ChatMessage } from './ChatMessage';
import { chatWithAI } from '@/lib/ai-client';
import { useAppStore } from '@/lib/store';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface AISidebarProps {
  onInsertToEditor?: (text: string) => void;
}

export function AISidebar({ onInsertToEditor }: AISidebarProps) {
  const {
    sidebarOpen,
    setSidebarOpen,
    sidebarContext,
    setSidebarContext,
    apiKey,
    aiModel,
    setSettingsOpen,
  } = useAppStore();

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);

  // Handle context from Cmd+L
  useEffect(() => {
    if (sidebarContext && sidebarOpen) {
      setInput(`About this text:\n\n"${sidebarContext}"\n\n`);
      setSidebarContext(null);
      setTimeout(() => {
        inputRef.current?.focus();
        // Move cursor to end
        if (inputRef.current) {
          inputRef.current.selectionStart = inputRef.current.value.length;
          inputRef.current.selectionEnd = inputRef.current.value.length;
        }
      }, 100);
    }
  }, [sidebarContext, sidebarOpen, setSidebarContext]);

  // Focus input when sidebar opens
  useEffect(() => {
    if (sidebarOpen) {
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [sidebarOpen]);

  const handleSend = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed || isStreaming) return;

    if (!apiKey) {
      setSettingsOpen(true);
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: trimmed,
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsStreaming(true);
    setStreamingContent('');

    try {
      const chatMessages = newMessages.map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      }));

      const finalContent = await chatWithAI(apiKey, aiModel, chatMessages, (text) => {
        setStreamingContent(text);
      });

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: finalContent,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat failed:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, something went wrong. Please check your API key and try again.',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsStreaming(false);
      setStreamingContent('');
    }
  }, [input, isStreaming, apiKey, aiModel, messages, setSettingsOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClear = () => {
    setMessages([]);
    setStreamingContent('');
  };

  if (!sidebarOpen) return null;

  return (
    <div
      className="animate-slide-in"
      style={{
        width: 'var(--sidebar-width)',
        height: '100%',
        borderLeft: '1px solid var(--color-border)',
        background: 'var(--color-bg)',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        position: 'relative',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          borderBottom: '1px solid var(--color-border)',
          background: 'var(--color-bg-secondary)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontFamily: 'var(--font-sans)',
            fontSize: '13px',
            fontWeight: 600,
            color: 'var(--color-text)',
          }}
        >
          <Sparkles size={15} style={{ color: 'var(--color-accent)' }} />
          AI Assistant
        </div>
        <div style={{ display: 'flex', gap: '4px' }}>
          <button
            onClick={handleClear}
            title="Clear chat"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '28px',
              height: '28px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: 'transparent',
              color: 'var(--color-text-tertiary)',
              cursor: 'pointer',
              transition: 'all 0.1s',
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
            <Trash2 size={14} />
          </button>
          <button
            onClick={() => setSidebarOpen(false)}
            title="Close sidebar"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '28px',
              height: '28px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: 'transparent',
              color: 'var(--color-text-tertiary)',
              cursor: 'pointer',
              transition: 'all 0.1s',
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
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div
        style={{
          flex: 1,
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {messages.length === 0 && !isStreaming && (
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '32px',
              gap: '12px',
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: 'var(--color-accent-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-accent)',
              }}
            >
              <Sparkles size={22} />
            </div>
            <div
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '14px',
                fontWeight: 600,
                color: 'var(--color-text)',
              }}
            >
              AI Assistant
            </div>
            <div
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '12px',
                color: 'var(--color-text-tertiary)',
                textAlign: 'center',
                lineHeight: 1.5,
                maxWidth: '240px',
              }}
            >
              Ask me anything about your writing. Select text and press{' '}
              <kbd
                style={{
                  padding: '1px 5px',
                  borderRadius: '4px',
                  border: '1px solid var(--color-border)',
                  background: 'var(--color-bg-secondary)',
                  fontSize: '11px',
                  fontFamily: 'var(--font-sans)',
                }}
              >
                ⌘L
              </kbd>{' '}
              to chat about it.
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <ChatMessage
            key={msg.id}
            role={msg.role}
            content={msg.content}
            onInsertToEditor={msg.role === 'assistant' ? onInsertToEditor : undefined}
          />
        ))}

        {isStreaming && streamingContent && (
          <ChatMessage
            role="assistant"
            content={streamingContent}
            isStreaming={true}
          />
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div
        style={{
          padding: '12px 16px',
          borderTop: '1px solid var(--color-border)',
          background: 'var(--color-bg)',
        }}
      >
        <div
          style={{
            display: 'flex',
            gap: '8px',
            alignItems: 'flex-end',
          }}
        >
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask AI anything..."
            rows={1}
            style={{
              flex: 1,
              resize: 'none',
              padding: '10px 12px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              background: 'var(--color-surface)',
              color: 'var(--color-text)',
              fontSize: '13px',
              fontFamily: 'var(--font-sans)',
              lineHeight: 1.5,
              outline: 'none',
              maxHeight: '120px',
              transition: 'border-color 0.15s ease',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-accent)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-border)';
            }}
            onInput={(e) => {
              const target = e.currentTarget;
              target.style.height = 'auto';
              target.style.height = Math.min(target.scrollHeight, 120) + 'px';
            }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isStreaming}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              background:
                input.trim() && !isStreaming
                  ? 'var(--color-accent)'
                  : 'var(--color-bg-tertiary)',
              color:
                input.trim() && !isStreaming
                  ? 'var(--color-accent-text)'
                  : 'var(--color-text-tertiary)',
              cursor:
                input.trim() && !isStreaming ? 'pointer' : 'not-allowed',
              transition: 'all 0.15s ease',
              flexShrink: 0,
            }}
          >
            <Send size={15} />
          </button>
        </div>

        <div
          style={{
            marginTop: '6px',
            fontSize: '10px',
            color: 'var(--color-text-tertiary)',
            fontFamily: 'var(--font-sans)',
            textAlign: 'center',
          }}
        >
          Press Enter to send, Shift+Enter for new line
        </div>
      </div>
    </div>
  );
}
