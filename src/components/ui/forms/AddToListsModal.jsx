import { useState, useCallback } from "react";
import FlexibleSearchInput from "../common/FlexibleSearchInput";
import Modal from "../../layout/Modal";
import { ListsService } from "../../../services/listsService";
import { ListMovieService } from "../../../services/listMovieService";
import { useAuthStore } from "../../../stores/authStore";

function AddToListsModal({ isOpen, onClose, movieId, movieTitle, onMovieAddedToLists }) {
  const { user } = useAuthStore();
  const [selectedLists, setSelectedLists] = useState([]);
  const [isAddingToLists, setIsAddingToLists] = useState(false);

  // Create a stable search function for user's lists
  const listsSearchFunction = useCallback(async (query) => {
    console.log('Lists search function called with query:', query);
    try {
      // Get current user from auth store
      if (!user?.id) {
        console.error('No user ID found');
        return [];
      }

      // Use ListsService to search user's lists
      const searchResults = await ListsService.searchLists({
        userId: user.id,
        title: query,
        page: 0,
        pageSize: 10
      });
      
      console.log('Raw lists search results:', searchResults);
      
      // Transform the results to match the expected format
      if (searchResults && searchResults.data) {
        const transformed = searchResults.data.map(list => ({
          id: list.id,
          name: list.title,
          description: list.description ? list.description.slice(0, 80) + (list.description.length > 80 ? '...' : '') : '',
          image: null, // Lists don't have images
          listData: list // Store original list data for API call
        }));
        console.log('Transformed lists results:', transformed);
        return transformed;
      }
      
      console.log('No lists data found, returning empty array');
      return [];
    } catch (error) {
      console.error('Lists search error:', error);
      return [];
    }
  }, [user?.id]);

  const handleListSelection = (lists) => {
    setSelectedLists(lists);
  };

  const handleAddToLists = async () => {
    if (selectedLists.length === 0) {
      alert('Please select at least one list to add the movie to.');
      return;
    }

    setIsAddingToLists(true);
    
    try {
      console.log('🎬 Starting add movie to lists operation:', {
        movieId,
        movieTitle,
        listCount: selectedLists.length,
        lists: selectedLists.map(list => ({
          listId: list.id,
          title: list.name,
          originalData: list.listData
        }))
      });

      // Add movie to each selected list
      const addPromises = selectedLists.map(async (list) => {
        console.log('🚀 Adding movie to list:', {
          listId: list.id,
          movieId
        });

        const response = await ListMovieService.addMovieToList({
          listId: list.id,
          movieId: movieId
        });

        console.log('📡 Add to list response:', {
          listId: list.id,
          ok: response.ok,
          status: response.status,
          statusText: response.statusText
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to add movie to "${list.name}": ${errorText}`);
        }

        return { listId: list.id, listName: list.name, success: true };
      });

      const results = await Promise.allSettled(addPromises);
      
      // Check results
      const successful = results.filter(result => result.status === 'fulfilled');
      const failed = results.filter(result => result.status === 'rejected');

      if (successful.length > 0) {
        // Call the parent callback to notify movie was added to lists
        if (onMovieAddedToLists) {
          onMovieAddedToLists(selectedLists);
        }

        console.log('✅ Successfully added movie to lists');
        
        if (failed.length === 0) {
          alert(`Successfully added "${movieTitle}" to ${successful.length} list(s)!`);
        } else {
          alert(`Added "${movieTitle}" to ${successful.length} list(s). ${failed.length} failed.`);
        }

        // Reset state and close modal
        setSelectedLists([]);
        onClose();
      } else {
        // All failed
        console.error('❌ All list additions failed');
        alert('Failed to add movie to any lists. Please try again.');
      }
    } catch (error) {
      console.error('💥 Error adding movie to lists:', error);
      alert('Failed to add movie to lists. Please try again.');
    } finally {
      setIsAddingToLists(false);
    }
  };

  const handleClose = () => {
    setSelectedLists([]);
    onClose();
  };

  const handleClearSearch = () => {
    setSelectedLists([]);
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} allowOverflow={true}>
      <div>
        <h2 className="text-2xl font-bold text-white mb-6">Add "{movieTitle}" to Lists</h2>
        
        {/* Lists Search with FlexibleSearchInput */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Search your lists
          </label>
          <FlexibleSearchInput
            placeholder="Search for your lists..."
            searchFunction={listsSearchFunction}
            onSelectedItemsChange={handleListSelection}
            selectedItems={selectedLists}
            maxResults={10}
            debounceMs={500}
            clearable={true}
            multiple={true}
            autoOpen={false}
            onClear={handleClearSearch}
            showSelectedItemsAsTags={true}
            className="w-full"
          />
        </div>

        {/* Selected Lists Summary */}
        {selectedLists.length > 0 && (
          <div className="mb-6">
            <div className="text-sm text-gray-300 mb-2">
              {selectedLists.length} list(s) selected
            </div>
            <div className="max-h-40 overflow-y-auto bg-gray-700/50 rounded-lg p-3">
              {selectedLists.map((list, index) => (
                <div key={list.id} className="flex items-start gap-3 mb-2 last:mb-0">
                  <div className="w-12 h-16 bg-gray-600 rounded flex-shrink-0 flex items-center justify-center">
                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-medium text-sm truncate">
                      {list.name}
                    </div>
                    {list.description && (
                      <div className="text-gray-400 text-xs">
                        {list.description}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors"
            onClick={handleClose}
            disabled={isAddingToLists}
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={selectedLists.length === 0 || isAddingToLists}
            className={`px-4 py-2 rounded-lg transition-colors ${
              selectedLists.length > 0 && !isAddingToLists
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-gray-500 text-gray-300 cursor-not-allowed'
            }`}
            onClick={handleAddToLists}
            title={selectedLists.length === 0 ? 'Please select at least one list to add the movie to' : ''}
          >
            {isAddingToLists ? 'Adding to Lists...' : selectedLists.length === 0 ? 'Select Lists to Add To' : `Add to ${selectedLists.length} List(s)`}
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default AddToListsModal;
