import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const MarkdownBlock = ({ content, onUpdate, id, isEditing: initialEditing, onNavigate }) => {
  const [isEditing, setIsEditing] = useState(initialEditing || false);
  const [editContent, setEditContent] = useState(content);
  const textareaRef = useRef(null);
  
  // Track if content has changed from what was provided
  const hasUnsavedChanges = editContent !== content;

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.selectionStart = textareaRef.current.value.length;
    }
  }, [isEditing]);

  // Update editing state when the prop changes
  useEffect(() => {
    setIsEditing(initialEditing || false);
  }, [initialEditing]);
  
  // Update local content when the prop changes
  useEffect(() => {
    setEditContent(content);
  }, [content]);

  // Helper function to check if a line is a list item
  const isListItem = line => {
    return /^(\s*)([-*+]|\d+\.)\s/.test(line);
  };

  // Helper function to get the indentation level of a list item
  const getIndentationLevel = line => {
    const match = line.match(/^(\s*)([-*+]|\d+\.)\s/);
    return match ? match[1].length : 0;
  };

  // Helper function to indent or outdent a list item
  const modifyListItemIndentation = (line, indentAction) => {
    if (!isListItem(line)) return line;
    
    if (indentAction === 'indent') {
      // Add 2 spaces to the start of the line for indenting
      return '  ' + line;
    } else if (indentAction === 'outdent') {
      // Remove up to 2 spaces from the start of the line for outdenting
      const currentIndent = getIndentationLevel(line);
      if (currentIndent >= 2) {
        return line.substring(2);
      }
    }
    return line;
  };

  // Central function to save content before focus changes
  const saveContent = () => {
    if (hasUnsavedChanges) {
      onUpdate(editContent);
      return true; // Content was saved
    }
    return false; // No changes to save
  };

  const handleClick = () => {
    setIsEditing(true);
  };

  const handleBlur = () => {
    saveContent();
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    // Handle Tab key for list indentation
    if (e.key === 'Tab') {
      e.preventDefault(); // Prevent default tab behavior
      
      const { selectionStart, selectionEnd, value } = e.target;
      const lines = value.split('\n');
      
      // Track where we are in the content as we go through each line
      let position = 0;
      let newSelectionStart = selectionStart;
      let newSelectionEnd = selectionEnd;

      // Determine which lines are affected by the selection
      let startLineIndex = -1;
      let endLineIndex = -1;
      
      for (let i = 0; i < lines.length; i++) {
        const lineLength = lines[i].length + 1; // +1 for the newline character
        
        if (startLineIndex === -1 && selectionStart <= position + lineLength) {
          startLineIndex = i;
        }
        
        if (endLineIndex === -1 && selectionEnd <= position + lineLength) {
          endLineIndex = i;
          break;
        }
        
        position += lineLength;
      }

      if (endLineIndex === -1) {
        endLineIndex = lines.length - 1;
      }

      // Apply indentation/outdentation to the selected lines
      for (let i = startLineIndex; i <= endLineIndex; i++) {
        // Only modify list items
        if (isListItem(lines[i])) {
          const originalLength = lines[i].length;
          
          if (e.shiftKey) {
            // Outdent
            lines[i] = modifyListItemIndentation(lines[i], 'outdent');
          } else {
            // Indent
            lines[i] = modifyListItemIndentation(lines[i], 'indent');
          }
          
          // Adjust selection positions based on length changes
          const lengthDiff = lines[i].length - originalLength;
          if (i < startLineIndex || (i === startLineIndex && selectionStart > position)) {
            newSelectionStart += lengthDiff;
          }
          if (i < endLineIndex || (i === endLineIndex && selectionEnd > position)) {
            newSelectionEnd += lengthDiff;
          }
        }
      }

      // Update the content with the modified lines
      const newContent = lines.join('\n');
      setEditContent(newContent);
      
      // Set updated selection after React updates the DOM
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.setSelectionRange(newSelectionStart, newSelectionEnd);
        }
      }, 0);
      
      return;
    }
    
    // Handle Enter key with special treatment for list items
    if (e.key === 'Enter') {
      const { selectionStart, value } = e.target;
      
      // Find the start of the current line
      let lineStart = selectionStart;
      while (lineStart > 0 && value[lineStart - 1] !== '\n') {
        lineStart--;
      }
      
      // Extract the current line content up to the cursor
      const currentLine = value.substring(lineStart, selectionStart);
      
      // Check if we're in a list item
      const listMatch = currentLine.match(/^(\s*)([-*+]|\d+\.)(\s+)(.*)$/);
      
      if (listMatch && !e.shiftKey) {
        e.preventDefault();
        
        const [, indent, listMarker, space, content] = listMatch;
        
        // If the list item is empty (except for the marker), convert it to a newline
        if (!content.trim()) {
          // Remove the empty list item and add a newline
          const newValue = 
            value.substring(0, lineStart) +
            '\n' + 
            value.substring(selectionStart);
          
          setEditContent(newValue);
          
          setTimeout(() => {
            if (textareaRef.current) {
              textareaRef.current.setSelectionRange(lineStart + 1, lineStart + 1);
            }
          }, 0);
        } else {
          // Continue the list with a new item
          let newItem;
          
          // For numbered lists, increment the number
          if (listMarker.match(/\d+\./)) {
            const num = parseInt(listMarker, 10);
            newItem = `${indent}${num + 1}.${space}`;
          } else {
            newItem = `${indent}${listMarker}${space}`;
          }
          
          const newValue = 
            value.substring(0, selectionStart) +
            '\n' + newItem +
            value.substring(selectionStart);
          
          setEditContent(newValue);
          
          const newCursorPos = selectionStart + 1 + newItem.length;
          setTimeout(() => {
            if (textareaRef.current) {
              textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
            }
          }, 0);
        }
        
        return;
      }
      
      if (e.shiftKey) {
        // Insert a newline within the same block
        const { selectionStart, selectionEnd } = e.target;
        const newValue = value.slice(0, selectionStart) + '\n' + value.slice(selectionEnd);
        setEditContent(newValue);
        e.target.setSelectionRange(selectionStart + 1, selectionStart + 1);
      } else {
        e.preventDefault();
        // Save content and create a new block
        saveContent();
        onUpdate(editContent, true); // Signal to create a new block
      }
    } else if (e.key === 'ArrowUp') {
      // Check if cursor is at the beginning of the first line
      const { selectionStart } = e.target;
      if (selectionStart === 0) {
        e.preventDefault();
        // Save content and navigate up
        saveContent();
        onNavigate && onNavigate('up');
      }
    } else if (e.key === 'ArrowDown') {
      // Check if cursor is at the end of the last line
      const { selectionStart, value } = e.target;
      if (selectionStart === value.length) {
        e.preventDefault();
        // Save content and navigate down
        saveContent();
        onNavigate && onNavigate('down');
      }
    }
  };

  const handleChange = (e) => {
    setEditContent(e.target.value);
  };

  const handleDelete = () => {
    onUpdate(''); // Signal to remove the block
  };

  return (
    <div 
      className={`relative my-[var(--block-spacing)] p-2 rounded-md transition-colors duration-200 group ${
        !isEditing ? 'hover:bg-gray-50 dark:hover:bg-gray-800 cursor-text' : ''
      }`}
      onClick={!isEditing ? handleClick : undefined}
      style={{
        fontSize: 'var(--font-size)',
        lineHeight: 'var(--line-height)',
        fontFamily: 'var(--font-family)'
      }}
      id={id}
    >
      {isEditing ? (
        <textarea
          ref={textareaRef}
          value={editContent}
          onChange={handleChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="w-full min-h-[2em] p-2 border rounded-md bg-white dark:bg-gray-800 dark:text-gray-200 font-mono resize-y focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
          style={{
            fontSize: 'inherit',
            lineHeight: 'inherit',
            fontFamily: 'inherit'
          }}
          rows={Math.max(editContent.split('\n').length, 1)}
        />
      ) : (
        <div 
          className="prose dark:prose-invert prose-sm sm:prose-base lg:prose-lg max-w-none"
          style={{
            fontSize: 'inherit',
            lineHeight: 'inherit',
            fontFamily: 'inherit',
            '--tw-prose-body': 'inherit',
            '--tw-prose-headings': 'inherit'
          }}
        >
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {content}
          </ReactMarkdown>
        </div>
      )}
      <button
        onClick={handleDelete}
        className="absolute top-2 right-2 text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        aria-label="Delete block"
      >
        &times;
      </button>
    </div>
  );
};

export default MarkdownBlock; 