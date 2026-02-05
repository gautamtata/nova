import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
  useCallback,
} from 'react';
import {
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Code2,
  Quote,
  Minus,
  Sparkles,
} from 'lucide-react';
import type { SlashCommandItem } from './slash-commands';

const iconMap: Record<string, React.ReactNode> = {
  'heading-1': <Heading1 size={16} />,
  'heading-2': <Heading2 size={16} />,
  'heading-3': <Heading3 size={16} />,
  list: <List size={16} />,
  'list-ordered': <ListOrdered size={16} />,
  code: <Code2 size={16} />,
  quote: <Quote size={16} />,
  minus: <Minus size={16} />,
  sparkles: <Sparkles size={16} />,
};

interface SlashCommandMenuProps {
  items: SlashCommandItem[];
  command: (item: SlashCommandItem) => void;
}

export interface SlashCommandMenuRef {
  onKeyDown: (props: { event: KeyboardEvent }) => boolean;
}

export const SlashCommandMenu = forwardRef<SlashCommandMenuRef, SlashCommandMenuProps>(
  ({ items, command }, ref) => {
    const [selectedIndex, setSelectedIndex] = useState(0);

    useEffect(() => {
      setSelectedIndex(0);
    }, [items]);

    const selectItem = useCallback(
      (index: number) => {
        const item = items[index];
        if (item) command(item);
      },
      [items, command],
    );

    useImperativeHandle(ref, () => ({
      onKeyDown: ({ event }: { event: KeyboardEvent }) => {
        if (event.key === 'ArrowUp') {
          setSelectedIndex((prev) => (prev + items.length - 1) % items.length);
          return true;
        }

        if (event.key === 'ArrowDown') {
          setSelectedIndex((prev) => (prev + 1) % items.length);
          return true;
        }

        if (event.key === 'Enter') {
          selectItem(selectedIndex);
          return true;
        }

        return false;
      },
    }));

    if (items.length === 0) return null;

    return (
      <div className="slash-menu animate-fade-in">
        {items.map((item, index) => (
          <button
            key={item.title}
            className={`slash-menu-item ${index === selectedIndex ? 'is-selected' : ''}`}
            onClick={() => selectItem(index)}
            onMouseEnter={() => setSelectedIndex(index)}
          >
            <span className="icon">
              {iconMap[item.icon] || <Sparkles size={16} />}
            </span>
            <span style={{ display: 'flex', flexDirection: 'column' }}>
              <span className="label">{item.title}</span>
              <span className="description">{item.description}</span>
            </span>
          </button>
        ))}
      </div>
    );
  },
);

SlashCommandMenu.displayName = 'SlashCommandMenu';
