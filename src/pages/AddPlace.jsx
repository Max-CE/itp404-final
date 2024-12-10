import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const AddPlace = () => {
  const [place, setPlace] = useState({
    id: 0,
    place_ID: 0,
    place_name: '',
    place_description: '',
    place_email: '',
    place_phone_number: '',
    place_website: '',
    place_instagram: '',
    place_address: '',
    place_city: '',
    category_ID: '',
    region_ID: '',
    latitude: '',
    longitude: '',
    atmosphere: '',
    requires_payment: false,
  });
  const [errors, setErrors] = useState({});
  const [categories, setCategories] = useState([]);
  const [regions, setRegions] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    document.title = 'Third Space Finder - New Place Form';
  }, []);

  const fetchData = async () => {
    try {
      const [categoriesRes, regionsRes, placesRes] = await Promise.all([
        fetch(`${process.env.REACT_APP_API_URL}/categories`),
        fetch(`${process.env.REACT_APP_API_URL}/regions`),
        fetch(`${process.env.REACT_APP_API_URL}/places`)
      ]);
      const [categoriesData, regionsData, placesData] = await Promise.all([
        categoriesRes.json(), regionsRes.json(), placesRes.json()
      ]);
      setCategories(categoriesData);
      setRegions(regionsData);
      
      const maxId = Math.max(...placesData.map(place => place.id), 0);
      const maxPlaceId = Math.max(...placesData.map(place => place.place_ID), 0);
      
      setPlace(prev => ({ 
        ...prev, 
        id: maxId + 1,
        place_ID: maxPlaceId + 1
      }));
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load necessary data');
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPlace(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!place.place_name.trim()) newErrors.place_name = 'Name is required';
    if (!place.place_description.trim()) newErrors.place_description = 'Description is required';
    if (!place.place_email.trim()) newErrors.place_email = 'Email is required';
    if (!place.place_phone_number.trim()) newErrors.place_phone_number = 'Phone number is required';
    if (!place.place_website.trim()) newErrors.place_website = 'Website is required';
    if (!place.place_instagram.trim()) newErrors.place_instagram = 'Instagram is required';
    if (!place.place_address.trim()) newErrors.place_address = 'Address is required';
    if (!place.place_city.trim()) newErrors.place_city = 'City is required';
    if (!place.category_ID) newErrors.category_ID = 'Category is required';
    if (!place.region_ID) newErrors.region_ID = 'Region is required';
    if (!place.latitude) newErrors.latitude = 'Latitude is required';
    if (!place.longitude) newErrors.longitude = 'Longitude is required';
    if (!place.atmosphere) newErrors.atmosphere = 'Atmosphere is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Please correct the errors in the form');
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/places`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...place,
          latitude: parseFloat(place.latitude),
          longitude: parseFloat(place.longitude),
          category_ID: parseInt(place.category_ID),
          region_ID: parseInt(place.region_ID)
        }),
      });
      if (!response.ok) throw new Error('Failed to add place');
      const newPlace = await response.json();
      toast.success('Place added successfully');
      navigate(`/places/${newPlace.place_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}`);
    } catch (error) {
      console.error('Error adding place:', error);
      toast.error(error.message || 'Failed to add place');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto pb-8">
      <h1 className="text-2xl font-bold mb-4">Add New Place</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {[
          { name: 'place_name', label: 'Place Name', type: 'text' },
          { name: 'place_description', label: 'Description of the Place', type: 'textarea' },
          { name: 'place_email', label: 'Contact Email', type: 'email' },
          { name: 'place_phone_number', label: 'Contact Phone Number', type: 'tel' },
          { name: 'place_website', label: 'Official Website', type: 'url' },
          { name: 'place_instagram', label: 'Instagram Profile', type: 'url' },
          { name: 'place_address', label: 'Street Address', type: 'text' },
          { name: 'place_city', label: 'City', type: 'text' },
          { name: 'latitude', label: 'Latitude Coordinate', type: 'number' },
          { name: 'longitude', label: 'Longitude Coordinate', type: 'number' },
        ].map(({ name, label, type }) => (
          <div key={name}>
            <label htmlFor={name} className="block mb-1">{label}</label>
            {type === 'textarea' ? (
              <textarea
                id={name}
                name={name}
                value={place[name]}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded ${errors[name] ? 'border-red-500' : ''}`}
              />
            ) : (
              <input
                type={type}
                id={name}
                name={name}
                value={place[name]}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded ${errors[name] ? 'border-red-500' : ''}`}
              />
            )}
            {errors[name] && <p className="text-red-500 text-sm mt-1">{errors[name]}</p>}
          </div>
        ))}
        <div>
          <label htmlFor="category_ID" className="block mb-1">Place Category</label>
          <select
            id="category_ID"
            name="category_ID"
            value={place.category_ID}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded ${errors.category_ID ? 'border-red-500' : ''}`}
          >
            <option value="">Select a category</option>
            {categories.map(category => (
              <option key={category.category_ID} value={category.category_ID}>
                {category.category}
              </option>
            ))}
          </select>
          {errors.category_ID && <p className="text-red-500 text-sm mt-1">{errors.category_ID}</p>}
        </div>
        <div>
          <label htmlFor="region_ID" className="block mb-1">Geographic Region</label>
          <select
            id="region_ID"
            name="region_ID"
            value={place.region_ID}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded ${errors.region_ID ? 'border-red-500' : ''}`}
          >
            <option value="">Select a region</option>
            {regions.map(region => (
              <option key={region.region_ID} value={region.region_ID}>
                {region.region}
              </option>
            ))}
          </select>
          {errors.region_ID && <p className="text-red-500 text-sm mt-1">{errors.region_ID}</p>}
        </div>
        <div>
          <label className="block mb-1">Place Atmosphere</label>
          <div className="space-x-4">
            {['Casual', 'Nature', 'Artistic', 'Academic'].map((atmosphere) => (
              <label key={atmosphere} className="inline-flex items-center">
                <input
                  type="radio"
                  name="atmosphere"
                  value={atmosphere}
                  checked={place.atmosphere === atmosphere}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                {atmosphere}
              </label>
            ))}
          </div>
          {errors.atmosphere && <p className="text-red-500 text-sm mt-1">{errors.atmosphere}</p>}
        </div>
        <div>
          <label className="flex items-center">
            <input
              type="checkbox"
              name="requires_payment"
              checked={place.requires_payment}
              onChange={handleInputChange}
              className="mr-2"
            />
            Expects Payment (Upfront or Purchase Required)
          </label>
        </div>
        <button 
          type="submit" 
          className="w-full bg-emerald-500 text-white py-2 px-4 rounded hover:bg-emerald-600 disabled:bg-emerald-300"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Adding Place...' : 'Add Place'}
        </button>
      </form>
    </div>
  );
};

export default AddPlace;