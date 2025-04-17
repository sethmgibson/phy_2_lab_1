// Generic image upload handler
export function handleImageUpload(imageKey, previewSetter, handleChange) {
  return (e) => {
    const file = e.target.files[0];
    if (file) {
      // Create a preview URL for the image
      const previewUrl = URL.createObjectURL(file);
      previewSetter(previewUrl);
      
      // Store the file in answers state
      handleChange(imageKey, file);
      
      // Clear the file input (to allow selecting the same file again if needed)
      e.target.value = null;
    }
  };
}

// Generic image removal handler
export function handleRemoveImage(imageKey, previewState, previewSetter, handleChange) {
  return () => {
    // Clear the image preview
    if (previewState) {
      URL.revokeObjectURL(previewState);
      previewSetter(null);
    }
    
    // Clear the image from state
    handleChange(imageKey, null);
  };
} 