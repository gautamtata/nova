import { useState, useEffect } from 'react';
import { X, Key, Bot, Check } from 'lucide-react';
import { useAppStore } from '@/lib/store';

const electronAPI = typeof window !== 'undefined' ? (window as any).electronAPI : null;

const MODELS = [
  { id: 'anthropic/claude-sonnet-4', label: 'Claude Sonnet 4' },
  { id: 'anthropic/claude-3.5-sonnet', label: 'Claude 3.5 Sonnet' },
  { id: 'openai/gpt-4o', label: 'GPT-4o' },
  { id: 'openai/gpt-4o-mini', label: 'GPT-4o Mini' },
  { id: 'google/gemini-2.0-flash-001', label: 'Gemini 2.0 Flash' },
  { id: 'meta-llama/llama-3.3-70b-instruct', label: 'Llama 3.3 70B' },
];

export function SettingsModal() {
  const {
    settingsOpen,
    setSettingsOpen,
    apiKey,
    setApiKey,
    aiModel,
    setAiModel,
  } = useAppStore();

  const [localKey, setLocalKey] = useState(apiKey || '');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (settingsOpen) {
      const loadKey = async () => {
        if (!electronAPI?.settings) return;
        const stored = (await electronAPI.settings.get('apiKey')) as string | null;
        if (stored) {
          setLocalKey(stored);
          setApiKey(stored);
        }
        const storedModel = (await electronAPI.settings.get('aiModel')) as string | null;
        if (storedModel) {
          setAiModel(storedModel);
        }
      };
      loadKey();
    }
  }, [settingsOpen, setApiKey, setAiModel]);

  const handleSave = async () => {
    setApiKey(localKey);
    await electronAPI?.settings?.set('apiKey', localKey);
    await electronAPI?.settings?.set('aiModel', aiModel);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      setSettingsOpen(false);
    }, 1000);
  };

  if (!settingsOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        backdropFilter: 'blur(4px)',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) setSettingsOpen(false);
      }}
    >
      <div
        className="animate-fade-in"
        style={{
          background: 'var(--color-surface)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-lg)',
          width: '480px',
          maxWidth: '90vw',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '15px',
              fontWeight: 600,
              color: 'var(--color-text)',
            }}
          >
            Settings
          </span>
          <button
            onClick={() => setSettingsOpen(false)}
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
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '20px' }}>
          {/* API Key */}
          <div style={{ marginBottom: '20px' }}>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontFamily: 'var(--font-sans)',
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--color-text)',
                marginBottom: '8px',
              }}
            >
              <Key size={14} style={{ color: 'var(--color-accent)' }} />
              OpenRouter API Key
            </label>
            <input
              type="password"
              value={localKey}
              onChange={(e) => setLocalKey(e.target.value)}
              placeholder="sk-or-..."
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                background: 'var(--color-bg)',
                color: 'var(--color-text)',
                fontSize: '13px',
                fontFamily: 'var(--font-mono)',
                outline: 'none',
                transition: 'border-color 0.15s ease',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-accent)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-border)';
              }}
            />
            <p
              style={{
                marginTop: '6px',
                fontSize: '11px',
                color: 'var(--color-text-tertiary)',
                fontFamily: 'var(--font-sans)',
                lineHeight: 1.4,
              }}
            >
              Get your API key from{' '}
              <span style={{ color: 'var(--color-accent)', fontWeight: 500 }}>
                openrouter.ai/keys
              </span>
              . Your key is stored locally on this device.
            </p>
          </div>

          {/* Model Selection */}
          <div style={{ marginBottom: '24px' }}>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontFamily: 'var(--font-sans)',
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--color-text)',
                marginBottom: '8px',
              }}
            >
              <Bot size={14} style={{ color: 'var(--color-accent)' }} />
              AI Model
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {MODELS.map((model) => (
                <button
                  key={model.id}
                  onClick={() => setAiModel(model.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    border:
                      aiModel === model.id
                        ? '1px solid var(--color-accent)'
                        : '1px solid var(--color-border)',
                    background:
                      aiModel === model.id
                        ? 'var(--color-accent-subtle)'
                        : 'var(--color-bg)',
                    color: 'var(--color-text)',
                    fontSize: '13px',
                    fontFamily: 'var(--font-sans)',
                    cursor: 'pointer',
                    transition: 'all 0.1s ease',
                    textAlign: 'left',
                  }}
                >
                  <span>{model.label}</span>
                  {aiModel === model.id && (
                    <Check size={14} style={{ color: 'var(--color-accent)' }} />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Save button */}
          <button
            onClick={handleSave}
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              background: saved ? 'var(--color-success)' : 'var(--color-accent)',
              color: saved ? '#FFFFFF' : 'var(--color-accent-text)',
              fontSize: '13px',
              fontFamily: 'var(--font-sans)',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            {saved ? (
              <>
                <Check size={14} />
                Saved!
              </>
            ) : (
              'Save Settings'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
