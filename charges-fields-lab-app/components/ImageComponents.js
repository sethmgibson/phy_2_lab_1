import React from 'react';

// Image Uploader component
export function ImageUploader({ imagePreview, onImageUpload, onRemoveImage, caption, onCaptionChange, figureLabel = "Fig. 1:" }) {
  return (
    <div className="image-upload-section">
      <label htmlFor="imageUpload" className="image-upload-label">
        Upload Screenshot
        <input 
          type="file" 
          id="imageUpload"
          accept="image/*"
          onChange={onImageUpload}
          onPaste={(e) => e.preventDefault()}
          style={{display: 'none'}}
        />
      </label>
      
      {imagePreview && (
        <div className="image-preview-container">
          <div className="image-preview">
            <button 
              type="button" 
              className="remove-image-btn" 
              onClick={onRemoveImage}
              aria-label="Remove image"
            >
              ×
            </button>
            <img src={imagePreview} alt="Screenshot" />
          </div>
          
          <div className="figure-caption">
            <label htmlFor="imageCaption">{figureLabel}</label>
            <input 
              type="text"
              id="imageCaption"
              value={caption || ''}
              onChange={(e) => onCaptionChange(e.target.value)}
              placeholder="Enter caption for this figure..."
              onPaste={(e) => e.preventDefault()}
            />
          </div>
        </div>
      )}
    </div>
  );
} 