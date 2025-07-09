import React, { useEffect } from 'react';
import imageCompression from 'browser-image-compression';

interface PhotoUploadProps {
  // 更新 props 接口，同時傳遞預覽 URL 和壓縮後的 File 物件
  onPhotoChange: (photoDataURL: string | null, compressedFile: File | null) => void;
  photoDataURL: string | null;
}

const PhotoUpload: React.FC<PhotoUploadProps> = ({ onPhotoChange, photoDataURL }) => {
  // 使用 useEffect Hook 來管理 Object URL 的生命週期，這是防止記憶體洩漏的關鍵
  useEffect(() => {
    // 這個 effect 的返回函式是一個 cleanup function
    // 它會在 component unmount 或 photoDataURL 改變時執行
    return () => {
      if (photoDataURL) {
        // 釋放先前創建的 Object URL，以回收瀏覽器記憶體
        URL.revokeObjectURL(photoDataURL);
        console.log(`已釋放 Object URL，防止記憶體洩漏`);
      }
    };
  }, [photoDataURL]); // 這個 effect 依賴於 photoDataURL

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file) {
      console.log(`原始檔案大小: ${(file.size / 1024 / 1024).toFixed(2)} MB`);

      // 調整壓縮設定以更積極地減少記憶體使用
      const options = {
        maxSizeMB: 0.8,         // 降低最大檔案大小至 0.8MB
        maxWidthOrHeight: 1280, // 降低最大解析度至 1280px
        useWebWorker: true,     // 在背景執行緒壓縮，避免 UI 卡頓
        fileType: 'image/jpeg', // 確保輸出為廣泛支援的 JPG
        initialQuality: 0.7,    // 稍微降低初始品質以增強壓縮率
        onProgress: (p: number) => {
          console.log(`壓縮進度: ${p}%`);
        },
      };

      try {
        console.log('開始進行圖片壓縮...');
        const compressedFile = await imageCompression(file, options);
        console.log(`壓縮後檔案大小: ${(compressedFile.size / 1024 / 1024).toFixed(2)} MB`);

        // 創建一個新的 Object URL 用於圖片預覽
        const objectURL = URL.createObjectURL(compressedFile);
        
        // 將新的預覽 URL 和壓縮後的 File 物件傳遞給父組件
        onPhotoChange(objectURL, compressedFile);

      } catch (error) {
        console.error('圖片壓縮失敗:', error);
        alert('圖片處理失敗，請稍後再試或更換照片。');
        onPhotoChange(null, null);
      }
    } else {
      // 如果沒有選擇檔案，清除照片
      onPhotoChange(null, null);
    }
  };

  return (
    <div className="photo-upload">
      <h3>現場照片</h3>
      {!photoDataURL && (
        <div className="photo-actions">
          <input
            type="file"
            id="photo-upload-input"
            accept="image/*"
            onChange={handlePhotoUpload}
            capture="environment"
            className="photo-input"
            style={{ display: 'none' }}
          />
          <label htmlFor="photo-upload-input" className="camera-button">
            開啟相機拍攝
          </label>
        </div>
      )}
      {photoDataURL && (
        <div className="photo-preview">
          <img src={photoDataURL} alt="現場照片" />
        </div>
      )}
    </div>
  );
};

export default PhotoUpload;
