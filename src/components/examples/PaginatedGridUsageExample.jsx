import { useState } from 'react';
import PaginatedGridContainer from '../layout/PaginatedGridContainer';
import MovieCard from '../ui/MovieCard';

const PaginatedGridUsageExample = () => {
  const movies = [
    { id: 1, title: 'The Matrix Reloaded', year: 2003, poster: '🎬', rating: 4 },
    { id: 2, title: 'Inception Dreams', year: 2010, poster: '🎭', rating: 5 },
    { id: 3, title: 'Interstellar Journey', year: 2014, poster: '🚀', rating: 5 },
    { id: 4, title: 'The Dark Knight Rises', year: 2012, poster: '🦇', rating: 4 },
    { id: 5, title: 'Pulp Fiction Classic', year: 1994, poster: '🔫', rating: 5 },
    { id: 6, title: 'Fight Club Rules', year: 1999, poster: '👊', rating: 4 },
    { id: 7, title: 'Forrest Gump Run', year: 1994, poster: '🏃', rating: 5 },
    { id: 8, title: 'The Godfather Legacy', year: 1972, poster: '👑', rating: 5 },
    { id: 9, title: 'Goodfellas Story', year: 1990, poster: '🕴️', rating: 4 },
    { id: 10, title: 'Scarface Power', year: 1983, poster: '💰', rating: 4 },
    { id: 11, title: 'Casino Nights', year: 1995, poster: '🎰', rating: 4 },
    { id: 12, title: 'Heat Streets', year: 1995, poster: '🔥', rating: 5 },
    { id: 13, title: 'Taxi Driver City', year: 1976, poster: '🚕', rating: 5 },
    { id: 14, title: 'Apocalypse Now War', year: 1979, poster: '🚁', rating: 5 },
    { id: 15, title: 'Full Metal Jacket', year: 1987, poster: '🪖', rating: 4 },
    { id: 16, title: 'Blade Runner Future', year: 1982, poster: '🤖', rating: 4 },
    { id: 17, title: 'Terminator Time', year: 1984, poster: '🦾', rating: 4 },
    { id: 18, title: 'Alien Space', year: 1979, poster: '👽', rating: 5 },
    { id: 19, title: 'Star Wars Hope', year: 1977, poster: '⭐', rating: 5 },
    { id: 20, title: 'Empire Strikes Back', year: 1980, poster: '🌌', rating: 5 },
    { id: 21, title: 'Return of the Jedi', year: 1983, poster: '🗡️', rating: 4 },
    { id: 22, title: 'Raiders Lost Ark', year: 1981, poster: '🎩', rating: 5 },
    { id: 23, title: 'Temple of Doom', year: 1984, poster: '💎', rating: 4 },
    { id: 24, title: 'Last Crusade', year: 1989, poster: '🏺', rating: 4 },
    { id: 25, title: 'Back to Future', year: 1985, poster: '⏰', rating: 5 },
    { id: 26, title: 'Ghostbusters', year: 1984, poster: '👻', rating: 4 },
    { id: 27, title: 'Top Gun', year: 1986, poster: '✈️', rating: 4 },
    { id: 28, title: 'Die Hard', year: 1988, poster: '💥', rating: 5 },
    { id: 29, title: 'Lethal Weapon', year: 1987, poster: '🔫', rating: 4 },
    { id: 30, title: 'Beverly Hills Cop', year: 1984, poster: '👮', rating: 4 }
  ];
  
  const products = [
    { id: 1, name: 'MacBook Pro M3', price: '$1,999', category: 'Laptop' },
    { id: 2, name: 'iPhone 15 Pro', price: '$1,199', category: 'Smartphone' },
    { id: 3, name: 'AirPods Pro 2', price: '$249', category: 'Audio' },
    { id: 4, name: 'iPad Air 5th Gen', price: '$599', category: 'Tablet' },
    { id: 5, name: 'Apple Watch Ultra', price: '$799', category: 'Wearable' },
    { id: 6, name: 'Mac Studio M2', price: '$1,999', category: 'Desktop' },
    { id: 7, name: 'Studio Display', price: '$1,599', category: 'Monitor' },
    { id: 8, name: 'Magic Keyboard', price: '$179', category: 'Accessory' },
    { id: 9, name: 'Magic Mouse', price: '$99', category: 'Accessory' },
    { id: 10, name: 'Magic Trackpad', price: '$149', category: 'Accessory' },
    { id: 11, name: 'HomePod mini', price: '$99', category: 'Audio' },
    { id: 12, name: 'Apple TV 4K', price: '$179', category: 'Streaming' },
    { id: 13, name: 'AirTag 4-pack', price: '$99', category: 'Accessory' },
    { id: 14, name: 'MagSafe Charger', price: '$39', category: 'Accessory' },
    { id: 15, name: 'Lightning Cable', price: '$19', category: 'Cable' },
    { id: 16, name: 'USB-C Cable', price: '$19', category: 'Cable' }
  ];
  
  const [activeTab, setActiveTab] = useState('movies');
  
  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4">
        
        
        {/* Movie Grid */}
        {activeTab === 'movies' && (
          <div>
            <PaginatedGridContainer
              items={movies}
              itemsPerRow={6}
              rows={2}
              renderItem={(movie) => <MovieCard movie={movie} />}
              itemHeight="h-64"
              gap="gap-6"
            />
          </div>
        )}
        
        {/* Product Grid */}
        {activeTab === 'products' && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center">
              <span className="mr-3">🛍️</span>
              Product Catalog
            </h2>
            <PaginatedGridContainer
              items={products}
              itemsPerRow={4}
              rows={2}
              renderItem={(product) => <ProductCard product={product} />}
              itemHeight="h-64"
              gap="gap-6"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default PaginatedGridUsageExample;