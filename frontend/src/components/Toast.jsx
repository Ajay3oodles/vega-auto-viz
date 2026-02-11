import React, { useEffect } from 'react';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';

const Toast = ({ message, type = 'success', onClose, duration = 3000 }) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const config = {
    success: {
      icon: CheckCircle,
      gradient: 'from-emerald-500 to-teal-500',
      bg: 'bg-emerald-50 dark:bg-emerald-950/30',
      border: 'border-emerald-200 dark:border-emerald-800',
      text: 'text-emerald-800 dark:text-emerald-200',
      iconColor: 'text-emerald-500',
    },
    error: {
      icon: XCircle,
      gradient: 'from-red-500 to-rose-500',
      bg: 'bg-red-50 dark:bg-red-950/30',
      border: 'border-red-200 dark:border-red-800',
      text: 'text-red-800 dark:text-red-200',
      iconColor: 'text-red-500',
    },
    warning: {
      icon: AlertTriangle,
      gradient: 'from-amber-500 to-orange-500',
      bg: 'bg-amber-50 dark:bg-amber-950/30',
      border: 'border-amber-200 dark:border-amber-800',
      text: 'text-amber-800 dark:text-amber-200',
      iconColor: 'text-amber-500',
    },
    info: {
      icon: Info,
      gradient: 'from-blue-500 to-indigo-500',
      bg: 'bg-blue-50 dark:bg-blue-950/30',
      border: 'border-blue-200 dark:border-blue-800',
      text: 'text-blue-800 dark:text-blue-200',
      iconColor: 'text-blue-500',
    },
  };

  const { icon: Icon, gradient, bg, border, text, iconColor } = config[type] || config.info;

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 max-w-md animate-slide-in-right`}
      role="alert"
    >
      <div className={`${bg} ${border} border-l-4 rounded-xl shadow-xl backdrop-blur-sm p-4`}>
        <div className="flex items-start gap-3">
          {/* Icon with gradient background */}
          <div className="flex-shrink-0">
            <div className={`relative p-1.5 bg-gradient-to-br ${gradient} rounded-lg`}>
              <Icon className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
          </div>
          
          {/* Message */}
          <div className={`flex-1 ${text} text-sm font-medium pt-0.5`}>
            {message}
          </div>
          
          {/* Close button */}
          <button
            onClick={onClose}
            className={`flex-shrink-0 ${text} hover:opacity-70 transition-opacity duration-200 p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg`}
            aria-label="Close notification"
          >
            <X className="w-4 h-4" strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Toast;