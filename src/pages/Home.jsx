import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Search } from 'lucide-react';

const greenIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34]
});

const Home = () => {
  const [places, setPlaces] = useState([]);

  useEffect(() => {
    document.title = 'Third Space Finder - Home Page';
    fetchPlaces();
  }, []);

  const fetchPlaces = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/places`);
      if (!response.ok) throw new Error('Failed to fetch places');
      const data = await response.json();
      setPlaces(data);
    } catch (error) {
      console.error('Failed to fetch places:', error);
    }
  };

  return (
    <div className="text-center">
      <div className="bg-white text-gray-800 py-12 px-4 rounded-lg shadow-sm mb-8 border border-gray-200">
        <h1 className="text-4xl font-bold mb-4">Welcome to Third Space Finder</h1>
        <p className="text-xl mb-6 text-gray-600">Discover great places to hang out, work, and socialize in your area.</p>
        <Link to="/places" className="bg-emerald-600 text-white font-bold py-2 px-6 rounded-full hover:bg-emerald-700 transition-colors duration-300 inline-flex items-center">
          <Search className="w-5 h-5 mr-2" />
          Start Exploring
        </Link>
      </div>
      <div className="mx-auto rounded-lg overflow-hidden shadow-sm border border-gray-200" style={{ height: '400px', width: '100%', maxWidth: '1000px' }}>
        <MapContainer center={[34.0738, -118.2737]} zoom={12} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          {places.map((place) => (
            <Marker key={place.id} position={[place.latitude, place.longitude]} icon={greenIcon}>
              <Popup>
                <Link to={`/places/${place.place_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}`} className="font-semibold text-emerald-500 hover:text-emerald-600">
                  <strong>{place.place_name}</strong>
                </Link>
                <br />
                <span className="text-gray-600">{place.place_address}</span>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
};

export default Home;