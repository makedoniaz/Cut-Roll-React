# FlexibleSearchInput Component

A flexible, reusable search input component with dropdown functionality that accepts a search function as a prop. Supports both single and multiple selection modes.

## Features

- 🔍 **Flexible Search**: Accepts any search function as a prop
- ⏱️ **Debounced Search**: Configurable debounce time (default: 3 seconds)
- 📊 **Limited Results**: Shows up to 10 results by default (configurable)
- 🏷️ **Selected Items**: Displays selected items as removable tags
- ✨ **Multiple Selection**: Support for both single and multiple item selection
- 🎨 **Customizable**: Configurable styling and behavior
- ♿ **Accessible**: Keyboard navigation and screen reader support
- 📱 **Responsive**: Works on all screen sizes

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `placeholder` | `string` | `"Search..."` | Placeholder text for the input |
| `searchFunction` | `function` | **required** | Async function that performs the search |
| `onSelect` | `function` | `undefined` | Callback when an item is selected (single mode) |
| `value` | `string` | `""` | Controlled input value |
| `onChange` | `function` | `undefined` | Callback when input value changes |
| `className` | `string` | `""` | Additional CSS classes |
| `maxResults` | `number` | `10` | Maximum number of results to show |
| `debounceMs` | `number` | `3000` | Debounce time in milliseconds |
| `disabled` | `boolean` | `false` | Whether the input is disabled |
| `clearable` | `boolean` | `true` | Whether to show clear button |
| `multiple` | `boolean` | `false` | Enable multiple selection mode |
| `selectedItems` | `array` | `[]` | Array of selected items (multiple mode) |
| `onSelectedItemsChange` | `function` | `undefined` | Callback when selected items change (multiple mode) |

## Search Function Signature

The `searchFunction` prop should be an async function that:

```javascript
const searchFunction = async (query) => {
  // query: string - the search term
  // return: Promise<Array> - array of items with at least { id, name/title/label }
  
  const results = await api.search(query);
  return results;
};
```

## Expected Item Structure

Search results should be objects with at least these properties:

```javascript
{
  id: string | number,           // Required: unique identifier
  name: string,                  // Primary display text (or title/label)
  description: string,           // Optional: secondary text
  image: string                  // Optional: image URL
}
```

## Usage Examples

### Single Selection Mode (Default)

```jsx
import FlexibleSearchInput from './components/ui/common/FlexibleSearchInput';

const MyComponent = () => {
  const searchMovies = async (query) => {
    const response = await fetch(`/api/movies/search?q=${query}`);
    return response.json();
  };

  const handleSelect = (movie) => {
    console.log('Selected:', movie);
  };

  return (
    <FlexibleSearchInput
      placeholder="Search movies..."
      searchFunction={searchMovies}
      onSelect={handleSelect}
    />
  );
};
```

### Multiple Selection Mode

```jsx
const [selectedGenres, setSelectedGenres] = useState([]);

<FlexibleSearchInput
  placeholder="Search for genres..."
  searchFunction={searchGenres}
  multiple={true}
  selectedItems={selectedGenres}
  onSelectedItemsChange={setSelectedGenres}
  maxResults={10}
  debounceMs={1000}
/>
```

### With Custom Configuration

```jsx
<FlexibleSearchInput
  placeholder="Search users..."
  searchFunction={searchUsers}
  onSelect={handleUserSelect}
  maxResults={5}
  debounceMs={1000}
  className="max-w-md"
  clearable={false}
/>
```

### Controlled Input

```jsx
const [searchValue, setSearchValue] = useState('');

<FlexibleSearchInput
  value={searchValue}
  onChange={setSearchValue}
  searchFunction={searchFunction}
  onSelect={handleSelect}
/>
```

## Selection Modes

### Single Selection Mode (`multiple={false}`)
- Only one item can be selected at a time
- Uses `onSelect` callback
- Selected item appears in input field
- Suitable for single-choice scenarios

### Multiple Selection Mode (`multiple={true}`)
- Multiple items can be selected
- Uses `selectedItems` and `onSelectedItemsChange` props
- Selected items displayed as removable tags above input
- Toggle behavior: click to select/deselect
- Suitable for multi-choice scenarios like genres, keywords, etc.

## Styling

The component uses Tailwind CSS classes and follows the existing design system:

- **Input**: Dark theme with green focus border
- **Dropdown**: Dark background with hover effects
- **Selected Items**: Green tags with remove buttons
- **Loading State**: Centered loading text
- **No Results**: Centered "No results found" message
- **Multiple Selection**: Visual indicators for selected items in dropdown

## Accessibility

- Keyboard navigation support
- Screen reader friendly
- Proper ARIA labels
- Focus management
- Click outside to close dropdown
- Clear visual feedback for selected states

## Performance

- Debounced search to prevent excessive API calls
- Configurable result limits
- Efficient re-renders with React hooks
- Cleanup on unmount
- Optimized for both single and multiple selection modes

## Dependencies

- React 16.8+ (for hooks)
- Lucide React (for icons)
- Tailwind CSS (for styling)

## Use Cases

### Single Selection
- Movie search
- User search
- Single category selection

### Multiple Selection
- Genre selection for movies
- Keyword/tag selection
- Multi-category filtering
- User role assignment
