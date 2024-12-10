import React, { useState, useEffect } from 'react';
import Card from '../components/Card';

export default function Places() {
  const [places, setPlaces] = useState([]);
  const [categories, setCategories] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    document.title = 'Third Space Finder - Explore Places Page';
    fetchPlacesAndCategories();
    const storedFavorites = localStorage.getItem('favorites');
    if (storedFavorites) setFavorites(JSON.parse(storedFavorites));
  }, []);

  const fetchPlacesAndCategories = async () => {
    try {
      const [placesRes, categoriesRes] = await Promise.all([
        fetch(`${process.env.REACT_APP_API_URL}/places`),
        fetch(`${process.env.REACT_APP_API_URL}/categories`)
      ]);
      const [placesData, categoriesData] = await Promise.all([placesRes.json(), categoriesRes.json()]);
      setPlaces(placesData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const toggleFavorite = (placeId) => {
    const newFavorites = favorites.includes(placeId) 
      ? favorites.filter(id => id !== placeId) 
      : [...favorites, placeId];
    setFavorites(newFavorites);
    localStorage.setItem('favorites', JSON.stringify(newFavorites));
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find(cat => cat.category_ID === categoryId);
    return category ? category.category : 'Unknown Category';
  };

  const filteredAndSortedPlaces = places
    .filter(place => {
      const searchField = searchType === 'name' ? place.place_name : getCategoryName(place.category_ID);
      return searchField.toLowerCase().includes(searchTerm.toLowerCase());
    })
    .sort((a, b) => {
      const fieldA = searchType === 'name' ? a.place_name : getCategoryName(a.category_ID);
      const fieldB = searchType === 'name' ? b.place_name : getCategoryName(b.category_ID);
      return sortOrder === 'asc' ? fieldA.localeCompare(fieldB) : fieldB.localeCompare(fieldA);
    });

  const createSlug = (name) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4 text-gray-800">Explore Places</h1>
      <div className="mb-4 flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          placeholder={`Search by ${searchType}...`}
          className="flex-grow p-2 border border-gray-300 rounded text-gray-800"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          className="p-2 border border-gray-300 rounded text-gray-800"
          value={searchType}
          onChange={(e) => setSearchType(e.target.value)}
        >
          <option value="name">Search by Name</option>
          <option value="category">Search by Category</option>
        </select>
        <button
          className="p-2 bg-emerald-500 text-white rounded hover:bg-emerald-600"
          onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
        >
          Sort {sortOrder === 'asc' ? '↑' : '↓'}
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAndSortedPlaces.map(place => (
          <Card
            key={place.place_ID}
            id={place.place_ID}
            title={place.place_name}
            subtitle={getCategoryName(place.category_ID)}
            description={place.place_address}
            linkTo={`/places/${createSlug(place.place_name)}`}
            isFavorite={favorites.includes(place.place_ID)}
            onToggleFavorite={toggleFavorite}
          />
        ))}
      </div>
    </div>
  );
}