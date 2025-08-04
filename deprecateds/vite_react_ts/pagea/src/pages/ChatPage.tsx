import React, { useState } from 'react';
import ChatMessage from '../components/ChatMessage';
import Sidebar from '../components/Sidebar';

interface Message {
  type: 'user' | 'bot';
  text: string;
  chunks?: any[];
}

const ChatPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      type: 'bot',
      text: '你好！我是你的图文智能助手。',
      chunks: [
        {
          im_path: [
            {
              description: '图表示例',
              path: 'https://via.placeholder.com/300x200.png?text=Chart',
            },
          ],
        },
      ],
    },
  ]);
  const [input, setInput] = useState('');

  const sendMessage = () => {
    if (!input.trim()) return;
    setMessages([...messages, { type: 'user', text: input }]);
    // 模拟回复
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          type: 'bot',
          text: '这是模拟的 Markdown 回答：\n- 点1\n- 点2',
          chunks: [
            {
              im_path: [
                {
                  description: '模拟图片',
                  path: 'https://via.placeholder.com/300x200.png?text=Mock',
                },
              ],
            },
          ],
        },
      ]);
    }, 1000);
    setInput('');
  };

  return (
    <div className="flex h-screen">
      <Sidebar onNewSession={() => setMessages([])} />
      <div className="flex-1 flex flex-col">
        <div className="flex-1 p-4 overflow-y-auto">
          {messages.map((msg, idx) => (
            <ChatMessage key={idx} type={msg.type} text={msg.text} chunks={msg.chunks} />
          ))}
        </div>
        <div className="p-4 border-t">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessage())}
            className="w-full p-2 border rounded-md"
            placeholder="输入问题..."
          />
        </div>
      </div>
    </div>
  );
};

export default ChatPage;