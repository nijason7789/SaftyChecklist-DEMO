import React, { useState } from 'react';
import imageCompression from 'browser-image-compression';

interface PhotoUploadProps {
  onPhotoChange: (photoDataURL: string | null) => void;
  photoDataURL: string | null;
}

const PhotoUpload: React.FC<PhotoUploadProps> = ({ onPhotoChange, photoDataURL }) => {
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file) {
      console.log(`原始檔案大小: ${(file.size / 1024 / 1024).toFixed(2)} MB`);
      console.log(`原始檔案類型: ${file.type}`);
      if (file.size > 5 * 1024 * 1024) {
        alert("照片過大，請重新拍攝 (小於 5MB)");
        return onPhotoChange(null);
      }

      // 設定壓縮選項
      const options = {
        maxSizeMB: 1,          // 最大檔案大小 (例如 1MB)
        maxWidthOrHeight: 1920, // 最大寬度或高度 (例如 1920px)
        useWebWorker: true,    // 使用 Web Worker 以避免 UI 阻塞 (推薦)
        fileType: 'image/jpeg', // 強制輸出為 JPG 格式
        initialQuality: 0.8,   // 初始壓縮質量 (0 到 1 之間)
      };

      try {
        // 壓縮圖片
        const compressedFile = await imageCompression(file, options);
        const objectURL = URL.createObjectURL(compressedFile);
        onPhotoChange(objectURL);

      } catch (error) {
        console.error('圖片壓縮失敗:', error);
        onPhotoChange(null); // 或者通知用戶壓縮失敗
      }
    } else {
      onPhotoChange(null); // 如果沒有選擇檔案，清除照片
    }
  };

  return (
    <div className="photo-upload">
      <h3>現場照片</h3>
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
      {photoDataURL && (
        <div className="photo-preview">
          <img src={photoDataURL} alt="現場照片" />
        </div>
      )}
      {!photoDataURL}
    </div>
  );
};

export default PhotoUpload;
