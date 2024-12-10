import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Home from './pages/Home';
import Places from './pages/Places';
import PlaceDetails from './pages/PlaceDetails';
import EventDetails from './pages/EventDetails';
import AddPlace from './pages/AddPlace';
import Favorites from './pages/Favorites';

const App = () => (
  <Router>
    <div className="min-h-screen bg-gray-100 text-gray-900">
      <nav className="bg-white border-b border-gray-200 p-4 shadow-sm">
        <ul className="flex space-x-6 text-gray-600 max-w-6xl mx-auto">
          {['Home', 'Places', 'Add Place', 'Favorites'].map((item) => (
            <li key={item}>
              <NavLink 
                to={item === 'Home' ? '/' : `/${item.toLowerCase().replace(' ', '-')}`} 
                className={({ isActive }) => 
                  isActive 
                    ? "font-bold text-emerald-600 border-b-2 border-emerald-600 pb-1 transition-all duration-300" 
                    : "text-gray-600 hover:text-emerald-600 transition-colors duration-300"
                }
              >
                {item}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <main className="container mx-auto mt-8 px-4 max-w-6xl">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/places" element={<Places />} />
          <Route path="/places/:placeSlug" element={<PlaceDetails />} />
          <Route path="/places/:placeSlug/events/:eventSlug" element={<EventDetails />} />
          <Route path="/add-place" element={<AddPlace />} />
          <Route path="/favorites" element={<Favorites />} />
        </Routes>
      </main>
      <ToastContainer position="bottom-right" />
    </div>
  </Router>
);

export default App;