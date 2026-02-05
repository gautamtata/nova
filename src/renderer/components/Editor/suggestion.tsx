import { ReactRenderer } from '@tiptap/react';
import tippy, { type Instance } from 'tippy.js';
import { SlashCommandMenu, type SlashCommandMenuRef } from './SlashCommandMenu';
import { slashCommands, type SlashCommandItem } from './slash-commands';

export function getSuggestionConfig() {
  return {
    items: ({ query }: { query: string }): SlashCommandItem[] => {
      return slashCommands.filter((item) =>
        item.title.toLowerCase().includes(query.toLowerCase()),
      );
    },

    render: () => {
      let component: ReactRenderer<SlashCommandMenuRef> | null = null;
      let popup: Instance[] | null = null;

      return {
        onStart: (props: any) => {
          component = new ReactRenderer(SlashCommandMenu, {
            props,
            editor: props.editor,
          });

          if (!props.clientRect) return;

          popup = tippy('body', {
            getReferenceClientRect: props.clientRect,
            appendTo: () => document.body,
            content: component.element,
            showOnCreate: true,
            interactive: true,
            trigger: 'manual',
            placement: 'bottom-start',
            animation: 'fade',
            duration: 100,
          });
        },

        onUpdate: (props: any) => {
          component?.updateProps(props);

          if (!props.clientRect) return;

          popup?.[0]?.setProps({
            getReferenceClientRect: props.clientRect,
          });
        },

        onKeyDown: (props: any) => {
          if (props.event.key === 'Escape') {
            popup?.[0]?.hide();
            return true;
          }

          return component?.ref?.onKeyDown(props) ?? false;
        },

        onExit: () => {
          popup?.[0]?.destroy();
          component?.destroy();
        },
      };
    },
  };
}
