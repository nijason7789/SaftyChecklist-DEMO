import React, { useState } from 'react';
import ImageAnnotator from '../ImageAnnotator';
import './EnhancedPhotoUpload.css';

interface EnhancedPhotoUploadProps {
  photoDataURL: string | null;
  onPhotoChange: (dataURL: string | null, file: File | null) => void;
}

const EnhancedPhotoUpload: React.FC<EnhancedPhotoUploadProps> = ({
  photoDataURL,
  onPhotoChange,
}) => {
  const [showAnnotator, setShowAnnotator] = useState(false);

  const handlePhotoClick = () => {
    setShowAnnotator(true);
  };

  const handleAnnotatorSave = (annotatedImageDataURL: string) => {
    // Convert data URL to File object for upload
    const byteString = atob(annotatedImageDataURL.split(',')[1]);
    const mimeString = annotatedImageDataURL.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    
    const blob = new Blob([ab], { type: mimeString });
    const file = new File([blob], `annotated-image-${Date.now()}.png`, { type: 'image/png' });
    
    onPhotoChange(annotatedImageDataURL, file);
  };

  return (
    <div className="enhanced-photo-upload">
      <h3>現場照片</h3>
      <div 
        className="photo-display" 
        onClick={handlePhotoClick}
      >
        {photoDataURL ? (
          <img src={photoDataURL} alt="現場照片" />
        ) : (
          <div className="photo-placeholder">
            點擊此處上傳照片
          </div>
        )}
      </div>

      {showAnnotator && (
        <ImageAnnotator
          isVisible={showAnnotator}
          initialImage={photoDataURL}
          onClose={() => setShowAnnotator(false)}
          onSave={handleAnnotatorSave}
        />
      )}
    </div>
  );
};

export default EnhancedPhotoUpload;
