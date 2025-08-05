// src/components/chat/MessageBubble.tsx

import React from 'react';
import { MarkdownRenderer } from './MarkdownRenderer';

export interface MessageBubbleProps {
  content: string;
  isUserMessage?: boolean;
  timestamp?: string;
  onFeedback?: (isHelpful: boolean) => void;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ 
  content, 
  isUserMessage = false,
  timestamp = 'Just now',
  onFeedback
}) => {
  return (
    <div className={`flex ${isUserMessage ? 'justify-end' : 'justify-start'} mb-6`}>
      {!isUserMessage && (
        <div className="w-10 h-10 rounded-full bg-white border-2 border-blue-600 flex items-center justify-center mr-3 flex-shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        </div>
      )}
      
      <div className={`rounded-2xl px-5 py-4 max-w-[80%] ${
        isUserMessage 
          ? 'bg-blue-600 text-white rounded-tr-none' 
          : 'bg-white rounded-tl-none shadow-sm'
      }`}>
        <div className={isUserMessage ? '' : 'text-gray-800'}>
          <MarkdownRenderer content={content} />
        </div>
        
        {!isUserMessage && (
          <div className="mt-4 flex items-center justify-between text-xs text-gray-500 border-t pt-3">
            <span>Patent analyzed • {timestamp}</span>
            <div className="flex space-x-3">
              <button 
                className="hover:text-blue-200"
                onClick={() => onFeedback?.(true)}
              >
                👍 Helpful
              </button>
              <button 
                className="hover:text-blue-200"
                onClick={() => onFeedback?.(false)}
              >
                👎 Not helpful
              </button>
            </div>
          </div>
        )}
      </div>
      
      {isUserMessage && (
        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center ml-3 flex-shrink-0">
          <span className="text-gray-700 font-medium">U</span>
        </div>
      )}
    </div>
  );
};
