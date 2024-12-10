import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ArrowLeft, Calendar, Edit, Trash2 } from 'lucide-react';

const EventDetails = () => {
  const [event, setEvent] = useState(null);
  const [place, setPlace] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const { placeSlug, eventSlug } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEventAndPlace = async () => {
      try {
        const [placesResponse, eventsResponse] = await Promise.all([
          fetch(`${process.env.REACT_APP_API_URL}/places`),
          fetch(`${process.env.REACT_APP_API_URL}/events`)
        ]);

        if (!placesResponse.ok || !eventsResponse.ok) {
          throw new Error('Failed to fetch data');
        }

        const placesData = await placesResponse.json();
        const eventsData = await eventsResponse.json();

        const foundPlace = placesData.find(p => createSlug(p.place_name) === placeSlug);
        if (!foundPlace) {
          throw new Error('Place not found');
        }
        setPlace(foundPlace);

        const foundEvent = eventsData.find(e => createSlug(e.event_name) === eventSlug && e.place_ID === foundPlace.place_ID);
        if (!foundEvent) {
          throw new Error('Event not found');
        }
        setEvent(foundEvent);

        document.title = `Third Place Finder - ${foundPlace.place_name} - ${foundEvent.event_name}`;
      } catch (error) {
        console.error('Error fetching event or place:', error);
        toast.error('Failed to fetch event details');
        navigate('/places');
      }
    };

    fetchEventAndPlace();
  }, [placeSlug, eventSlug, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEvent(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/events/${event.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      });

      if (!response.ok) throw new Error('Failed to update event');
      
      const updatedEvent = await response.json();
      setEvent(updatedEvent);
      setIsEditing(false);
      toast.success('Event updated successfully');
      
      const newEventSlug = createSlug(updatedEvent.event_name);
      if (newEventSlug !== eventSlug) {
        navigate(`/places/${placeSlug}/events/${newEventSlug}`, { replace: true });
      }
    } catch (error) {
      console.error('Error updating event:', error);
      toast.error('Failed to update event');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/events/${event.id}`, {
          method: 'DELETE',
        });

        if (!response.ok) throw new Error('Failed to delete event');

        toast.success('Event deleted successfully');
        navigate(`/places/${placeSlug}`);
      } catch (error) {
        console.error('Error deleting event:', error);
        toast.error('Failed to delete event');
      }
    }
  };

  const createSlug = (name) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  };

  if (!event || !place) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-emerald-500"></div></div>;

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <Link to={`/places/${placeSlug}`} className="text-emerald-500 hover:text-emerald-600 mb-4 inline-block transition-colors duration-300">
        <ArrowLeft className="w-5 h-5 mr-2" /> Back to {place.place_name}
      </Link>
      {isEditing ? (
        <input
          type="text"
          name="event_name"
          value={event.event_name}
          onChange={handleInputChange}
          className="text-3xl font-bold mb-4 w-full border-b-2 border-emerald-500 focus:outline-none focus:border-emerald-700 px-2 py-1"
        />
      ) : (
        <h1 className="text-3xl font-bold mb-4 text-gray-800">{event.event_name}</h1>
      )}
      <div className="flex items-center mb-4">
        <p className="text-gray-600 mb-4">{place.place_name}</p>
      </div>
      {isEditing ? (
        <div className="mb-4 flex space-x-4">
          <input
            type="date"
            name="event_date"
            value={event.event_date}
            onChange={handleInputChange}
            className="border-b-2 border-emerald-500 focus:outline-none focus:border-emerald-700 px-2 py-1"
          />
          <input
            type="time"
            name="event_time"
            value={event.event_time}
            onChange={handleInputChange}
            className="border-b-2 border-emerald-500 focus:outline-none focus:border-emerald-700 px-2 py-1"
          />
        </div>
      ) : (
        <div className="flex items-center mb-4 text-gray-600">
          <Calendar className="w-5 h-5 mr-2" />
          <p>{new Date(event.event_date).toLocaleDateString()} at {event.event_time}</p>
        </div>
      )}
      {isEditing ? (
        <textarea
          name="event_description"
          value={event.event_description}
          onChange={handleInputChange}
          className="text-gray-800 w-full h-32 border-2 border-emerald-500 rounded-md focus:outline-none focus:border-emerald-700 px-2 py-1 mb-4"
        />
      ) : (
        <p className="text-gray-800 mb-6">{event.event_description}</p>
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
    </div>
  );
};

export default EventDetails;