import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  file: {
    new: () => ipcRenderer.invoke('file:new'),
    open: () => ipcRenderer.invoke('file:open'),
    save: (content: string) => ipcRenderer.invoke('file:save', content),
    saveAs: (content: string) => ipcRenderer.invoke('file:saveAs', content),
    exportPdf: () => ipcRenderer.invoke('file:exportPdf'),
  },
  settings: {
    get: (key: string) => ipcRenderer.invoke('settings:get', key),
    set: (key: string, value: unknown) => ipcRenderer.invoke('settings:set', key, value),
  },
  theme: {
    getNative: () => ipcRenderer.invoke('theme:get-native'),
  },
});
