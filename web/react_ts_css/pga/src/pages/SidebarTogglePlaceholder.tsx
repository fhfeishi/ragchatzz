// SidebarTogglePlaceholder.tsx
import SidebarIcon from '@/assets/icons/side.svg?react';
import styles from './SidebarTogglePlaceholder.module.css';
import { useUiStore } from '@/stores/uiStore'; 

const SidebarTogglePlaceholder = () => {
  const { toggleSidebar, isSidebarOpen } = useUiStore();

  return (
    <div className={styles.container} onClick={toggleSidebar}>
      <div className={styles.iconWrapper}>
        <SidebarIcon style={{ width: 24, height: 24 }} />
        <span className={styles.tooltip}>展开导航</span>
      </div>
    </div>
  );
};

export default SidebarTogglePlaceholder;