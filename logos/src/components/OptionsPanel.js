import React from 'react';

const OptionsPanel = ({ isOpen, settings, onSettingChange }) => {
  return (
    <div className={`fixed top-[52px] right-0 w-80 h-[calc(100vh-52px)] bg-white dark:bg-gray-800 shadow-lg p-8 transform transition-transform duration-300 overflow-y-auto ${
      isOpen ? 'translate-x-0' : 'translate-x-full'
    } z-40`}>
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4 pb-2 border-b dark:border-gray-700">Text Settings</h3>
        <div className="mb-4">
          <label htmlFor="fontSize" className="block text-sm text-gray-600 dark:text-gray-300 mb-2">
            Font Size (px)
          </label>
          <input
            type="range"
            id="fontSize"
            min="12"
            max="24"
            value={settings.fontSize}
            onChange={(e) => onSettingChange('fontSize', e.target.value)}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
          />
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-right">
            {settings.fontSize}px
          </div>
        </div>
        <div className="mb-4">
          <label htmlFor="lineHeight" className="block text-sm text-gray-600 dark:text-gray-300 mb-2">
            Line Height
          </label>
          <input
            type="range"
            id="lineHeight"
            min="1.2"
            max="2"
            step="0.1"
            value={settings.lineHeight}
            onChange={(e) => onSettingChange('lineHeight', e.target.value)}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
          />
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-right">
            {settings.lineHeight}
          </div>
        </div>
        <div className="mb-4">
          <label htmlFor="fontFamily" className="block text-sm text-gray-600 dark:text-gray-300 mb-2">
            Font Family
          </label>
          <select
            id="fontFamily"
            value={settings.fontFamily}
            onChange={(e) => onSettingChange('fontFamily', e.target.value)}
            className="w-full p-2 border rounded-md bg-white dark:bg-gray-700 dark:border-gray-600"
          >
            <option value="system-ui">System Default</option>
            <option value="serif">Serif</option>
            <option value="monospace">Monospace</option>
          </select>
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4 pb-2 border-b dark:border-gray-700">Layout Settings</h3>
        <div className="mb-4">
          <label htmlFor="maxWidth" className="block text-sm text-gray-600 dark:text-gray-300 mb-2">
            Content Width (px)
          </label>
          <input
            type="range"
            id="maxWidth"
            min="600"
            max="1200"
            step="50"
            value={settings.maxWidth}
            onChange={(e) => onSettingChange('maxWidth', e.target.value)}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
          />
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-right">
            {settings.maxWidth}px
          </div>
        </div>
        <div className="mb-4">
          <label htmlFor="blockSpacing" className="block text-sm text-gray-600 dark:text-gray-300 mb-2">
            Block Spacing (px)
          </label>
          <input
            type="range"
            id="blockSpacing"
            min="8"
            max="32"
            value={settings.blockSpacing}
            onChange={(e) => onSettingChange('blockSpacing', e.target.value)}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
          />
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-right">
            {settings.blockSpacing}px
          </div>
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4 pb-2 border-b dark:border-gray-700">Theme Settings</h3>
        <div className="mb-4">
          <label htmlFor="theme" className="block text-sm text-gray-600 dark:text-gray-300 mb-2">
            Color Theme
          </label>
          <select
            id="theme"
            value={settings.theme}
            onChange={(e) => onSettingChange('theme', e.target.value)}
            className="w-full p-2 border rounded-md bg-white dark:bg-gray-700 dark:border-gray-600"
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="sepia">Sepia</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default OptionsPanel; 