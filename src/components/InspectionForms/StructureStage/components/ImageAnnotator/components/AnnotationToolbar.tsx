import React from 'react';

interface AnnotationToolbarProps {
  hasImage: boolean;
  activeMode: string;
  onTextMode: () => void;
  onBrushMode: () => void;
  onUploadClick: () => void;
  onSaveClick: () => void;
  onCloseClick: () => void;
}

/**
 * 註釋工具欄組件，包含文字、畫筆、上傳、保存和關閉按鈕
 */
const AnnotationToolbar: React.FC<AnnotationToolbarProps> = ({
  hasImage,
  activeMode,
  onTextMode,
  onBrushMode,
  onUploadClick,
  onSaveClick,
  onCloseClick
}) => {
  return (
    <div className="annotation-toolbar">
      <button
        className={`tool-button ${activeMode === 'text' ? 'active' : ''}`}
        onClick={onTextMode}
        disabled={!hasImage}
        title="文字工具"
      >
        <span role="img" aria-label="文字工具">📝</span>
      </button>
      <button
        className={`tool-button ${activeMode === 'brush' ? 'active' : ''}`}
        onClick={onBrushMode}
        disabled={!hasImage}
        title="畫筆工具"
      >
        <span role="img" aria-label="畫筆工具">🖌️</span>
      </button>
      <button
        className="tool-button"
        onClick={onUploadClick}
        title="上傳圖片"
      >
        <span role="img" aria-label="上傳圖片">📷</span>
      </button>
      <button
        className="tool-button"
        onClick={onSaveClick}
        disabled={!hasImage}
        title="保存"
      >
        <span role="img" aria-label="保存">💾</span>
      </button>
      <button
        className="tool-button close-button"
        onClick={onCloseClick}
        title="關閉"
      >
        <span role="img" aria-label="關閉">❌</span>
      </button>
    </div>
  );
};

export default AnnotationToolbar;
