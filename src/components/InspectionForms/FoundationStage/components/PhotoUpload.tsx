import React, { useEffect, useRef, useState } from 'react';
import imageCompression from 'browser-image-compression';

// 為 ImageCapture API 添加類型定義
interface PhotoCapabilities {
  redEyeReduction: string;
  imageHeight: { min: number; max: number; step: number };
  imageWidth: { min: number; max: number; step: number };
  fillLightMode: string[];
}

interface PhotoSettings {
  fillLightMode: string;
  imageHeight: number;
  imageWidth: number;
  redEyeReduction: boolean;
}

// 定義全局 ImageCapture 類型
declare global {
  class ImageCapture {
    constructor(track: MediaStreamTrack);
    takePhoto(photoSettings?: PhotoSettings): Promise<Blob>;
    getPhotoCapabilities(): Promise<PhotoCapabilities>;
    getPhotoSettings(): Promise<PhotoSettings>;
    grabFrame(): Promise<ImageBitmap>;
  }
}

interface PhotoUploadProps {
  // 更新 props 接口，同時傳遞預覽 URL 和壓縮後的 File 物件
  onPhotoChange: (photoDataURL: string | null, compressedFile: File | null) => void;
  photoDataURL: string | null;
}

const PhotoUpload: React.FC<PhotoUploadProps> = ({ onPhotoChange, photoDataURL }) => {
  const [isCameraOpen, setIsCameraOpen] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const imageCapture = useRef<ImageCapture | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 判斷是否為移動裝置
  useEffect(() => {
    const checkIfMobile = () => {
      // 結合多種方法判斷是否為移動裝置
      
      // 1. 螢幕寬度判斷 - 一般認為小於 768px 為移動裝置
      const screenWidth = window.innerWidth;
      const isNarrowScreen = screenWidth < 768;
      
      // 2. 觸控支援判斷 - 支援觸控通常是移動裝置
      const hasTouchSupport = 'ontouchstart' in window || 
                             navigator.maxTouchPoints > 0 || 
                             (navigator as any).msMaxTouchPoints > 0;
      
      // 3. User Agent 判斷 - 傳統方法，作為輔助
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
      const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;
      const isMobileUserAgent = mobileRegex.test(userAgent.toLowerCase());
      
      // 結合判斷結果，至少滿足兩個條件即視為移動裝置
      const isMobileDevice = (isNarrowScreen && hasTouchSupport) || 
                            (isNarrowScreen && isMobileUserAgent) || 
                            (hasTouchSupport && isMobileUserAgent);
      
      setIsMobile(isMobileDevice);
      
      // 使用 alert 替代 console.log 進行調試
      const debugInfo = [
        `裝置判斷: ${isMobileDevice ? '移動裝置' : '桌面裝置'}`,
        `- 螢幕寬度: ${screenWidth}px (${isNarrowScreen ? '窄屏' : '寬屏'})`,
        `- 觸控支援: ${hasTouchSupport ? '支援' : '不支援'})`,
        `- User Agent 判斷: ${isMobileUserAgent ? '移動裝置' : '桌面裝置'})`
      ].join('\n');
      
      // alert('裝置檢測結果:\n' + debugInfo);
      
      // 保留 console.log 以便在開發者工具中也能看到
      console.log(debugInfo);
    };
    
    checkIfMobile();
    
    // 監聽屏幕大小變化，重新判斷裝置類型
    window.addEventListener('resize', checkIfMobile);
    
    return () => {
      window.removeEventListener('resize', checkIfMobile);
      
      // 釋放 Object URL
      if (photoDataURL) {
        URL.revokeObjectURL(photoDataURL);
        console.log(`已釋放 Object URL，防止記憶體洩漏`);
      }
      
      // 確保相機關閉
      stopCamera();
    };
  }, [photoDataURL]);

  // 開啟相機或文件選擇器（根據裝置類型）
  const handleCaptureClick = () => {
    if (isMobile) {
      // 移動裝置強制開啟相機
      startCamera();
    } else {
      // 桌面裝置開啟文件選擇器
      if (fileInputRef.current) {
        fileInputRef.current.click();
      }
    }
  };
  
  // 開啟相機
  const startCamera = async () => {
    try {
      // 更安全的檢查相機 API 是否可用
      if (typeof navigator === 'undefined' || 
          !navigator || 
          typeof navigator.mediaDevices === 'undefined' || 
          !navigator.mediaDevices || 
          typeof navigator.mediaDevices.getUserMedia !== 'function') {
        // 如果相機 API 不可用
        alert('相機 API 不可用');
        console.log('相機 API 不可用');
        
        if (isMobile) {
          // 移動裝置上強制使用相機，顯示錯誤提示
          alert('您的瀏覽器不支援相機功能。請嘗試使用其他瀏覽器或更新您的瀏覽器版本。');
        } else {
          // 非移動裝置則允許文件選擇
          if (fileInputRef.current) {
            fileInputRef.current.click();
          }
        }
        return;
      }
      
      // 請求相機權限並獲取媒體流
      const constraints = {
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };
      
      console.log('正在請求相機權限...');
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log('相機權限已獲得，媒體流已建立');
      
      // 保存媒體流引用
      streamRef.current = stream;
      
      // 先設置 isCameraOpen 為 true，確保 video 元素已在 DOM 中
      setIsCameraOpen(true);
      
      // 使用 setTimeout 確保 video 元素已經渲染到 DOM 中
      setTimeout(() => {
        // 將媒體流連接到視頻元素
        if (videoRef.current) {
          console.log('將媒體流連接到視頻元素');
          videoRef.current.srcObject = stream;
          
          // 確保視頻元素可見
          videoRef.current.style.display = 'block';
          videoRef.current.style.width = '100%';
          videoRef.current.style.height = 'auto';
          
          videoRef.current.onloadedmetadata = () => {
            console.log('視頻元素已載入元數據，嘗試播放');
            if (videoRef.current) {
              videoRef.current.play()
                .then(() => console.log('相機預覽開始播放'))
                .catch(err => {
                  console.error('無法播放相機預覽:', err);
                  alert(`無法播放相機預覽: ${err.message}`);
                });
            }
          };
          
          // 創建 ImageCapture 實例
          try {
            const track = stream.getVideoTracks()[0];
            if (typeof ImageCapture !== 'undefined') {
              imageCapture.current = new ImageCapture(track);
              console.log('ImageCapture 實例已創建');
            } else {
              // 如果 ImageCapture API 不可用，使用備用方案
              console.log('ImageCapture API 不可用，使用備用方案');
              // 仍然顯示相機預覽，但將使用 canvas 捕捉
            }
          } catch (error) {
            console.error('ImageCapture 創建失敗:', error);
            // 繼續顯示相機預覽，但將使用備用方案
          }
        } else {
          console.error('視頻元素引用不存在');
          alert('無法初始化相機預覽，請重試');
        }
      }, 100); // 給予 React 足夠時間渲染 video 元素
    } catch (error) {
      alert(`無法訪問相機: ${error instanceof Error ? error.message : '未知錯誤'}`);
      console.error('無法訪問相機:', error);
      alert('無法訪問相機，請確保已授予相機權限或嘗試使用文件上傳。');
      
      // 如果相機存取失敗，顯示錯誤提示
      // 在移動裝置上強制使用相機，不允許從相簿選擇
      if (!isMobile && fileInputRef.current) {
        // 只有在非移動裝置上才允許從相簿選擇
        fileInputRef.current.click();
      } else {
        alert('無法訪問相機，請確保已授予相機權限或重新整理頁面後再試。');
      }
    }
  };
  
  // 關閉相機
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
      imageCapture.current = null;
      setIsCameraOpen(false);
    }
  };
  
  // 拍照
  const takePhoto = async () => {
    if (!videoRef.current) return;
    
    try {
      if (imageCapture.current) {
        // 使用 ImageCapture API
        try {
          const blob = await imageCapture.current.takePhoto();
          alert(`原始檔案大小: ${(blob.size / 1024 / 1024).toFixed(2)} MB`);
          console.log(`原始檔案大小: ${(blob.size / 1024 / 1024).toFixed(2)} MB`);
          processPhoto(blob);
        } catch (error) {
          alert(`ImageCapture takePhoto 失敗，切換到備用方案: ${error instanceof Error ? error.message : '未知錯誤'}`);
          console.error('ImageCapture takePhoto 失敗，切換到備用方案:', error);
          // 如果 ImageCapture API 失敗，使用 Canvas 備用方案
          captureVideoFrame();
        }
      } else {
        // 使用 Canvas 備用方案
        captureVideoFrame();
      }
      
      // 關閉相機
      stopCamera();
    } catch (error) {
      alert(`拍照失敗: ${error instanceof Error ? error.message : '未知錯誤'}`);
      console.error('拍照失敗:', error);
      alert('拍照失敗，請重試。');
    }
  };
  
  // 使用 Canvas 從視頻元素捕捉圖像（備用方案）
  const captureVideoFrame = () => {
    if (!videoRef.current) return;
    
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // 將視頻畫面繪製到 Canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // 轉換為 Blob
    canvas.toBlob((blob) => {
      if (blob) {
        alert(`Canvas 捕捉圖像大小: ${(blob.size / 1024 / 1024).toFixed(2)} MB`);
        console.log(`Canvas 捕捉圖像大小: ${(blob.size / 1024 / 1024).toFixed(2)} MB`);
        processPhoto(blob);
      } else {
        alert('Canvas toBlob 失敗');
        console.error('Canvas toBlob 失敗');
        alert('照片處理失敗，請重試。');
      }
    }, 'image/jpeg', 0.95);
  };
  
  // 處理上傳的文件
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const blob = new Blob([file], { type: file.type });
      processPhoto(blob);
    }
  };
  
  // 處理照片（壓縮等）
  const processPhoto = async (blob: Blob) => {
    // 如果檔案大小不超過 5MB，直接使用原始檔案
    if (blob.size <= 5 * 1024 * 1024) {
      alert('檔案大小小於 5MB，跳過壓縮');
      console.log('檔案大小小於 5MB，跳過壓縮');
      const file = new File([blob], 'photo.jpg', { type: 'image/jpeg' });
      const objectURL = URL.createObjectURL(blob);
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
          // 不為進度顯示 alert，避免過多彈窗
        console.log(`壓縮進度: ${p}%`);
        },
      };

      try {
        alert('開始進行圖片壓縮...');
        console.log('開始進行圖片壓縮...');
        // 將 Blob 轉換為 File 對象
        const file = new File([blob], 'photo.jpg', { type: 'image/jpeg' });
        const compressedFile = await imageCompression(file, options);
        alert(`壓縮後檔案大小: ${(compressedFile.size / 1024 / 1024).toFixed(2)} MB`);
        console.log(`壓縮後檔案大小: ${(compressedFile.size / 1024 / 1024).toFixed(2)} MB`);

        const objectURL = URL.createObjectURL(compressedFile);
        onPhotoChange(objectURL, compressedFile); // 傳遞壓縮後的圖片
      } catch (error) {
        alert(`圖片壓縮失敗: ${error instanceof Error ? error.message : '未知錯誤'}`);
        console.error('圖片壓縮失敗:', error);
        alert('圖片處理失敗，請稍後再試或更換照片。');
        onPhotoChange(null, null);
      }
    }, 100); // 延遲處理，減少即時內存壓力
  };

  return (
    <div className="photo-upload">
      <h3>現場照片</h3>
      
      {/* 相機未開啟且無照片時顯示按鈕 */}
      {!isCameraOpen && !photoDataURL && (
        <div className="photo-actions">
          <button 
            type="button" 
            className="camera-button"
            onClick={handleCaptureClick}
          >
            {isMobile ? '開啟相機拍攝' : '選擇照片'}
          </button>
          {/* 只在非移動裝置上顯示文件輸入控件 */}
          <input
            ref={fileInputRef}
            type="file"
            id="photo-upload-input"
            accept="image/*"
            onChange={handleFileUpload}
            className="photo-input"
            style={{ display: 'none' }}
          />
        </div>
      )}
      
      {/* 相機開啟時顯示預覽和拍照按鈕 */}
      {isCameraOpen && (
        <div className="camera-container" style={{ 
          position: 'relative', 
          width: '100%', 
          maxWidth: '500px', 
          margin: '0 auto',
          border: '1px solid #ccc',
          borderRadius: '8px',
          overflow: 'hidden',
          backgroundColor: '#000'
        }}>
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            className="camera-preview"
            style={{
              display: 'block',
              width: '100%',
              height: 'auto',
              minHeight: '300px',
              objectFit: 'cover',
              backgroundColor: '#000'
            }}
          />
          <div className="camera-controls" style={{
            display: 'flex',
            justifyContent: 'space-around',
            padding: '10px',
            backgroundColor: 'rgba(0,0,0,0.5)'
          }}>
            <button 
              type="button" 
              className="capture-button"
              onClick={takePhoto}
              style={{
                padding: '10px 20px',
                backgroundColor: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              拍照
            </button>
            <button 
              type="button" 
              className="cancel-button"
              onClick={stopCamera}
              style={{
                padding: '10px 20px',
                backgroundColor: '#f44336',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              取消
            </button>
          </div>
        </div>
      )}
      
      {/* 已拍攝照片顯示預覽 */}
      {photoDataURL && (
        <div className="photo-preview">
          <img src={photoDataURL} alt="現場照片" />
          <button 
            type="button" 
            className="retake-button"
            onClick={() => {
              onPhotoChange(null, null); // 清除照片
            }}
          >
            重新拍攝
          </button>
        </div>
      )}
    </div>
  );
};

export default PhotoUpload;
