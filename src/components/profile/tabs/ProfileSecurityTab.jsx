import React from 'react';

const ProfileSecurityTab = ({
  isEditingPassword,
  formData,
  isLoading,
  localLoading,
  setIsEditingPassword,
  handleInputChange,
  handlePasswordUpdate,
  cancelEdit
}) => {
  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        Password & Security
      </h2>

      {!isEditingPassword ? (
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white font-medium">Password</p>
            <p className="text-gray-400 text-sm">Last updated 3 months ago</p>
          </div>
          <button
            onClick={() => setIsEditingPassword(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
          >
            Change Password
          </button>
        </div>
      ) : (
        <div className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Current Password</label>
            <input
              type="password"
              name="currentPassword"
              value={formData.currentPassword}
              onChange={handleInputChange}
              className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">New Password</label>
            <input
              type="password"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleInputChange}
              className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Confirm New Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex space-x-3">
            <button
              onClick={handlePasswordUpdate}
              disabled={isLoading || localLoading}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              {(isLoading || localLoading) ? 'Updating...' : 'Update Password'}
            </button>
            <button
              onClick={cancelEdit}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="mt-8 space-y-4">
        <h3 className="text-lg font-medium text-white">Two-Factor Authentication</h3>
        <div className="bg-gray-700 rounded-lg p-4 border border-gray-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">2FA Status</p>
              <p className="text-gray-400 text-sm">Add an extra layer of security to your account</p>
            </div>
            <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium">
              Enable 2FA
            </button>
          </div>
        </div>
      </div>

      <div className="mt-8 space-y-4">
        <h3 className="text-lg font-medium text-white">Active Sessions</h3>
        <div className="bg-gray-700 rounded-lg p-4 border border-gray-600">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">Current Session</p>
                <p className="text-gray-400 text-sm">Chrome on Windows • Baku, Azerbaijan</p>
              </div>
              <span className="text-green-400 text-sm">Active now</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSecurityTab;