import {
  FileText,
  FolderOpen,
  Save,
  Download,
  FileDown,
  ClipboardCopy,
  PanelRightOpen,
  PanelRightClose,
  Settings,
  Sparkles,
} from 'lucide-react';
import { ThemeToggle } from '@/components/Theme/ThemeToggle';
import { useAppStore } from '@/lib/store';

interface TopToolbarProps {
  onNew: () => void;
  onOpen: () => void;
  onSave: () => void;
  onSaveAs: () => void;
  onExportMarkdown: () => void;
  onExportPdf: () => void;
  onCopyMarkdown: () => void;
}

function ToolbarButton({
  icon,
  label,
  onClick,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  accent?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      title={label}
      className="no-drag"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '5px',
        padding: '5px 9px',
        borderRadius: 'var(--radius-sm)',
        border: 'none',
        background: 'transparent',
        color: accent ? 'var(--color-accent)' : 'var(--color-text-secondary)',
        fontSize: '12px',
        fontFamily: 'var(--font-sans)',
        fontWeight: 500,
        cursor: 'pointer',
        transition: 'all 0.1s ease',
        whiteSpace: 'nowrap',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'var(--color-surface-hover)';
        e.currentTarget.style.color = accent
          ? 'var(--color-accent-hover)'
          : 'var(--color-text)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'transparent';
        e.currentTarget.style.color = accent
          ? 'var(--color-accent)'
          : 'var(--color-text-secondary)';
      }}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

export function TopToolbar({
  onNew,
  onOpen,
  onSave,
  onSaveAs,
  onExportMarkdown,
  onExportPdf,
  onCopyMarkdown,
}: TopToolbarProps) {
  const {
    sidebarOpen,
    toggleSidebar,
    currentFilePath,
    isModified,
    setSettingsOpen,
  } = useAppStore();

  const fileName = currentFilePath
    ? currentFilePath.split('/').pop()
    : 'Untitled';

  return (
    <div
      className="drag-region"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '46px',
        padding: '0 16px 0 80px', /* 80px left for macOS traffic lights */
        borderBottom: '1px solid var(--color-border-subtle)',
        background: 'var(--color-bg)',
        flexShrink: 0,
        zIndex: 50,
        transition: 'background 0.2s ease',
      }}
    >
      {/* Left: File info */}
      <div
        className="no-drag"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '13px',
            fontWeight: 600,
            color: 'var(--color-text)',
            letterSpacing: '-0.01em',
          }}
        >
          {fileName}
        </span>
        {isModified && (
          <span
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: 'var(--color-accent)',
            }}
          />
        )}
      </div>

      {/* Center: File actions */}
      <div
        className="no-drag"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '2px',
        }}
      >
        <ToolbarButton icon={<FileText size={14} />} label="New" onClick={onNew} />
        <ToolbarButton icon={<FolderOpen size={14} />} label="Open" onClick={onOpen} />
        <ToolbarButton icon={<Save size={14} />} label="Save" onClick={onSave} />

        <div
          style={{
            width: '1px',
            height: '18px',
            background: 'var(--color-border)',
            margin: '0 6px',
          }}
        />

        <ToolbarButton
          icon={<ClipboardCopy size={14} />}
          label="Copy MD"
          onClick={onCopyMarkdown}
        />
        <ToolbarButton
          icon={<FileDown size={14} />}
          label="Export MD"
          onClick={onExportMarkdown}
        />
        <ToolbarButton
          icon={<Download size={14} />}
          label="Export PDF"
          onClick={onExportPdf}
        />
      </div>

      {/* Right: AI sidebar + Theme + Settings */}
      <div
        className="no-drag"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}
      >
        <ToolbarButton
          icon={<Sparkles size={14} />}
          label="AI"
          onClick={toggleSidebar}
          accent
        />

        <button
          onClick={toggleSidebar}
          title={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
          className="no-drag"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '30px',
            height: '30px',
            borderRadius: 'var(--radius-sm)',
            border: 'none',
            background: sidebarOpen ? 'var(--color-accent-subtle)' : 'transparent',
            color: sidebarOpen ? 'var(--color-accent)' : 'var(--color-text-tertiary)',
            cursor: 'pointer',
            transition: 'all 0.1s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = sidebarOpen
              ? 'var(--color-accent-subtle)'
              : 'var(--color-surface-hover)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = sidebarOpen
              ? 'var(--color-accent-subtle)'
              : 'transparent';
          }}
        >
          {sidebarOpen ? <PanelRightClose size={16} /> : <PanelRightOpen size={16} />}
        </button>

        <ThemeToggle />

        <button
          onClick={() => setSettingsOpen(true)}
          title="Settings"
          className="no-drag"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '30px',
            height: '30px',
            borderRadius: 'var(--radius-sm)',
            border: 'none',
            background: 'transparent',
            color: 'var(--color-text-tertiary)',
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
          <Settings size={15} />
        </button>
      </div>
    </div>
  );
}
