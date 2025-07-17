import React, { useEffect } from 'react';
import imageCompression from 'browser-image-compression';

interface PhotoUploadProps {
  onPhotoChange: (photoDataURL: string | null, compressedFile: File | null) => void;
  photoDataURL: string | null;
}

const PhotoUpload: React.FC<PhotoUploadProps> = ({ onPhotoChange, photoDataURL }) => {
  useEffect(() => {
    return () => {
      if (photoDataURL) {
        URL.revokeObjectURL(photoDataURL); // 釋放 Object URL
        console.log(`已釋放 Object URL，防止記憶體洩漏`);
      }
    };
  }, [photoDataURL]);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file) {
      console.log(`原始檔案大小: ${(file.size / 1024 / 1024).toFixed(2)} MB`);

      // 如果檔案大小不超過 5MB，直接使用原始檔案
      if (file.size <= 5 * 1024 * 1024) {
        console.log('檔案大小小於 5MB，跳過壓縮');
        const objectURL = URL.createObjectURL(file);
        onPhotoChange(objectURL, file); // 傳遞原始檔案
        return;
      }

      // 延遲壓縮和預覽生成，避免即時處理
      setTimeout(async () => {
        const options = {
          maxSizeMB: 5,            // 調整壓縮後的最大檔案大小為 5MB
          maxWidthOrHeight: 1024,  // 降低最大解析度至 1024px
          useWebWorker: true,      // 使用 Web Worker 進行壓縮
          fileType: 'image/jpeg',  // 確保輸出為 JPG 格式
          initialQuality: 0.6,     // 初始品質設置為 0.6
          onProgress: (p: number) => {
            console.log(`壓縮進度: ${p}%`);
          },
        };

        try {
          console.log('開始進行圖片壓縮...');
          const compressedFile = await imageCompression(file, options);
          console.log(`壓縮後檔案大小: ${(compressedFile.size / 1024 / 1024).toFixed(2)} MB`);

          const objectURL = URL.createObjectURL(compressedFile);
          onPhotoChange(objectURL, compressedFile); // 傳遞壓縮後的圖片
        } catch (error) {
          console.error('圖片壓縮失敗:', error);
          alert('圖片處理失敗，請稍後再試或更換照片。');
          onPhotoChange(null, null);
        }
      }, 100); // 延遲處理，減少即時內存壓力
    } else {
      onPhotoChange(null, null); // 清除照片
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
