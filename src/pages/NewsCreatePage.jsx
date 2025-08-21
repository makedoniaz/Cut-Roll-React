import React from 'react';
import { useNavigate } from 'react-router-dom';
import NewsForm from '../components/ui/forms/NewsForm';

const NewsCreatePage = () => {
  const navigate = useNavigate();

  const handleBackToNews = () => {
    navigate('/news');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={handleBackToNews}
          className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white transition-colors"
        >
          ← Back to News
        </button>
        <div className="h-6 w-px bg-gray-700"></div>
        <h1 className="text-3xl font-bold text-white">Create News Article</h1>
      </div>
      
      {/* News Form */}
      <NewsForm onClose={handleBackToNews} />
    </div>
  );
};

export default NewsCreatePage;