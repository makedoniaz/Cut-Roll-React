import React from 'react';

const ProfileNotificationsTab = () => {
  return (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h2 className="text-xl font-semibold text-white mb-4">Email Notifications</h2>
        <div className="space-y-4">
          <label className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Security alerts</p>
              <p className="text-gray-400 text-sm">Get notified about security activity</p>
            </div>
            <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500" />
          </label>
          <label className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Product updates</p>
              <p className="text-gray-400 text-sm">Stay informed about new features</p>
            </div>
            <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500" />
          </label>
          <label className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Marketing emails</p>
              <p className="text-gray-400 text-sm">Receive promotional content</p>
            </div>
            <input type="checkbox" className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500" />
          </label>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h2 className="text-xl font-semibold text-white mb-4">Push Notifications</h2>
        <div className="space-y-4">
          <label className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Browser notifications</p>
              <p className="text-gray-400 text-sm">Get real-time updates in your browser</p>
            </div>
            <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500" />
          </label>
        </div>
      </div>
    </div>
  );
};

export default ProfileNotificationsTab;