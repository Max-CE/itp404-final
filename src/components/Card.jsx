import React from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';

const Card = ({ id, title, subtitle, description, linkTo, isFavorite, onToggleFavorite }) => (
  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden">
    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-emerald-500"></div>
    <Link to={linkTo} className="block">
      <h2 className="text-xl font-semibold mb-2 text-gray-800">{title}</h2>
      <p className="text-emerald-600 font-medium mb-2">{subtitle}</p>
      <p className="text-sm text-gray-600">{description}</p>
    </Link>
    {onToggleFavorite && (
      <button
        onClick={(e) => { e.preventDefault(); onToggleFavorite(id); }}
        className="absolute top-3 right-3 p-2 rounded-full hover:bg-gray-100 transition-colors"
        aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
      >
        <Heart className={`w-6 h-6 ${isFavorite ? 'fill-emerald-500 text-emerald-500' : 'text-gray-400'} transition-colors`} />
      </button>
    )}
  </div>
);

export default Card;