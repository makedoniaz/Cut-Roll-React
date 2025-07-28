import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { STORAGE_KEYS } from '../constants';

export const useUIStore = create(
  persist(
    (set, get) => ({
      // Theme
      theme: 'dark',
      
      // Modals
      modals: {
        loginModal: false,
        registerModal: false,
        movieModal: false,
        listModal: false,
        reviewModal: false,
      },
      
      // Current modal data
      modalData: null,
      
      // Search
      searchQuery: '',
      searchResults: [],
      searchLoading: false,
      
      // Notifications/Toasts
      notifications: [],
      
      // Sidebar (mobile)
      sidebarOpen: false,
      
      // Movie filters
      movieFilters: {
        genre: '',
        year: '',
        rating: '',
        sortBy: 'popularity.desc'
      },
      
      // View preferences
      viewMode: 'grid', // 'grid' or 'list'
      
      // Theme Actions
      setTheme: (theme) => set({ theme }),
      toggleTheme: () => set((state) => ({
        theme: state.theme === 'dark' ? 'light' : 'dark'
      })),
      
      // Modal Actions
      openModal: (modalName, data = null) => set((state) => ({
        modals: { ...state.modals, [modalName]: true },
        modalData: data
      })),
      
      closeModal: (modalName) => set((state) => ({
        modals: { ...state.modals, [modalName]: false },
        modalData: null
      })),
      
      closeAllModals: () => set({
        modals: {
          loginModal: false,
          registerModal: false,
          movieModal: false,
          listModal: false,
          reviewModal: false,
        },
        modalData: null
      }),
      
      // Search Actions
      setSearchQuery: (query) => set({ searchQuery: query }),
      setSearchResults: (results) => set({ searchResults: results }),
      setSearchLoading: (loading) => set({ searchLoading: loading }),
      clearSearch: () => set({
        searchQuery: '',
        searchResults: [],
        searchLoading: false
      }),
      
      // Notification Actions
      addNotification: (notification) => {
        const id = Date.now().toString();
        const newNotification = {
          id,
          type: 'info', // 'success', 'error', 'warning', 'info'
          title: '',
          message: '',
          duration: 5000,
          ...notification
        };
        
        set((state) => ({
          notifications: [...state.notifications, newNotification]
        }));
        
        // Auto remove after duration
        if (newNotification.duration > 0) {
          setTimeout(() => {
            get().removeNotification(id);
          }, newNotification.duration);
        }
        
        return id;
      },
      
      removeNotification: (id) => set((state) => ({
        notifications: state.notifications.filter(notif => notif.id !== id)
      })),
      
      clearAllNotifications: () => set({ notifications: [] }),
      
      // Sidebar Actions
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      
      // Filter Actions
      setMovieFilter: (filterName, value) => set((state) => ({
        movieFilters: { ...state.movieFilters, [filterName]: value }
      })),
      
      resetMovieFilters: () => set({
        movieFilters: {
          genre: '',
          year: '',
          rating: '',
          sortBy: 'popularity.desc'
        }
      }),
      
      // View Mode Actions
      setViewMode: (mode) => set({ viewMode: mode }),
      toggleViewMode: () => set((state) => ({
        viewMode: state.viewMode === 'grid' ? 'list' : 'grid'
      })),
      
      // Quick notification helpers
      showSuccess: (message, title = 'Success') => {
        return get().addNotification({
          type: 'success',
          title,
          message
        });
      },
      
      showError: (message, title = 'Error') => {
        return get().addNotification({
          type: 'error',
          title,
          message,
          duration: 8000 // Longer duration for errors
        });
      },
      
      showWarning: (message, title = 'Warning') => {
        return get().addNotification({
          type: 'warning',
          title,
          message
        });
      },
      
      showInfo: (message, title = 'Info') => {
        return get().addNotification({
          type: 'info',
          title,
          message
        });
      }
    }),
    {
      name: STORAGE_KEYS.THEME,
      partialize: (state) => ({
        theme: state.theme,
        viewMode: state.viewMode,
        movieFilters: state.movieFilters
      })
    }
  )
);