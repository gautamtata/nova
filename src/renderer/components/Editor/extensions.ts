import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import Highlight from '@tiptap/extension-highlight';
import Typography from '@tiptap/extension-typography';
import Link from '@tiptap/extension-link';
import { Markdown } from '@tiptap/markdown';
import { common, createLowlight } from 'lowlight';

const lowlight = createLowlight(common);

export function getExtensions() {
  return [
    StarterKit.configure({
      codeBlock: false, // we use code-block-lowlight instead
    }),
    Placeholder.configure({
      placeholder: 'Start writing, or press / for commands...',
    }),
    CodeBlockLowlight.configure({
      lowlight,
      defaultLanguage: 'plaintext',
    }),
    Highlight.configure({
      multicolor: false,
    }),
    Typography,
    Link.configure({
      openOnClick: false,
      HTMLAttributes: {
        rel: 'noopener noreferrer',
      },
    }),
    Markdown.configure({
      html: true,
      tightLists: true,
      bulletListMarker: '-',
    }),
  ];
}
