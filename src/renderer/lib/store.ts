import { create } from 'zustand';

export type Theme = 'light' | 'dark' | 'system';

interface AppState {
  // Theme
  theme: Theme;
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
  setResolvedTheme: (resolved: 'light' | 'dark') => void;

  // Sidebar
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;

  // Sidebar context (text sent via Cmd+L)
  sidebarContext: string | null;
  setSidebarContext: (context: string | null) => void;

  // File state
  currentFilePath: string | null;
  isModified: boolean;
  setCurrentFilePath: (path: string | null) => void;
  setIsModified: (modified: boolean) => void;

  // AI
  apiKey: string | null;
  setApiKey: (key: string | null) => void;
  aiModel: string;
  setAiModel: (model: string) => void;

  // Settings modal
  settingsOpen: boolean;
  setSettingsOpen: (open: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  theme: 'system',
  resolvedTheme: 'light',
  setTheme: (theme) => set({ theme }),
  setResolvedTheme: (resolved) => set({ resolvedTheme: resolved }),

  sidebarOpen: false,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  sidebarContext: null,
  setSidebarContext: (context) => set({ sidebarContext: context }),

  currentFilePath: null,
  isModified: false,
  setCurrentFilePath: (path) => set({ currentFilePath: path }),
  setIsModified: (modified) => set({ isModified: modified }),

  apiKey: null,
  setApiKey: (key) => set({ apiKey: key }),
  aiModel: 'anthropic/claude-sonnet-4',
  setAiModel: (model) => set({ aiModel: model }),

  settingsOpen: false,
  setSettingsOpen: (open) => set({ settingsOpen: open }),
}));
