/**
 * Utility functions for handling avatar URLs with cache-busting
 */

// Store cache keys for different users
const avatarCacheKeys = new Map();

/**
 * Get avatar URL with cache-busting parameter
 * @param {string} avatarPath - The avatar path from the user object
 * @param {string|number} userId - User ID to track cache keys
 * @returns {string} Avatar URL with cache-busting parameter
 */
export const getAvatarUrl = (avatarPath, userId = null) => {
  if (!avatarPath) {
    return '/default-avatar.png';
  }

  // If userId is provided, use user-specific cache key
  if (userId) {
    const cacheKey = avatarCacheKeys.get(userId) || Date.now();
    return `${avatarPath}?t=${cacheKey}`;
  }

  // Fallback to current timestamp for general use
  return `${avatarPath}?t=${Date.now()}`;
};

/**
 * Update cache key for a specific user (call this when avatar is updated)
 * @param {string|number} userId - User ID
 */
export const updateAvatarCache = (userId) => {
  if (userId) {
    avatarCacheKeys.set(userId, Date.now());
  }
};

/**
 * Clear cache key for a specific user
 * @param {string|number} userId - User ID
 */
export const clearAvatarCache = (userId) => {
  if (userId) {
    avatarCacheKeys.delete(userId);
  }
};

/**
 * Clear all avatar cache keys
 */
export const clearAllAvatarCache = () => {
  avatarCacheKeys.clear();
};
