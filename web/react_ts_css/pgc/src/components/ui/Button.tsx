// src/components/ui/IconButton.tsx

// import { ReactComponent as NewChat } from '@assets/icons/new_chat.svg';
import NewChat from '@assets/icons/new_chat.svg?react';

interface Props {
  onClick?: () => void;
  size?: number;
}
export const IconButton = ({ onClick, size = 16 }: Props) => (
  <button onClick={onClick} className="icon-btn">
    <NewChat width={size} height={size} />
  </button>
);
