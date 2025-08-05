// src/components/sidebar/Sidebar.tsx
import styles from './Sidebar.module.css';
import { SidebarGroup } from './SidebarGroup';
import { Plus } from 'lucide-react'; // 用 lucide-react 做 + 图标

// —— 静态假数据 —— //
const mockConvs = {
  今天: [
    { id: 'c1', title: '写周报' },
    { id: 'c2', title: '调试 Optuna 参数' }
  ],
  三天内: [{ id: 'c3', title: 'Git 冲突排查' }],
  七天内: [{ id: 'c4', title: 'RAG 本地部署' }],
  之前: [{ id: 'c5', title: 'C++ 指针复习' }]
};

export const Sidebar = () => {
  const handleSelect = (id: string) => {
    /* 只打印 */
    console.log('🚀 change conversation ->', id);
  };

  return (
    <aside className={styles.sidebar}>
      <div className={styles.header}>
        <span>会话列表</span>
        <Plus
          size={18}
          style={{ cursor: 'pointer' }}
          onClick={() => console.log('➕ new chat')}
        />
      </div>

      {Object.entries(mockConvs).map(([group, items]) => (
        <SidebarGroup
          key={group}
          title={group}
          items={items}
          onSelect={handleSelect}
        />
      ))}
    </aside>
  );
};
