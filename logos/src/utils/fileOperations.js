/**
 * Utilities for handling markdown file operations
 */

/**
 * Parse markdown content into blocks
 * Each block corresponds to a logical markdown block (paragraph, heading, list, etc.)
 * @param {string} markdownContent - Raw markdown content
 * @returns {Array} Array of block objects
 */
export const parseMarkdownToBlocks = (markdownContent) => {
  if (!markdownContent) return [];

  // Split the content by double newlines (which typically separate markdown blocks)
  const blockStrings = markdownContent.split(/\n\n+/);
  
  // Convert each string into a block object
  return blockStrings
    .filter(block => block.trim().length > 0) // Remove empty blocks
    .map((blockContent, index) => ({
      id: Date.now() + index, // Generate unique ID
      content: blockContent.trim(),
    }));
};

/**
 * Convert blocks back to markdown content
 * @param {Array} blocks - Array of block objects
 * @returns {string} Markdown content
 */
export const blocksToMarkdown = (blocks) => {
  return blocks
    .map(block => block.content)
    .join('\n\n');
};

/**
 * Save markdown to a file using the File System Access API
 * @param {string} content - Markdown content to save
 * @param {string} suggestedName - Suggested file name
 * @returns {Promise<string>} File name
 */
export const saveMarkdownFile = async (content, suggestedName = 'note.md') => {
  try {
    // Check if the File System Access API is available
    if (!('showSaveFilePicker' in window)) {
      throw new Error('File System Access API is not supported in this browser');
    }

    const options = {
      suggestedName,
      types: [{
        description: 'Markdown Files',
        accept: { 'text/markdown': ['.md'] }
      }]
    };

    const fileHandle = await window.showSaveFilePicker(options);
    const writable = await fileHandle.createWritable();
    await writable.write(content);
    await writable.close();

    return fileHandle.name;
  } catch (error) {
    console.error('Error saving file:', error);
    throw error;
  }
};

/**
 * Open and read a markdown file using the File System Access API
 * @returns {Promise<Object>} Object containing the file content and name
 */
export const openMarkdownFile = async () => {
  try {
    // Check if the File System Access API is available
    if (!('showOpenFilePicker' in window)) {
      throw new Error('File System Access API is not supported in this browser');
    }

    const options = {
      types: [{
        description: 'Markdown Files',
        accept: { 'text/markdown': ['.md'] }
      }],
      multiple: false
    };

    const [fileHandle] = await window.showOpenFilePicker(options);
    const file = await fileHandle.getFile();
    const content = await file.text();

    return {
      content,
      name: file.name,
      handle: fileHandle // Store for future save operations
    };
  } catch (error) {
    console.error('Error opening file:', error);
    throw error;
  }
}; 