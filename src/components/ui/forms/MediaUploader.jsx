import { useState, useRef } from "react";
import { Camera, Upload, X, FileImage, Video, Link } from "lucide-react";

const MediaUploader = ({ image, onImageChange, videoUrl, onVideoUrlChange, mediaType, onMediaTypeChange }) => {
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef(null);

  const handleFiles = (files) => {
    const file = files[0]; // Берем только первый файл
    
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
      onImageChange(newImage); // Заменяем изображение
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const removeImage = () => {
    onImageChange(null);
  };

  const handleMediaTypeChange = (type) => {
    // Очищаем данные при смене типа
    if (type === 'image') {
      onVideoUrlChange('');
    } else {
      onImageChange(null);
    }
    onMediaTypeChange(type);
  };

  const getYouTubeVideoId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const renderVideoPreview = () => {
    if (!videoUrl) return null;
    
    const youtubeId = getYouTubeVideoId(videoUrl);
    
    if (youtubeId) {
      return (
        <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden">
          <iframe
            src={`https://www.youtube.com/embed/${youtubeId}`}
            title="YouTube video preview"
            className="w-full h-full"
            allowFullScreen
          />
        </div>
      );
    }
    
    // Для других видео ссылок показываем превью
    return (
      <div className="aspect-video bg-gray-700 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <Video className="h-12 w-12 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-300 text-sm">Video Link</p>
          <p className="text-gray-400 text-xs truncate max-w-xs">{videoUrl}</p>
        </div>
      </div>
    );
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
      
      {/* Переключатель типа медиа */}
      <div className="flex bg-gray-700 rounded-lg p-1 mb-6">
        <button
          type="button"
          onClick={() => handleMediaTypeChange('image')}
          className={`cursor-pointer flex-1 flex items-center justify-center px-4 py-2 rounded-md transition-colors ${
            mediaType === 'image'
              ? 'bg-green-700 text-white'
              : 'text-gray-300 hover:text-white'
          }`}
        >
          <FileImage className="h-4 w-4 mr-2" />
          Image
        </button>
        <button
          type="button"
          onClick={() => handleMediaTypeChange('video')}
          className={`cursor-pointer flex-1 flex items-center justify-center px-4 py-2 rounded-md transition-colors ${
            mediaType === 'video'
              ? 'bg-green-700 text-white'
              : 'text-gray-300 hover:text-white'
          }`}
        >
          <Video className="h-4 w-4 mr-2" />
          Video Link
        </button>
      </div>

      {/* Контент для изображения */}
      {mediaType === 'image' && (
        <>
          {/* Если изображение не выбрано - показываем зону загрузки */}
          {!image && (
            <div
              className={`relative border-2 border-dashed rounded-lg p-6 transition-colors ${
                dragActive
                  ? 'border-blue-400 bg-blue-50/10'
                  : 'border-gray-600 bg-gray-700/50 hover:border-gray-500'
              }`}
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
                  className="mt-4 inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors"
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Choose Image
                </button>
              </div>
            </div>
          )}

          {/* Если изображение выбрано - показываем превью */}
          {image && (
            <div className="space-y-4">
              <div className="relative bg-gray-700 rounded-lg overflow-hidden group">
                <div className="aspect-video relative">
                  <img
                    src={image.url}
                    alt={image.name}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Кнопка удаления */}
                  <button
                    onClick={removeImage}
                    className="cursor-pointer absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
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
              
              {/* Кнопка замены изображения */}
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="cursor-pointer w-full inline-flex items-center justify-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors"
              >
                <Camera className="h-4 w-4 mr-2" />
                Replace Image
              </button>
              
              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                onChange={handleInputChange}
                className="hidden"
              />
            </div>
          )}
        </>
      )}

      {/* Контент для видео ссылки */}
      {mediaType === 'video' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Video URL
            </label>
            <div className="relative">
              <input
                type="url"
                value={videoUrl}
                onChange={(e) => onVideoUrlChange(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=... or other video URL"
                className="w-full px-4 py-3 pl-10 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
            <p className="mt-2 text-xs text-gray-400">
              Supports YouTube, Vimeo, and other video platforms
            </p>
          </div>

          {/* Превью видео */}
          {videoUrl && (
            <div className="space-y-3">
              {renderVideoPreview()}
              
              <button
                type="button"
                onClick={() => onVideoUrlChange('')}
                className="cursor-pointer w-full inline-flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <X className="h-4 w-4 mr-2" />
                Remove Video
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MediaUploader