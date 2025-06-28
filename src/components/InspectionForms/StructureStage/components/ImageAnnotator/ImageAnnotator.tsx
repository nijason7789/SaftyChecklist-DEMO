import React, { useState, useRef, useCallback, useEffect } from 'react';
import * as fabric from 'fabric';
import './ImageAnnotator.css';

// 引入原子組件
import CanvasContainer from './components/CanvasContainer';
import AnnotationToolbar from './components/AnnotationToolbar';
import DeleteButton from './components/DeleteButton';
import ImageUploader from './components/ImageUploader';

interface ImageAnnotatorProps {
  isVisible: boolean;
  initialImage?: string | null;
  onClose: () => void;
  onSave: (imageDataURL: string) => void;
}

/**
 * 圖片註釋組件，整合所有功能
 */
const ImageAnnotator: React.FC<ImageAnnotatorProps> = ({
  isVisible,
  initialImage,
  onClose,
  onSave
}) => {
  // 狀態管理
  const [activeMode, setActiveMode] = useState<'text' | 'brush'>('text');
  const [hasImage, setHasImage] = useState<boolean>(!!initialImage);
  const [selectedObject, setSelectedObject] = useState<fabric.Object | null>(null);
  const [deleteButtonPosition, setDeleteButtonPosition] = useState({ left: 0, top: 0 });
  
  // 使用 useRef 管理 canvas 實例，避免重新渲染
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 初始化 canvas
  const handleCanvasInitialized = useCallback((canvas: fabric.Canvas) => {
    console.log('Canvas initialized and passed to parent component');
    fabricCanvasRef.current = canvas;
    
    // 添加選中對象事件監聽器
    canvas.on('selection:created', (e) => {
      const activeObject = canvas.getActiveObject();
      if (activeObject && activeObject.type === 'i-text') {
        setSelectedObject(activeObject);
        
        // 計算刪除按鈕的位置
        const objectBounds = activeObject.getBoundingRect();
        setDeleteButtonPosition({
          left: objectBounds.left + objectBounds.width / 2,
          top: objectBounds.top + objectBounds.height + 10
        });
      }
    });
    
    canvas.on('object:moving', (e) => {
      if (e.target && e.target.type === 'i-text') {
        const objectBounds = e.target.getBoundingRect();
        setDeleteButtonPosition({
          left: objectBounds.left + objectBounds.width / 2,
          top: objectBounds.top + objectBounds.height + 10
        });
      }
    });
    
    canvas.on('selection:cleared', () => {
      setSelectedObject(null);
    });
    
    // 如果有初始圖片，加載它
    if (initialImage) {
      loadImage(initialImage);
    }
  }, [initialImage]);
  
  // 加載圖片到 canvas
  const loadImage = useCallback((imageUrl: string) => {
    if (!fabricCanvasRef.current) return;
    
    const canvas = fabricCanvasRef.current;
    console.log('Loading image:', imageUrl.substring(0, 50) + '...');
    setHasImage(true);
    
    try {
      // 使用 HTML Image 元素預加載圖片
      const imgElement = new Image();
      
      imgElement.onload = () => {
        console.log('Image loaded successfully, dimensions:', imgElement.width, 'x', imgElement.height);
        
        // 使用加載好的 HTML Image 元素創建 fabric.Image 對象
        // @ts-ignore - 忽略 TypeScript 錯誤
        const fabricImage = new fabric.Image(imgElement);
        
        // 計算縮放比例
        const imgWidth = fabricImage.width || 100;
        const imgHeight = fabricImage.height || 100;
        
        const canvasWidth = canvas.getWidth();
        const canvasHeight = canvas.getHeight();
        
        console.log('Canvas dimensions:', canvasWidth, 'x', canvasHeight);
        
        const scaleX = (canvasWidth * 0.8) / imgWidth;
        const scaleY = (canvasHeight * 0.8) / imgHeight;
        const scale = Math.min(scaleX, scaleY);
        
        console.log('Scaling image by factor:', scale);
        
        // 設置圖片屬性 - 確保不可拖曳
        fabricImage.scale(scale);
        fabricImage.set({
          left: (canvasWidth - imgWidth * scale) / 2,
          top: (canvasHeight - imgHeight * scale) / 2,
          selectable: false,
          lockMovementX: true,
          lockMovementY: true,
          evented: true // 確保圖片可以接收事件
        });
        
        // 移除任何現有圖片
        canvas.getObjects().forEach((obj: fabric.Object) => {
          if (obj.type === 'image') {
            canvas.remove(obj);
          }
        });
        
        // 添加到畫布並渲染
        canvas.add(fabricImage);
        canvas.renderAll();
        console.log('Image added to canvas and rendered');
      };
      
      imgElement.onerror = (error) => {
        console.error('Error loading image:', error);
      };
      
      imgElement.src = imageUrl;
    } catch (error) {
      console.error('Error processing image:', error);
    }
  }, []);
  
  // 處理文件上傳
  const handleFileSelected = useCallback((file: File) => {
    if (!fabricCanvasRef.current) return;
    
    console.log('File selected:', file.name, file.type, file.size);
    
    const reader = new FileReader();
    reader.onload = (event) => {
      if (!event.target?.result) {
        console.error('Failed to read file');
        return;
      }
      
      console.log('Image loaded successfully from FileReader');
      
      const imageUrl = event.target.result.toString();
      loadImage(imageUrl);
      
      // 確保上傳圖片後重置所有工具模式
      if (fabricCanvasRef.current) {
        fabricCanvasRef.current.isDrawingMode = false;
        setActiveMode('text');
      }
      
      // 使用 setTimeout 避免立即觸發狀態更新後的重新渲染
      setTimeout(() => {
        if (fabricCanvasRef.current) {
          const dataURL = fabricCanvasRef.current.toDataURL({
            format: 'png',
            quality: 0.8,
            multiplier: 1
          });
          onSave(dataURL);
        }
      }, 100);
    };
    
    reader.onerror = (error) => {
      console.error('Error reading file:', error);
    };
    
    reader.readAsDataURL(file);
  }, [loadImage, onSave]);
  
  // 添加文字到指定位置
  const addTextAtPosition = useCallback((options: any) => {
    if (!fabricCanvasRef.current) return;
    
    const canvas = fabricCanvasRef.current;
    
    // 如果點擊的是現有物件，不添加新文字
    const target = options.target;
    if (target && (target.type === 'i-text' || target.type === 'text')) {
      console.log('Clicked on existing text, not adding new text');
      return;
    }
    
    // 獲取滑鼠點擊位置
    const pointer = canvas.getScenePoint(options.e);
    
    console.log('Adding text at position:', pointer.x, pointer.y);
    
    const text = new fabric.IText('點擊編輯文字', {
      left: pointer.x,
      top: pointer.y,
      fontFamily: 'Arial',
      fontSize: 20,
      fill: '#000000',
      editable: true
    });
    
    canvas.add(text);
    canvas.setActiveObject(text);
    text.enterEditing();
    text.selectAll();
    canvas.renderAll();
  }, []);
  
  // 處理文字模式
  const handleTextMode = useCallback(() => {
    if (!fabricCanvasRef.current) return;
    
    const canvas = fabricCanvasRef.current;
    console.log('Activating text mode');
    
    // 確保先清除所有事件處理器
    canvas.off('mouse:down', addTextAtPosition);
    
    // 禁用繪圖模式
    canvas.isDrawingMode = false;
    
    // 更新模式狀態
    setActiveMode('text');
    
    // 添加點擊事件處理器以添加文字
    canvas.on('mouse:down', addTextAtPosition);
    
    console.log('已啟用文字模式，點擊畫布添加文字');
  }, [addTextAtPosition]);
  
  // 處理畫筆模式
  const handleBrushMode = useCallback(() => {
    if (!fabricCanvasRef.current) return;
    
    const canvas = fabricCanvasRef.current;
    console.log('Activating brush mode');
    
    // 移除文字模式的點擊事件
    canvas.off('mouse:down', addTextAtPosition);
    
    // 確保沒有選中的物件
    canvas.discardActiveObject();
    canvas.renderAll();
    
    // 啟用繪圖模式
    canvas.isDrawingMode = true;
    
    // 設置筆刷屬性
    if (canvas.freeDrawingBrush) {
      canvas.freeDrawingBrush.color = '#000000';
      canvas.freeDrawingBrush.width = 5;
    } else {
      // 如果沒有筆刷，創建一個
      canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
      canvas.freeDrawingBrush.color = '#000000';
      canvas.freeDrawingBrush.width = 5;
    }
    
    // 更新模式狀態
    setActiveMode('brush');
    
    console.log('已啟用繪圖模式，可以在畫布上自由繪圖');
  }, [addTextAtPosition]);
  
  // 處理保存
  const handleSave = useCallback(() => {
    if (!fabricCanvasRef.current) return;
    
    const canvas = fabricCanvasRef.current;
    const dataURL = canvas.toDataURL({
      format: 'png',
      quality: 0.8,
      multiplier: 1
    });
    
    onSave(dataURL);
    console.log('已保存圖片');
    
    // 保存後關閉畫面
    onClose();
  }, [onSave, onClose]);
  
  // 處理刪除選中的對象
  const handleDeleteSelected = useCallback(() => {
    if (!fabricCanvasRef.current || !selectedObject) return;
    
    const canvas = fabricCanvasRef.current;
    canvas.remove(selectedObject);
    canvas.renderAll();
    setSelectedObject(null);
    console.log('已刪除選中的對象');
  }, [selectedObject]);
  
  // 處理上傳按鈕點擊
  const handleUploadClick = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, []);
  
  // 當組件卸載時清理事件監聽器
  useEffect(() => {
    return () => {
      if (fabricCanvasRef.current) {
        fabricCanvasRef.current.off('mouse:down', addTextAtPosition);
      }
    };
  }, [addTextAtPosition]);

  // 如果不可見，則不渲染任何內容
  if (!isVisible) {
    return null;
  }

  return (
    <div className="image-annotator-overlay">
      <div className="image-annotator-container">
        <div className="image-annotator-header">
          <h2>圖片編輯</h2>
          <div className="image-annotator-actions">
            <button 
              className="save-button" 
              onClick={handleSave} 
              disabled={!hasImage}
            >
              保存
            </button>
            <button className="close-button" onClick={onClose}>
              關閉
            </button>
          </div>
        </div>
        
        <div className="image-annotator-toolbar">
          <button
            className={`tool-button ${activeMode === 'text' ? 'active' : ''}`}
            onClick={handleTextMode}
            disabled={!hasImage}
            title="文字工具"
          >
            <span role="img" aria-label="文字工具">📝</span> 文字
          </button>
          <button
            className={`tool-button ${activeMode === 'brush' ? 'active' : ''}`}
            onClick={handleBrushMode}
            disabled={!hasImage}
            title="畫筆工具"
          >
            <span role="img" aria-label="畫筆工具">🖌️</span> 畫筆
          </button>
          <button
            className="tool-button primary"
            onClick={handleUploadClick}
            title="上傳圖片"
          >
            <span role="img" aria-label="上傳圖片">📷</span> 上傳圖片
          </button>
        </div>
        
        <CanvasContainer
          isVisible={true}
          onCanvasInitialized={handleCanvasInitialized}
        />
        
        <DeleteButton
          position={deleteButtonPosition}
          onDelete={handleDeleteSelected}
          isVisible={!!selectedObject}
        />
        
        <input
          type="file"
          ref={fileInputRef}
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              handleFileSelected(e.target.files[0]);
            }
          }}
          accept="image/*"
          style={{ display: 'none' }}
        />
      </div>
    </div>
  );
};

export default ImageAnnotator;
