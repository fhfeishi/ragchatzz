// src/components/sidebar/SidebarGroup.tsx
import { SidebarItem } from './SidebarItem';
import styles from './Sidebar.module.css';

interface GroupProps {
  title: string;
  items: { id: string; title: string }[];
  onSelect: (id: string) => void;
}

export const SidebarGroup = ({ title, items, onSelect }: GroupProps) => (
  <>
    <div className={styles.groupTitle}>{title}</div>
    {items.map((it) => (
      <SidebarItem key={it.id} {...it} onSelect={onSelect} />
    ))}
  </>
);
