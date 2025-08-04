import React from 'react';

const Avatar: React.FC<{ isTyping?: boolean }> = ({ isTyping }) => (
  <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
    <span
      className={`text-white text-lg font-bold transition-opacity duration-500 ${
        isTyping ? 'animate-pulse' : ''
      }`}
    >
      🤖
    </span>
  </div>
);

export default Avatar;