import React from 'react';

const ProfileInfoTab = ({
  user,
  isEditingUsername,
  isEditingEmail,
  formData,
  isLoading,
  localLoading,
  setIsEditingUsername,
  setIsEditingEmail,
  handleInputChange,
  handleUsernameUpdate,
  handleEmailUpdate,
  cancelEdit
}) => {
  // Helper function to convert numeric role to string value
  const getRoleLabel = (roleNumeric) => {
    switch (roleNumeric) {
      case 0:
        return 'Admin';
      case 1:
        return 'User';
      case 2:
        return 'Publisher';
      default:
        return roleNumeric || 'No Role';
    }
  };
  return (
    <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          Profile Information
        </h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Username</label>
            {!isEditingUsername ? (
              <div className="flex items-center justify-between bg-gray-700 p-3 rounded-md border border-gray-600">
                <span className="text-white">{user.username}</span>
                <button
                  onClick={() => setIsEditingUsername(true)}
                  className="text-blue-400 hover:text-blue-300 text-sm font-medium"
                >
                  Edit
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter new username"
                />
                <div className="flex space-x-3">
                  <button
                    onClick={handleUsernameUpdate}
                    disabled={isLoading || localLoading}
                    className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-md text-sm font-medium"
                  >
                    {(isLoading || localLoading) ? 'Updating...' : 'Update Username'}
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
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Role</label>
            <div className="bg-gray-700 p-3 rounded-md border border-gray-600">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                {getRoleLabel(user.role)}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Member Since</label>
            <div className="bg-gray-700 p-3 rounded-md border border-gray-600">
              <span className="text-white">{new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          Email Settings
        </h2>

        {!isEditingEmail ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Email Address</label>
              <div className="flex items-center justify-between bg-gray-700 p-3 rounded-md border border-gray-600">
                <span className="text-white">{user.email}</span>
                <button
                  onClick={() => setIsEditingEmail(true)}
                  className="text-blue-400 hover:text-blue-300 text-sm font-medium"
                >
                  Edit
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">New Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter new email address"
              />
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleEmailUpdate}
                disabled={isLoading || localLoading}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                {(isLoading || localLoading) ? 'Updating...' : 'Update Email'}
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
      </div>
    </div>
  );
};

export default ProfileInfoTab;