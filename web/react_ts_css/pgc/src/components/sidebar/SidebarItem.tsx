// src/components/sidebar/SidebarItem.tsx
interface ItemProps {
  id: string;
  title: string;
  onSelect: (id: string) => void;
}

export const SidebarItem = ({ id, title, onSelect }: ItemProps) => (
  <div
    className="sidebar-item item"
    onClick={() => {
      console.log('select conv', id);
      onSelect(id);
    }}
  >
    {title}
  </div>
);
