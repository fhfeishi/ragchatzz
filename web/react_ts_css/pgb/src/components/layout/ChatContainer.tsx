// src/components/layout/ChatContainer.tsx

import React, { useRef } from 'react';
import { MessageBubble, MessageBubbleProps } from '../chat/MessageBubble';

export interface ChatMessage {
  id: string;
  content: string;
  isUserMessage: boolean;
  timestamp: string;
}

export interface ChatContainerProps {
  messages: ChatMessage[];
  onSendMessage: (content: string) => void;
  isLoading?: boolean;
}

export const ChatContainer: React.FC<ChatContainerProps> = ({
  messages,
  onSendMessage,
  isLoading = false
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleSend = () => {
    const input = inputRef.current;
    if (input && input.value.trim()) {
      onSendMessage(input.value);
      input.value = '';
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Scroll to bottom when messages change
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden h-[600px] flex flex-col">
      <div className="border-b border-gray-200 px-5 py-4 bg-gray-50">
        <h2 className="font-semibold text-gray-800">Patent Analysis Session</h2>
        <p className="text-sm text-gray-500 mt-1">Current conversation</p>
      </div>
      
      <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          {messages.map((message) => (
            <MessageBubble
              key={message.id}
              content={message.content}
              isUserMessage={message.isUserMessage}
              timestamp={message.timestamp}
            />
          ))}
          
          {isLoading && (
            <div className="flex justify-start mb-6">
              <div className="w-10 h-10 rounded-full bg-white border-2 border-blue-600 flex items-center justify-center mr-3 flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="bg-white rounded-2xl rounded-tl-none px-5 py-4 shadow-sm max-w-[80%]">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>
      
      <div className="border-t border-gray-200 px-5 py-4">
        <div className="flex space-x-3">
          <input
            ref={inputRef}
            type="text"
            placeholder="Ask about patents..."
            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            onKeyDown={handleKeyPress}
          />
          <button 
            className="bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition-colors"
            onClick={handleSend}
          >
            Send
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Try: "Explain the energy conversion mechanism in patent US 11,484,922 B2"
        </p>
      </div>
    </div>
  );
};

