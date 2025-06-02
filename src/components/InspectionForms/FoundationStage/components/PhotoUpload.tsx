import React, { useState } from 'react';

interface PhotoUploadProps {
  onPhotoChange: (photoDataURL: string | null) => void;
  photoDataURL: string | null;
}

const PhotoUpload: React.FC<PhotoUploadProps> = ({ onPhotoChange, photoDataURL }) => {
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        onPhotoChange(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="photo-upload">
      <h3>現場照片</h3>
      <input
        type="file"
        id="photo-upload"
        accept="image/*"
        onChange={handlePhotoUpload}
      />
      {photoDataURL && (
        <div className="photo-preview">
          <img src={photoDataURL} alt="現場照片" />
        </div>
      )}
    </div>
  );
};

export default PhotoUpload;
