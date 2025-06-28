import React, { useRef, useEffect } from 'react';
import * as fabric from 'fabric';

interface CanvasContainerProps {
  isVisible: boolean;
  onCanvasInitialized: (canvas: fabric.Canvas) => void;
}

/**
 * Canvas 容器組件，負責初始化和管理 Fabric.js Canvas
 */
const CanvasContainer: React.FC<CanvasContainerProps> = ({
  isVisible,
  onCanvasInitialized
}) => {
  // Canvas DOM 元素的引用
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // 追蹤 canvas 是否已初始化
  const canvasInitializedRef = useRef(false);

  // 初始化 Canvas
  useEffect(() => {
    if (!isVisible || !canvasRef.current || canvasInitializedRef.current) return;
    
    console.log('Initializing canvas...');
    canvasInitializedRef.current = true;
    
    // 初始化 Fabric Canvas
    const fabricCanvas = new fabric.Canvas(canvasRef.current, {
      width: window.innerWidth,
      height: window.innerHeight - 120, // 考慮頂部和工具欄的高度
      backgroundColor: '#f0f0f0',
    });
    
    // 初始化時默認不啟用任何工具模式
    fabricCanvas.isDrawingMode = false;
    
    // 通知父組件 canvas 已初始化
    onCanvasInitialized(fabricCanvas);
    
    // 處理窗口大小變化
    const handleResize = () => {
      fabricCanvas.setWidth(window.innerWidth);
      fabricCanvas.setHeight(window.innerHeight - 100);
      fabricCanvas.renderAll();
    };
    
    window.addEventListener('resize', handleResize);
    
    // 清理函數
    return () => {
      window.removeEventListener('resize', handleResize);
      fabricCanvas.dispose();
      canvasInitializedRef.current = false;
    };
  }, [isVisible, onCanvasInitialized]);

  return (
    <div className="canvas-container">
      <canvas ref={canvasRef} />
    </div>
  );
};

export default CanvasContainer;
