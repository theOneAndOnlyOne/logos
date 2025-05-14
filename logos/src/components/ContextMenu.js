import React, { useEffect, useRef } from 'react';

const blockTypes = [
  {
    category: 'Basic',
    items: [
      { id: 'text', label: 'Text', template: 'Type your text here' },
      { id: 'h1', label: 'Heading 1', template: '# Heading 1' },
      { id: 'h2', label: 'Heading 2', template: '## Heading 2' },
      { id: 'h3', label: 'Heading 3', template: '### Heading 3' },
    ]
  },
  {
    category: 'Lists',
    items: [
      { id: 'bullet', label: 'Bullet List', template: '- List item\n- Another item' },
      { id: 'numbered', label: 'Numbered List', template: '1. First item\n2. Second item' },
      { id: 'todo', label: 'Todo List', template: '- [ ] Task to do\n- [x] Completed task' },
      { id: 'toggle', label: 'Toggle List', template: '<details>\n  <summary>Click to expand</summary>\n  Hidden content here\n</details>' },
    ]
  },
  {
    category: 'Content',
    items: [
      { id: 'quote', label: 'Quote', template: '> Your quote here' },
      { id: 'code', label: 'Code Block', template: '```\nYour code here\n```' },
      { id: 'table', label: 'Table', template: '| Header 1 | Header 2 |\n|----------|----------|\n| Cell 1   | Cell 2   |' },
      { id: 'divider', label: 'Divider', template: '---' },
    ]
  }
];

const MENU_WIDTH = 256; // w-64 = 16rem = 256px
const MENU_PADDING = 16; // 1rem = 16px

const ContextMenu = ({ x, y, onSelect, onClose }) => {
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.context-menu')) {
        onClose();
      }
    };

    const handleScroll = () => {
      adjustMenuPosition();
    };

    document.addEventListener('click', handleClickOutside);
    document.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleScroll);

    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [onClose]);

  useEffect(() => {
    adjustMenuPosition();
  }, [x, y]);

  const adjustMenuPosition = () => {
    if (!menuRef.current) return;

    const menu = menuRef.current;
    const menuRect = menu.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Start with cursor position
    let finalX = x;
    let finalY = y;

    // Adjust for right edge
    if (x + menuRect.width > viewportWidth - MENU_PADDING) {
      finalX = viewportWidth - menuRect.width - MENU_PADDING;
    }

    // Adjust for bottom edge
    if (y + menuRect.height > viewportHeight - MENU_PADDING) {
      finalY = viewportHeight - menuRect.height - MENU_PADDING;
    }

    // Ensure menu doesn't go off the left or top edge
    finalX = Math.max(MENU_PADDING, finalX);
    finalY = Math.max(MENU_PADDING, finalY);

    menu.style.left = `${finalX}px`;
    menu.style.top = `${finalY}px`;
  };

  return (
    <div 
      ref={menuRef}
      className="context-menu fixed z-50 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 w-64"
      style={{ 
        top: `${y}px`, 
        left: `${x}px`,
        maxHeight: 'calc(100vh - 2rem)',
      }}
    >
      <div className="max-h-[calc(100vh-2rem)] overflow-y-auto">
        {blockTypes.map((category) => (
          <div key={category.category} className="border-b border-gray-200 dark:border-gray-700 last:border-0">
            <div className="sticky top-0 px-3 py-2 text-sm font-semibold text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 z-10">
              {category.category}
            </div>
            <div className="py-1">
              {category.items.map((item) => (
                <button
                  key={item.id}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-gray-700 flex items-center gap-2"
                  onClick={() => onSelect(item)}
                >
                  <span className="flex-1">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ContextMenu; 