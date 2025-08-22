import { useState, useRef } from "react";
import { Camera, Upload, X, FileImage } from "lucide-react";

const MediaUploader = ({ 
  image, 
  onImageChange, 
  videoUrl, 
  onVideoUrlChange, 
  mediaType, 
  onMediaTypeChange,
  disabled = false 
}) => {
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef(null);

  const handleFiles = (files) => {
    if (disabled) return;
    
    const file = files[0]; // Take only the first file
    
    if (!file || !file.type.startsWith('image/')) {
      alert('Please select a valid image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      alert(`File is too large. Maximum size is 10MB.`);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const newImage = {
        id: Date.now(),
        file,
        url: e.target.result,
        name: file.name,
        size: file.size
      };
      onImageChange(newImage); // Replace the image
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e) => {
    if (disabled) return;
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    if (disabled) return;
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleInputChange = (e) => {
    if (disabled) return;
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const removeImage = () => {
    if (disabled) return;
    onImageChange(null);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-4">
        Media
      </label>
      
      {/* Media Type Selector */}
      <div className="mb-4">
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={() => onMediaTypeChange && onMediaTypeChange('image')}
            disabled={disabled}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              mediaType === 'image'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Image
          </button>
          <button
            type="button"
            onClick={() => onMediaTypeChange && onMediaTypeChange('video')}
            disabled={disabled}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              mediaType === 'video'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Video
          </button>
        </div>
      </div>

      {/* Video URL Input */}
      {mediaType === 'video' && (
        <div className="mb-4">
          <div className="flex space-x-2">
            <input
              type="url"
              value={videoUrl}
              onChange={(e) => onVideoUrlChange && onVideoUrlChange(e.target.value)}
              placeholder="Enter video URL..."
              disabled={disabled}
              className={`flex-1 px-4 py-2 rounded-lg bg-gray-900 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                disabled ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            />
            {videoUrl && (
              <button
                type="button"
                onClick={() => onVideoUrlChange && onVideoUrlChange('')}
                disabled={disabled}
                className={`px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors ${
                  disabled ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      )}
      
      {/* Image Upload Section */}
      {mediaType === 'image' && (
        <>
          {/* If no image is selected - show upload zone */}
          {!image && (
            <div
              className={`relative border-2 border-dashed rounded-lg p-6 transition-colors ${
                dragActive
                  ? 'border-blue-400 bg-blue-50/10'
                  : 'border-gray-600 bg-gray-700/50 hover:border-gray-500'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                onChange={handleInputChange}
                disabled={disabled}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="flex space-x-2">
                    <Upload className="h-8 w-8 text-gray-400" />
                    <FileImage className="h-8 w-8 text-gray-400" />
                  </div>
                </div>
                
                <p className="text-gray-300 mb-2">
                  <span className="font-medium">Click to upload</span> or drag and drop
                </p>
                <p className="text-sm text-gray-400">
                  PNG, JPG, GIF up to 10MB
                </p>
                
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  disabled={disabled}
                  className={`mt-4 inline-flex items-center px-4 py-2 rounded-lg transition-colors ${
                    disabled 
                      ? 'bg-gray-500 text-gray-300 cursor-not-allowed' 
                      : 'bg-gray-600 text-white hover:bg-gray-500'
                  }`}
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Choose Image
                </button>
              </div>
            </div>
          )}

          {/* If image is selected - show preview */}
          {image && (
            <div className="space-y-4">
              <div className="relative bg-gray-700 rounded-lg overflow-hidden group">
                <div className="aspect-video relative">
                  <img
                    src={image.url}
                    alt={image.name}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Remove button */}
                  <button
                    onClick={removeImage}
                    disabled={disabled}
                    className={`cursor-pointer absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 ${
                      disabled ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                
                <div className="p-3">
                  <p className="text-white text-sm font-medium truncate">
                    {image.name}
                  </p>
                  <p className="text-gray-400 text-xs">
                    {formatFileSize(image.size)}
                  </p>
                </div>
              </div>
              
              {/* Replace image button */}
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                disabled={disabled}
                className={`cursor-pointer w-full inline-flex items-center justify-center px-4 py-2 rounded-lg transition-colors ${
                  disabled 
                    ? 'bg-gray-500 text-gray-300 cursor-not-allowed' 
                    : 'bg-gray-600 text-white hover:bg-gray-500'
                }`}
              >
                <Camera className="h-4 w-4 mr-2" />
                Replace Image
              </button>
              
              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                onChange={handleInputChange}
                disabled={disabled}
                className="hidden"
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MediaUploader;