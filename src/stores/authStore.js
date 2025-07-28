import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { STORAGE_KEYS } from '../constants';
import { AuthService } from '../services/authService.js';
import { parseJWT, isTokenExpired } from '../utils/jwt.js';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      // State
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      isVerifying: false,
      verifyPromise: null,

      // Actions
      login: async (credentials) => {
        set({ isLoading: true, error: null });
        
        try {
          const { data, userInfo } = await AuthService.login(credentials);

          set({
            user: userInfo,
            token: data.jwt,
            refreshToken: data.refresh,
            isAuthenticated: true,
            isLoading: false,
            error: null
          });

          return { success: true, user: userInfo };
        } catch (error) {
          set({
            error: error.message,
            isLoading: false
          });
          return { success: false, error: error.message };
        }
      },

      loginGoogle: async (tokens) => {
        set({ isLoading: true, error: null });
        
        try {
          const userInfo = await AuthService.loginGoogle(tokens);

          set({
            user: userInfo,
            token: tokens.jwt,
            refreshToken: tokens.refresh,
            isAuthenticated: true,
            isLoading: false,
            error: null
          });

          return { success: true, user: userInfo };

          } catch (error) {
          set({
            error: error.message,
            isLoading: false
          });

          return { success: false, error: error.message };
        }
      },

      register: async (userData) => {
        set({ isLoading: true, error: null });
        
        try {
          await AuthService.register(userData);
          set({ isLoading: false, error: null });
          return { success: true };
        } catch (error) {
          set({
            error: error.message,
            isLoading: false
          });
          return { success: false, error: error.message };
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
          error: null,
          isVerifying: false,
          verifyPromise: null
        });
      },

      refreshAccessToken: async () => {
        const { refreshToken: currentRefreshToken, token } = get();
        
        try {
          const data = await AuthService.refreshToken(currentRefreshToken);

          const updatedUserInfo = parseJWT(data.jwt);
          
          set({
            token: data.jwt,
            refreshToken: data.refresh || currentRefreshToken,
            user: updatedUserInfo || get().user
          });
          
          return true;
        } catch (error) {
          console.error('Token refresh failed:', error);
          get().logout();
          return false;
        }
      },

      updateProfile: async (profileData) => {
        set({ isLoading: true, error: null });
        
        try {
          const updatedUser = await AuthService.updateProfile(profileData);
          
          set({
            user: updatedUser,
            isLoading: false
          });
          
          return { success: true, user: updatedUser };
        } catch (error) {
          set({
            error: error.message,
            isLoading: false
          });
          return { success: false, error: error.message };
        }
      },

      verifyToken: async () => {
        const { token, isVerifying, verifyPromise } = get();

        // Return existing promise if already verifying
        if (isVerifying && verifyPromise) {
          return verifyPromise;
        }

        // No token available
        if (!token) {
          return false;
        }

        const promise = (async () => {
          set({ isLoading: true, isVerifying: true });

          try {
            if (isTokenExpired(token)) {
              console.log('Token expired, attempting refresh...');
              const refreshed = await get().refreshAccessToken();
              
              if (!refreshed) {
                console.log('Token refresh failed');
                return false;
              }
              
              console.log('Token refreshed successfully');
            }

            return true;
          } catch (error) {
            console.error('Token verification failed:', error);
            get().logout();
            return false;
          } finally {
            set({
              isLoading: false,
              isVerifying: false,
              verifyPromise: null
            });
          }
        })();

        set({ verifyPromise: promise });
        return promise;
      },

      // Utility methods
      clearError: () => set({ error: null }),
      
      checkAuth: () => {
        const { token, user } = get();
        return !!(token && user);
      },

      // Expose parseJWT as a store method for external use
      parseJWT
    }),
    {
      name: STORAGE_KEYS.USER_DATA,
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
);