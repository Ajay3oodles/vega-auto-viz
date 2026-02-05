/**
 * ConfirmationModal Component
 * 
 * Modal dialog asking user if they want to update existing widget
 * or create a new one when submitting a new prompt
 */

import React from 'react';
import { AlertCircle, Plus, RefreshCw } from 'lucide-react';

const ConfirmationModal = ({ isOpen, onClose, onCreateNew, onUpdateExisting }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6 space-y-6">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="bg-yellow-100 rounded-full p-3">
            <AlertCircle className="w-8 h-8 text-yellow-600" />
          </div>
        </div>

        {/* Title */}
        <div className="text-center">
          <h3 className="text-xl font-semibold text-gray-900">
            Widget Already Active
          </h3>
          <p className="mt-2 text-sm text-gray-600">
            You have an active widget. Would you like to update it or create a new one?
          </p>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          {/* Update Existing */}
          <button
            onClick={onUpdateExisting}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200"
          >
            <RefreshCw className="w-5 h-5" />
            <span className="font-medium">Update Existing Widget</span>
          </button>

          {/* Create New */}
          <button
            onClick={onCreateNew}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
          >
            <Plus className="w-5 h-5" />
            <span className="font-medium">Create New Widget</span>
          </button>

          {/* Cancel */}
          <button
             onClick={onClose}
            className="w-full px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors duration-200"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;