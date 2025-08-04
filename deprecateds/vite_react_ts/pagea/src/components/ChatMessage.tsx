import React from 'react';
import MarkdownRenderer from './MarkdownRenderer';
import ImagePreview from './ImagePreview';
import Avatar from './Avatar';

interface Props {
  type: 'user' | 'bot';
  text: string;
  chunks?: {
    im_path: { description: string; path: string }[];
  }[];
}

const ChatMessage: React.FC<Props> = ({ type, text, chunks }) => (
  <div className={`flex gap-3 mb-4 ${type === 'user' ? 'justify-end' : ''}`}>
    {type === 'bot' && <Avatar />}
    <div
      className={`max-w-lg p-3 rounded-lg ${
        type === 'user' ? 'bg-blue-100 text-right' : 'bg-gray-100'
      }`}
    >
      <MarkdownRenderer content={text} />
      {chunks?.map((chunk, idx) =>
        chunk.im_path.map((img, i) => (
          <div key={`${idx}-${i}`} className="mt-2">
            <ImagePreview src={img.path} alt={img.description} />
            <p className="text-sm text-gray-500 mt-1">{img.description}</p>
          </div>
        ))
      )}
    </div>
  </div>
);

export default ChatMessage;