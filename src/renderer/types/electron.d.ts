export interface ElectronAPI {
  file: {
    new: () => Promise<{ success: boolean }>;
    open: () => Promise<{ success: boolean; canceled?: boolean; content?: string; filePath?: string }>;
    save: (content: string) => Promise<{ success: boolean; canceled?: boolean; filePath?: string }>;
    saveAs: (content: string) => Promise<{ success: boolean; canceled?: boolean; filePath?: string }>;
    exportPdf: () => Promise<{ success: boolean; canceled?: boolean; filePath?: string }>;
  };
  settings: {
    get: (key: string) => Promise<unknown>;
    set: (key: string, value: unknown) => Promise<boolean>;
  };
  theme: {
    getNative: () => Promise<'light' | 'dark'>;
  };
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
