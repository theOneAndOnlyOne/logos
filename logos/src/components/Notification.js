import React, { useEffect } from 'react';

/**
 * Simple notification component that fades in and out
 */
const Notification = ({ message, type = 'info', onClose, duration = 3000 }) => {
  useEffect(() => {
    if (duration && onClose) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);
  
  // Determine background color based on notification type
  const bgColor = {
    'info': 'bg-blue-500',
    'success': 'bg-green-500',
    'error': 'bg-red-500',
    'warning': 'bg-yellow-500'
  }[type] || 'bg-blue-500';
  
  return (
    <div className={`fixed bottom-4 right-4 ${bgColor} text-white py-2 px-4 rounded-md shadow-lg z-50 animate-fade-in`}>
      <div className="flex items-center justify-between">
        <span>{message}</span>
        {onClose && (
          <button 
            onClick={onClose}
            className="ml-3 focus:outline-none"
            aria-label="Close notification"
          >
            &times;
          </button>
        )}
      </div>
    </div>
  );
};

export default Notification; 