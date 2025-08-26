import SearchLayout from '../components/search/SearchLayout';
import Avatar from '../components/ui/users/Avatar';

const UsersSearch = () => {
  const usersFilters = [
    {
      key: 'sortBy',
      label: 'Sort By',
      type: 'select',
      options: [
        { value: 'recent', label: 'Recently Active' },
        { value: 'username', label: 'Username A-Z' },
        { value: 'reviews', label: 'Most Reviews' },
        { value: 'lists', label: 'Most Lists' },
        { value: 'joined', label: 'Recently Joined' }
      ],
      defaultValue: 'recent'
    },
    {
      key: 'minReviews',
      label: 'Minimum Reviews',
      type: 'range',
      min: 0,
      max: 1000,
      defaultValue: [0, 1000]
    },
    {
      key: 'minLists',
      label: 'Minimum Lists',
      type: 'range',
      min: 0,
      max: 100,
      defaultValue: [0, 100]
    },
    {
      key: 'isVerified',
      label: 'Verification Status',
      type: 'select',
      options: [
        { value: 'all', label: 'All Users' },
        { value: 'verified', label: 'Verified Only' },
        { value: 'unverified', label: 'Unverified Only' }
      ],
      defaultValue: 'all'
    }
  ];

  const searchTypes = [
    { value: 'all', label: 'All' },
    { value: 'username', label: 'Username' },
    { value: 'bio', label: 'Bio' },
    { value: 'location', label: 'Location' }
  ];

  const UserResultCard = ({ item }) => (
    <div className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
      <div className="flex items-center space-x-4">
        <Avatar user={item} size="lg" />
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">{item.username}</h3>
          <p className="text-sm text-gray-600">{item.bio || 'No bio available'}</p>
          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
            <span>{item.reviewCount || 0} reviews</span>
            <span>{item.listCount || 0} lists</span>
            <span>Joined {new Date(item.joinDate).getFullYear()}</span>
          </div>
        </div>
      </div>
    </div>
  );

  // Mock search function - replace with actual service when available
  const searchUsers = async (searchParams) => {
    // This would call an actual UsersService.searchUsers method
    console.log('Searching users with:', searchParams);
    return { items: [], totalCount: 0 };
  };

  return (
    <SearchLayout
      title="Users Search"
      description="Find and connect with other movie enthusiasts"
      filters={usersFilters}
      searchFunction={searchUsers}
      resultComponent={UserResultCard}
      searchTypes={searchTypes}
      defaultSearchType="all"
    />
  );
};

export default UsersSearch;
