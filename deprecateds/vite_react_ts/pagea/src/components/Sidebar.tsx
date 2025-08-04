import React from 'react';
import { Plus } from 'lucide-react';

const Sidebar: React.FC<{ onNewSession: () => void }> = ({ onNewSession }) => (
  <div className="w-64 bg-gray-50 p-4 border-r">
    <button
      onClick={onNewSession}
      className="w-full flex items-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-md mb-4"
    >
      <Plus size={16} /> 新建会话
    </button>
    <div className="text-sm text-gray-500">历史会话</div>
    {/* TODO: 会话列表 */}
  </div>
);
export default Sidebar;