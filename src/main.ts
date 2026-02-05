import { app, BrowserWindow, ipcMain, dialog, nativeTheme } from 'electron';
import path from 'node:path';
import fs from 'node:fs';
import started from 'electron-squirrel-startup';

if (started) {
  app.quit();
}

let mainWindow: BrowserWindow | null = null;
let currentFilePath: string | null = null;

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    titleBarStyle: 'hiddenInset',
    trafficLightPosition: { x: 16, y: 16 },
    backgroundColor: '#FAF8F5',
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`),
    );
  }

  updateTitle();
};

function updateTitle() {
  if (!mainWindow) return;
  const fileName = currentFilePath ? path.basename(currentFilePath) : 'Untitled';
  mainWindow.setTitle(`${fileName} — Nova`);
}

// --- IPC Handlers ---

ipcMain.handle('file:new', async () => {
  currentFilePath = null;
  updateTitle();
  return { success: true };
});

ipcMain.handle('file:open', async () => {
  const result = await dialog.showOpenDialog(mainWindow!, {
    properties: ['openFile'],
    filters: [
      { name: 'Markdown', extensions: ['md', 'markdown', 'txt'] },
      { name: 'All Files', extensions: ['*'] },
    ],
  });

  if (result.canceled || result.filePaths.length === 0) {
    return { success: false, canceled: true };
  }

  const filePath = result.filePaths[0];
  const content = fs.readFileSync(filePath, 'utf-8');
  currentFilePath = filePath;
  updateTitle();

  return { success: true, content, filePath };
});

ipcMain.handle('file:save', async (_event, content: string) => {
  if (!currentFilePath) {
    return await saveAs(content);
  }

  fs.writeFileSync(currentFilePath, content, 'utf-8');
  updateTitle();
  return { success: true, filePath: currentFilePath };
});

ipcMain.handle('file:saveAs', async (_event, content: string) => {
  return await saveAs(content);
});

async function saveAs(content: string) {
  const result = await dialog.showSaveDialog(mainWindow!, {
    defaultPath: currentFilePath || 'untitled.md',
    filters: [
      { name: 'Markdown', extensions: ['md'] },
      { name: 'All Files', extensions: ['*'] },
    ],
  });

  if (result.canceled || !result.filePath) {
    return { success: false, canceled: true };
  }

  fs.writeFileSync(result.filePath, content, 'utf-8');
  currentFilePath = result.filePath;
  updateTitle();

  return { success: true, filePath: result.filePath };
}

ipcMain.handle('file:exportPdf', async () => {
  if (!mainWindow) return { success: false };

  const result = await dialog.showSaveDialog(mainWindow, {
    defaultPath: currentFilePath
      ? currentFilePath.replace(/\.(md|markdown|txt)$/, '.pdf')
      : 'untitled.pdf',
    filters: [{ name: 'PDF', extensions: ['pdf'] }],
  });

  if (result.canceled || !result.filePath) {
    return { success: false, canceled: true };
  }

  const pdfData = await mainWindow.webContents.printToPDF({
    printBackground: true,
    marginsType: 0,
  });

  fs.writeFileSync(result.filePath, pdfData);
  return { success: true, filePath: result.filePath };
});

ipcMain.handle('theme:get-native', () => {
  return nativeTheme.shouldUseDarkColors ? 'dark' : 'light';
});

ipcMain.handle('settings:get', (_event, key: string) => {
  const settingsPath = path.join(app.getPath('userData'), 'settings.json');
  try {
    const data = JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));
    return data[key] ?? null;
  } catch {
    return null;
  }
});

ipcMain.handle('settings:set', (_event, key: string, value: unknown) => {
  const settingsPath = path.join(app.getPath('userData'), 'settings.json');
  let data: Record<string, unknown> = {};
  try {
    data = JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));
  } catch {
    // fresh settings
  }
  data[key] = value;
  fs.writeFileSync(settingsPath, JSON.stringify(data, null, 2), 'utf-8');
  return true;
});

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
