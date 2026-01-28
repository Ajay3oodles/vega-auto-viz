/**
 * Toast Component
 * 
 * Displays temporary notification messages for user feedback.
 * Auto-dismisses after a few seconds.
 */

import React, { useEffect } from 'react';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';

const Toast = ({ message, type = 'success', onClose, duration = 3000 }) => {
  /**
   * Auto-dismiss toast after specified duration
   */
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  // Configuration for different toast types
  const config = {
    success: {
      icon: CheckCircle,
      bgColor: 'bg-green-50',
      borderColor: 'border-green-500',
      textColor: 'text-green-800',
      iconColor: 'text-green-500',
    },
    error: {
      icon: XCircle,
      bgColor: 'bg-red-50',
      borderColor: 'border-red-500',
      textColor: 'text-red-800',
      iconColor: 'text-red-500',
    },
    info: {
      icon: Info,
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-500',
      textColor: 'text-blue-800',
      iconColor: 'text-blue-500',
    },
  };

  const { icon: Icon, bgColor, borderColor, textColor, iconColor } = config[type] || config.info;

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 ${bgColor} ${borderColor} border-l-4 rounded-lg shadow-lg p-4 max-w-md animate-slide-in-right`}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <Icon className={`w-5 h-5 ${iconColor} flex-shrink-0 mt-0.5`} />
        
        {/* Message */}
        <div className={`flex-1 ${textColor} text-sm font-medium`}>
          {message}
        </div>
        
        {/* Close button */}
        <button
          onClick={onClose}
          className={`${textColor} hover:opacity-70 transition-opacity duration-200 flex-shrink-0`}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Toast;
