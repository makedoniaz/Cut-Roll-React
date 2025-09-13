import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TextInput from '../components/ui/forms/inputs/TextInput';
import TextArea from '../components/ui/forms/inputs/TextArea';
import { ListsService } from '../services/listsService';
import { useAuthStore } from '../stores/authStore';

const ListCreate = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Check authentication status when component loads
  useEffect(() => {
    if (!isAuthenticated) {
      setError('You must be logged in to create a list. Please log in and try again.');
    } else {
      setError('');
    }
  }, [isAuthenticated]);

  const handleBackToLists = () => {
    navigate('/lists');
  };

  const handleCreateList = async () => {
    if (!isAuthenticated) {
      setError('You must be logged in to create a list.');
      return;
    }

    if (!title.trim()) {
      setError('Please enter a title for your list.');
      return;
    }

    if (title.length > 150) {
      setError('Title must be 150 characters or less.');
      return;
    }

    if (!description.trim()) {
      setError('Please enter a description for your list.');
      return;
    }

    if (description.length > 1000) {
      setError('Description must be 1000 characters or less.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const listData = {
        userId: user.id,
        title: title.trim(),
        description: description.trim()
      };

      const createdListId = await ListsService.createList(listData);
      
      // Navigate to the newly created list
      navigate(`/lists/${createdListId}`);
    } catch (err) {
      console.error('Error creating list:', err);
      setError(err.message || 'Failed to create list. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={handleBackToLists}
          className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white transition-colors"
        >
          ← Back to Lists
        </button>
        <div className="h-6 w-px bg-gray-700"></div>
        <h1 className="text-3xl font-bold text-white">Create New List</h1>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-900/20 border border-red-600/30 rounded-lg">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {/* List Form */}
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="space-y-6">
          <TextInput
            label="List Title"
            value={title}
            onChange={setTitle}
            placeholder="Enter your list title..."
            required
            disabled={!isAuthenticated}
            maxLength={150}
            showCharCount={true}
          />

          <TextArea
            label="List Description"
            value={description}
            onChange={setDescription}
            placeholder="Describe your list..."
            required
            rows={6}
            maxLength={1000}
            showCharCount={true}
            disabled={!isAuthenticated}
          />

          <div className="flex justify-between">
            <div className="text-sm text-gray-400">
              Create a new list to organize your favorite movies
            </div>
            
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={handleCreateList}
                disabled={isSubmitting || !isAuthenticated}
                className={`cursor-pointer px-6 py-2 rounded-lg transition-colors ${
                  isSubmitting || !isAuthenticated
                    ? 'bg-gray-500 text-gray-300 cursor-not-allowed' 
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {isSubmitting ? 'Creating...' : 'Create List'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListCreate;
