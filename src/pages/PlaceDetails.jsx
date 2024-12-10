import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Calendar, Edit, Trash2 } from 'lucide-react';

const PlaceDetails = () => {
  const [place, setPlace] = useState(null);
  const [category, setCategory] = useState(null);
  const [events, setEvents] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const { placeSlug } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [placesResponse, categoriesResponse, eventsResponse] = await Promise.all([
          fetch(`${process.env.REACT_APP_API_URL}/places`),
          fetch(`${process.env.REACT_APP_API_URL}/categories`),
          fetch(`${process.env.REACT_APP_API_URL}/events`)
        ]);

        if (!placesResponse.ok || !categoriesResponse.ok || !eventsResponse.ok) {
          throw new Error('Failed to fetch data');
        }

        const placesData = await placesResponse.json();
        const categoriesData = await categoriesResponse.json();
        const allEvents = await eventsResponse.json();

        const foundPlace = placesData.find(p => createSlug(p.place_name) === placeSlug);

        if (foundPlace) {
          setPlace(foundPlace);
          document.title = `Third Place Finder - ${foundPlace.place_name}`;
      
          const foundCategory = categoriesData.find(cat => cat.category_ID === foundPlace.category_ID);
          setCategory(foundCategory);

          const placeEvents = allEvents.filter(event => event.place_ID === foundPlace.place_ID);
          setEvents(placeEvents);
        } else {
          throw new Error('Place not found');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error(error.message || 'Failed to fetch data');
        navigate('/places');
      }
    };

    fetchData();
  }, [placeSlug, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPlace(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/places/${place.place_ID}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(place),
      });

      if (!response.ok) {
        throw new Error(`Failed to update place: ${response.status} ${response.statusText}`);
      }

      const updatedPlace = await response.json();
      setPlace(updatedPlace);
      setIsEditing(false);
      toast.success('Place updated successfully');
    } catch (error) {
      console.error('Error updating place:', error);
      toast.error(error.message || 'Failed to update place');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this place?')) {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/places/${place.place_ID}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error(`Failed to delete place: ${response.status} ${response.statusText}`);
        }

        toast.success('Place deleted successfully');
        navigate('/places');
      } catch (error) {
        console.error('Error deleting place:', error);
        toast.error(error.message || 'Failed to delete place');
      }
    }
  };

  const createSlug = (name) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  };

  if (!place) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-emerald-500"></div></div>;

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      {isEditing ? (
        <input
          type="text"
          name="place_name"
          value={place.place_name}
          onChange={handleInputChange}
          className="text-3xl font-bold mb-4 w-full border-b-2 border-emerald-500 focus:outline-none focus:border-emerald-700 px-2 py-1"
        />
      ) : (
        <h1 className="text-3xl font-bold mb-4 text-gray-800">{place.place_name}</h1>
      )}
      <div className="flex items-center mb-2 text-emerald-600">
        <p className="text-gray-600">Category: {category?.category || 'Unknown Category'}</p>
      </div>
      <p className="text-gray-600 mb-2">Atmosphere: {place.atmosphere}</p>
      {isEditing ? (
        <input
          type="text"
          name="place_address"
          value={place.place_address}
          onChange={handleInputChange}
          className="text-gray-700 mb-4 w-full border-b-2 border-emerald-500 focus:outline-none focus:border-emerald-700 px-2 py-1"
        />
      ) : (
        <p className="text-gray-700 mb-4">{place.place_address}</p>
      )}
      {isEditing ? (
        <textarea
          name="place_description"
          value={place.place_description}
          onChange={handleInputChange}
          className="text-gray-800 w-full h-32 border-2 border-emerald-500 rounded-md focus:outline-none focus:border-emerald-700 px-2 py-1 mb-4"
        />
      ) : (
        <p className="text-gray-800 mb-4">{place.place_description}</p>
      )}
      <div className="mt-6 flex space-x-4">
        {isEditing ? (
          <button onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded mr-2 transition-colors duration-300">
            Save
          </button>
        ) : (
          <button onClick={() => setIsEditing(true)} className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2 px-4 rounded transition-colors duration-300 flex items-center">
            <Edit className="w-4 h-4 mr-2" /> Edit
          </button>
        )}
        <button onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition-colors duration-300 flex items-center">
          <Trash2 className="w-4 h-4 mr-2" /> Delete
        </button>
      </div>
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Upcoming Events</h2>
        {events.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {events.map(event => {
              const eventSlug = createSlug(event.event_name);
              return (
                <Link
                  key={event.id}
                  to={`/places/${placeSlug}/events/${eventSlug}`}
                  className="block bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1"
                >
                  <h3 className="text-lg font-semibold mb-2 text-gray-800">{event.event_name}</h3>
                  <div className="flex items-center text-gray-600 mb-2">
                    <Calendar className="w-4 h-4 mr-2" />
                    <p className="text-sm text-gray-600">
                      {new Date(event.event_date).toLocaleDateString()} at {event.event_time}
                    </p>
                  </div>
                  <p className="text-sm text-gray-700">{event.event_description}</p>
                </Link>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-600">No upcoming events at this place.</p>
        )}
      </div>
    </div>
  );
};

export default PlaceDetails;