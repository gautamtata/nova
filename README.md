# Inkwell

> One Shotted with Opus 4.6

An AI-first minimal text editor for macOS. Think Notion's slash commands meets Superhuman's AI polish meets Cursor's sidebar — wrapped in a beautiful, distraction-free writing environment.

---

## Screenshots

| Light Mode | Dark Mode | AI Sidebar |
|:---:|:---:|:---:|
| Warm parchment tones | Deep charcoal with golden accents | Streaming AI chat panel |

## Features

### Rich Text Editor
- Full markdown editing powered by **Tiptap v3** (ProseMirror)
- Headings (H1–H3), bold, italic, underline, strikethrough
- Bullet lists, numbered lists, blockquotes
- Syntax-highlighted code blocks via `lowlight`
- Horizontal rules, links, and typography helpers
- Inline markdown shortcuts (e.g. `**bold**`, `# heading`)

### Slash Commands
Type `/` anywhere to open a floating command palette:
- `/h1`, `/h2`, `/h3` — Insert headings
- `/bullet`, `/numbered` — Create lists
- `/code` — Add a code block
- `/quote` — Insert a blockquote
- `/divider` — Horizontal rule
- `/ai` — Let AI continue writing from your cursor

### AI Bubble Menu (Text Selection)
Select any text to reveal a sleek popover with:
- **Copy** / **Cut** — Standard clipboard actions
- **AI Actions** — Rewrite, Simplify, Improve Writing, Fix Grammar, Make Shorter, Make Longer, Formal Tone, Casual Tone
- AI results stream in real-time with Accept/Reject controls
- **Send to Chat (⌘L)** — Push selected text to the AI sidebar for deeper discussion

### AI Chat Sidebar
- Full conversational AI assistant in a right-side panel
- Toggle with **⌘L** or the toolbar button
- Select text + ⌘L pre-populates the chat with your selection as context
- Streaming responses with typing indicator
- **Copy** and **Insert into Editor** buttons on every AI response
- Clear chat, close sidebar controls

### AI Provider
- Powered by **OpenRouter** via the **Vercel AI SDK** (`streamText`)
- Supports multiple models out of the box:
  - Claude Sonnet 4, Claude 3.5 Sonnet
  - GPT-4o, GPT-4o Mini
  - Gemini 2.0 Flash
  - Llama 3.3 70B
- API key stored locally on your device (never leaves your machine)

### Local File Storage
- **New / Open / Save / Save As** with native macOS file dialogs
- Files stored as `.md` markdown on disk
- Auto-save every 30 seconds when a file path is set
- Window title reflects current file name with unsaved indicator

### Export
- **Copy as Markdown** — One-click clipboard copy
- **Export as Markdown** — Save dialog for `.md` files
- **Export as PDF** — Native Electron `printToPDF` with styling

### Theme System
- **Light mode** — Warm parchment background (`#FAF8F5`), rich ink text, amber accents
- **Dark mode** — Deep charcoal (`#141414`), warm cream text, golden accents
- **System mode** — Follows your macOS appearance preference
- Smooth CSS transitions between themes
- Preference persisted across sessions

### Keyboard Shortcuts
| Shortcut | Action |
|----------|--------|
| `⌘L` | Toggle AI sidebar / send selected text to chat |
| `⌘S` | Save |
| `⌘⇧S` | Save As |
| `⌘O` | Open file |
| `⌘N` | New file |
| `/` | Slash command menu |
| `⌘B` | Bold |
| `⌘I` | Italic |
| `⌘⇧X` | Strikethrough |

### Design
Built following a **luxury editorial minimal** aesthetic:
- **Typography**: Newsreader (serif) for editor content, JetBrains Mono for code, DM Sans for UI
- **Layout**: Full-width distraction-free editor, no visible chrome
- Hidden title bar with native macOS traffic light integration
- Glass-morphism AI sidebar with slide-in animation
- Word & character count indicator

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Desktop Shell | Electron Forge + Vite |
| Frontend | React 19 + TypeScript |
| Editor | Tiptap v3 (ProseMirror) |
| AI | Vercel AI SDK + OpenRouter |
| Styling | Tailwind CSS 4 + CSS Variables |
| State | Zustand |
| Icons | Lucide React |
| Fonts | Google Fonts (Newsreader, JetBrains Mono, DM Sans) |

## Getting Started

### Prerequisites
- Node.js 18+
- npm or bun

### Development
```bash
# Install dependencies
npm install
# or
bun install

# Start development server
npm run start
```

### Build
```bash
# Package the app
npm run package

# Create distributable (DMG on macOS)
npm run make
```

The DMG will be in `out/make/Inkwell-1.0.0-arm64.dmg`.

### Configuration
On first launch, the Settings modal will prompt for your **OpenRouter API key**:
1. Get a key from [openrouter.ai/keys](https://openrouter.ai/keys)
2. Paste it into the Settings modal
3. Select your preferred AI model
4. Start writing

---

## Project Structure

```
src/
├── main.ts                              # Electron main process
├── preload.ts                           # Context bridge (IPC)
└── renderer/
    ├── main.tsx                         # React entry point
    ├── App.tsx                          # Root component
    ├── styles/globals.css               # Theme variables, editor styles
    ├── lib/
    │   ├── store.ts                     # Zustand state management
    │   └── ai-client.ts                # OpenRouter + AI SDK
    └── components/
        ├── Editor/
        │   ├── TiptapEditor.tsx         # Main editor wrapper
        │   ├── extensions.ts            # Tiptap extension config
        │   ├── slash-commands.ts        # Slash command definitions
        │   ├── SlashCommandMenu.tsx     # Slash dropdown UI
        │   ├── suggestion.tsx           # Tippy.js suggestion renderer
        │   └── AIBubbleMenu.tsx         # Selection popover with AI
        ├── Sidebar/
        │   ├── AISidebar.tsx            # AI chat panel
        │   └── ChatMessage.tsx          # Message bubble component
        ├── Toolbar/
        │   ├── TopToolbar.tsx           # File/export/theme toolbar
        │   └── WordCount.tsx            # Word & char count
        ├── Theme/
        │   ├── ThemeProvider.tsx         # Light/dark/system logic
        │   └── ThemeToggle.tsx          # Theme switcher UI
        └── Settings/
            └── SettingsModal.tsx         # API key + model config
```

## License

MIT
