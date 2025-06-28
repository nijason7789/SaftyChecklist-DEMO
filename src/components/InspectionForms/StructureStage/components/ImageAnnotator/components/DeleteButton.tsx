import React from 'react';

interface DeleteButtonProps {
  position: { left: number; top: number };
  onDelete: () => void;
  isVisible: boolean;
}

/**
 * 刪除按鈕組件，顯示在選中的文字下方
 */
const DeleteButton: React.FC<DeleteButtonProps> = ({
  position,
  onDelete,
  isVisible
}) => {
  // 刪除按鈕的樣式
  const deleteButtonStyle: React.CSSProperties = {
    position: 'absolute',
    width: '24px',
    height: '24px',
    backgroundColor: '#ff4d4f',
    color: 'white',
    border: 'none',
    borderRadius: '50%',
    cursor: 'pointer',
    zIndex: 1000,
    display: isVisible ? 'flex' : 'none',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
    fontSize: '14px',
    fontWeight: 'bold',
    left: `${position.left}px`,
    top: `${position.top}px`,
  };

  return (
    <button
      style={deleteButtonStyle}
      onClick={onDelete}
      title="刪除"
    >
      ×
    </button>
  );
};

export default DeleteButton;
