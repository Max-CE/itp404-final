import React, { useState, useEffect } from 'react';
import Card from '../components/Card';

const Favorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [places, setPlaces] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    document.title = 'Third Place Finder - Your Favorites';
    fetchData();
    const storedFavorites = localStorage.getItem('favorites');
    if (storedFavorites) setFavorites(JSON.parse(storedFavorites));
  }, []);

  const fetchData = async () => {
    try {
      const [placesRes, categoriesRes] = await Promise.all([
        fetch(`${process.env.REACT_APP_API_URL}/places`),
        fetch(`${process.env.REACT_APP_API_URL}/categories`)
      ]);
      const [placesData, categoriesData] = await Promise.all([placesRes.json(), categoriesRes.json()]);
      setPlaces(placesData.sort((a, b) => a.place_name.localeCompare(b.place_name)));
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const toggleFavorite = (placeId) => {
    const newFavorites = favorites.includes(placeId) ? 
      favorites.filter(id => id !== placeId) : [...favorites, placeId];
    setFavorites(newFavorites);
    localStorage.setItem('favorites', JSON.stringify(newFavorites));
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find(cat => cat.category_ID === categoryId);
    return category ? category.category : 'Unknown Category';
  };

  const favoritePlaces = places.filter(place => favorites.includes(place.place_ID));

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Your Favorites</h1>
      {favoritePlaces.length === 0 ? (
        <p>You haven't added any favorites yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {favoritePlaces.map(place => (
            <Card
              key={place.place_ID}
              id={place.place_ID}
              title={place.place_name}
              subtitle={getCategoryName(place.category_ID)}
              description={place.place_address}
              linkTo={`/places/${place.place_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}`}
              isFavorite={true}
              onToggleFavorite={toggleFavorite}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Favorites;