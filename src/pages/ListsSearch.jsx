import SearchLayout from '../components/search/SearchLayout';
import MovieListCard from '../components/ui/movie-lists/MovieListCard';

const ListsSearch = () => {
  const listsFilters = [
    {
      key: 'sortBy',
      label: 'Sort By',
      type: 'select',
      options: [
        { value: 'recent', label: 'Most Recent' },
        { value: 'popular', label: 'Most Popular' },
        { value: 'rating', label: 'Highest Rated' },
        { value: 'name', label: 'Name A-Z' }
      ],
      defaultValue: 'recent'
    },
    {
      key: 'minMovies',
      label: 'Minimum Movies',
      type: 'range',
      min: 1,
      max: 100,
      defaultValue: [1, 100]
    },
    {
      key: 'isPublic',
      label: 'Visibility',
      type: 'select',
      options: [
        { value: 'all', label: 'All Lists' },
        { value: 'public', label: 'Public Only' },
        { value: 'private', label: 'Private Only' }
      ],
      defaultValue: 'all'
    }
  ];

  const searchTypes = [
    { value: 'all', label: 'All' },
    { value: 'name', label: 'List Name' },
    { value: 'description', label: 'Description' },
    { value: 'author', label: 'Author' }
  ];

  const ListResultCard = ({ item }) => (
    <MovieListCard 
      list={item}
      className="h-full"
    />
  );

  // Mock search function - replace with actual service when available
  const searchLists = async (searchParams) => {
    // This would call an actual ListsService.searchLists method
    console.log('Searching lists with:', searchParams);
    return { items: [], totalCount: 0 };
  };

  return (
    <SearchLayout
      title="Movie Lists Search"
      description="Discover curated movie lists from the community"
      filters={listsFilters}
      searchFunction={searchLists}
      resultComponent={ListResultCard}
      searchTypes={searchTypes}
      defaultSearchType="all"
    />
  );
};

export default ListsSearch;
