import React, { useState, useEffect } from 'react';
import MarkdownBlock from './MarkdownBlock';
import OptionsPanel from './OptionsPanel';
import ContextMenu from './ContextMenu';
import Notification from './Notification';
import { parseMarkdownToBlocks, blocksToMarkdown, saveMarkdownFile, openMarkdownFile } from '../utils/fileOperations';

const defaultSettings = {
  fontSize: '16',
  lineHeight: '1.6',
  fontFamily: 'system-ui',
  maxWidth: '800',
  blockSpacing: '16',
  theme: 'light',
};

const getCaretCoordinates = () => {
  const selection = window.getSelection();
  if (!selection.rangeCount) return null;

  const range = selection.getRangeAt(0);
  const rect = range.getBoundingClientRect();
  
  return {
    x: rect.left,
    y: rect.bottom // Position below the caret
  };
};

const MarkdownEditor = () => {
  const [blocks, setBlocks] = useState([
    { id: 1, content: '# Welcome to Logos\n\nThis is a markdown editor that works like Obsidian. Click on any block to edit it.' },
    { id: 2, content: '## Features\n\n- Inline editing\n- Markdown preview\n- Support for **bold**, *italic*, and [links](https://example.com)\n- Lists and checkboxes' },
  ]);

  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const [settings, setSettings] = useState(defaultSettings);
  const [contextMenu, setContextMenu] = useState(null);
  const [currentFile, setCurrentFile] = useState({
    name: 'Untitled.md',
    path: null,
    handle: null,
    unsavedChanges: false
  });
  const [notification, setNotification] = useState(null);

  const handleBlockUpdate = (blockId, newContent, createNewBlock = false) => {
    // Update the current block content
    if (newContent.trim() === '') {
      setBlocks(blocks.filter(block => block.id !== blockId));
      return; // Exit early if block was removed
    } else {
      setBlocks(prevBlocks => prevBlocks.map(block => 
        block.id === blockId ? { ...block, content: newContent } : block
      ));
    }

    // If we need to create a new block
    if (createNewBlock) {
      const newId = Math.max(...blocks.map(b => b.id)) + 1;
      const newBlock = { id: newId, content: '', isEditing: true };
      const blockIndex = blocks.findIndex(block => block.id === blockId);
      
      // Make sure we're working with the updated state
      setBlocks(prevBlocks => {
        const updatedBlocks = [
          ...prevBlocks.slice(0, blockIndex + 1),
          newBlock,
          ...prevBlocks.slice(blockIndex + 1)
        ];
        
        // Set all other blocks to not editing
        return updatedBlocks.map(block => 
          block.id === newId ? block : { ...block, isEditing: false }
        );
      });

      // Focus on the new block
      setTimeout(() => {
        const newBlockElement = document.getElementById(`block-${newId}`);
        if (newBlockElement) {
          newBlockElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          newBlockElement.focus();
        }
      }, 0);
    }
  };

  const addNewBlock = (content = 'New block') => {
    const newId = Math.max(...blocks.map(b => b.id)) + 1;
    setBlocks([...blocks, { id: newId, content }]);
  };

  const handleSettingChange = (setting, value) => {
    setSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  const handleContextMenu = (e) => {
    e.preventDefault();
    
    // Try to get caret coordinates if text is selected
    const caretPos = getCaretCoordinates();
    
    setContextMenu({
      x: caretPos ? caretPos.x : e.clientX,
      y: caretPos ? caretPos.y : e.clientY
    });
  };

  const handleBlockSelect = (blockType) => {
    addNewBlock(blockType.template);
    setContextMenu(null);
  };

  const handleNavigate = (blockId, direction) => {
    const blockIndex = blocks.findIndex(block => block.id === blockId);
    let targetIndex;

    if (direction === 'up') {
      // Navigate to the previous block if it exists
      targetIndex = blockIndex > 0 ? blockIndex - 1 : null;
    } else if (direction === 'down') {
      // Navigate to the next block if it exists
      targetIndex = blockIndex < blocks.length - 1 ? blockIndex + 1 : null;
    }

    if (targetIndex !== null) {
      const targetBlock = blocks[targetIndex];
      
      // Set all blocks' editing state, activating only the target block
      setBlocks(prevBlocks => prevBlocks.map((block, index) => 
        index === targetIndex ? { ...block, isEditing: true } : { ...block, isEditing: false }
      ));

      // Focus on the target block
      setTimeout(() => {
        const targetElement = document.getElementById(`block-${targetBlock.id}`);
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          targetElement.focus();
        }
      }, 0);
    }
  };

  // Display notification
  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
  };

  // Clear notification
  const clearNotification = () => {
    setNotification(null);
  };

  // Handle saving the current document
  const handleSaveFile = async () => {
    try {
      const markdownContent = blocksToMarkdown(blocks);
      const fileName = await saveMarkdownFile(markdownContent, currentFile.name);
      
      setCurrentFile(prev => ({
        ...prev,
        name: fileName,
        unsavedChanges: false
      }));
      
      // Display success notification
      showNotification(`File saved as ${fileName}`, 'success');
    } catch (error) {
      console.error('Failed to save file:', error);
      showNotification(`Failed to save file: ${error.message}`, 'error');
    }
  };

  // Handle opening a markdown document
  const handleOpenFile = async () => {
    // Check for unsaved changes
    if (currentFile.unsavedChanges) {
      const confirmOpen = window.confirm("You have unsaved changes. Are you sure you want to open a new file?");
      if (!confirmOpen) return;
    }

    try {
      const file = await openMarkdownFile();
      const newBlocks = parseMarkdownToBlocks(file.content);
      
      setBlocks(newBlocks);
      setCurrentFile({
        name: file.name,
        path: 'user selected', // File System API doesn't expose full path for security
        handle: file.handle,
        unsavedChanges: false
      });
      
      showNotification(`Opened ${file.name}`, 'info');
    } catch (error) {
      if (error.name !== 'AbortError') { // Don't show error if user cancelled
        console.error('Failed to open file:', error);
        showNotification(`Failed to open file: ${error.message}`, 'error');
      }
    }
  };

  // Add beforeunload handler to warn about unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (currentFile.unsavedChanges) {
        // Standard way of showing a confirmation dialog
        e.preventDefault();
        // Custom message (may not be displayed in some browsers for security reasons)
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [currentFile.unsavedChanges]);

  // Update document title when file changes
  useEffect(() => {
    document.title = `${currentFile.unsavedChanges ? '* ' : ''}${currentFile.name} - Logos`;
  }, [currentFile]);

  // Mark file as having unsaved changes when blocks change, but only
  // if we've already loaded a file (to avoid marking as changed on initial load)
  useEffect(() => {
    if (blocks.length > 0) {
      setCurrentFile(prev => ({
        ...prev,
        unsavedChanges: true
      }));
    }
  }, [blocks]);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--font-size', `${settings.fontSize}px`);
    root.style.setProperty('--line-height', settings.lineHeight);
    root.style.setProperty('--font-family', settings.fontFamily);
    root.style.setProperty('--max-width', `${settings.maxWidth}px`);
    root.style.setProperty('--block-spacing', `${settings.blockSpacing}px`);
    
    // Apply theme class to body
    document.body.className = `theme-${settings.theme}`;
    // Toggle dark mode class for Tailwind
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings]);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
      <div className="flex justify-between items-center fixed top-0 left-0 right-0 p-2 bg-white dark:bg-gray-800 z-50 shadow-md">
        <div className="flex space-x-2">
          <button 
            className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors duration-200"
            onClick={handleOpenFile}
          >
            Open
          </button>
          <button 
            className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded-md transition-colors duration-200"
            onClick={handleSaveFile}
          >
            Save
          </button>
        </div>
        
        <div className="text-gray-700 dark:text-gray-200 font-medium">
          {currentFile.unsavedChanges && <span className="text-red-500 mr-1">*</span>}
          {currentFile.name}
        </div>
        
        <button 
          className="p-2 bg-white dark:bg-gray-800 rounded-md shadow-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 flex items-center gap-2"
          onClick={() => setIsOptionsOpen(!isOptionsOpen)}
        >
          <span role="img" aria-label="settings">⚙️</span>
          <span className="text-gray-700 dark:text-gray-200">Options</span>
        </button>
      </div>
      
      <OptionsPanel 
        isOpen={isOptionsOpen}
        settings={settings}
        onSettingChange={handleSettingChange}
      />

      <div 
        className="mx-auto px-4 pt-16 pb-8 max-w-content"
        style={{
          '--block-spacing': `${settings.blockSpacing}px`
        }}
        onContextMenu={handleContextMenu}
      >
        {blocks.map(block => (
          <MarkdownBlock
            key={block.id}
            content={block.content}
            onUpdate={(newContent, createNewBlock) => handleBlockUpdate(block.id, newContent, createNewBlock)}
            id={`block-${block.id}`}
            isEditing={block.isEditing}
            onNavigate={(direction) => handleNavigate(block.id, direction)}
          />
        ))}
        <button 
          className="w-full py-4 px-4 mt-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200"
          onClick={() => addNewBlock()}
        >
          + Add Block
        </button>
      </div>

      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onSelect={handleBlockSelect}
          onClose={() => setContextMenu(null)}
        />
      )}

      {notification && (
        <Notification 
          message={notification.message}
          type={notification.type}
          onClose={clearNotification}
          duration={3000}
        />
      )}
    </div>
  );
};

export default MarkdownEditor; 