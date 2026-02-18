import React, { useState } from 'react';
import { Avatar } from './Avatar';
import { Badge } from './Badge';
import { Button } from './Button';
import { Heart, Star, ShoppingCart } from 'lucide-react';
import { useApp } from '../lib/context/AppContext';

export const ServiceCard = ({ service, onAddToCart }) => {
  const { favorites, toggleFavorite } = useApp();
  const [hours, setHours] = useState(1);
  const isFavorite = favorites.includes(service.id);

  const handleAddToCart = () => {
    if (onAddToCart) {
      onAddToCart(service, hours);
    }
  };

  return (
    <div className="group card-style overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
      {/* Imagen */}
      <div className="relative h-56 overflow-hidden">
        <img
          src={service.image}
          alt={service.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Botón favorito */}
        <button
          onClick={() => toggleFavorite(service.id)}
          className={`absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-md ${isFavorite
              ? 'bg-red-500 text-white'
              : 'bg-white/90 text-gray-700 hover:bg-white'
            }`}
        >
          <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
        </button>

        {/* Badge precio */}
        <div className="absolute bottom-4 left-4">
          <Badge variant="gradient" className="text-base px-4 py-2">
            ${service.price}
          </Badge>
        </div>
      </div>

      {/* Contenido */}
      <div className="p-6">
        {/* Título */}
        <h3 className="mb-3 line-clamp-2 min-h-[3.5rem] text-[--text-main]">
          {service.title}
        </h3>

        {/* Proveedor */}
        <div className="flex items-center gap-2 mb-3">
          <Avatar name={service.providerName} size="sm" />
          <span className="text-sm text-[--text-muted]">
            {service.providerName}
          </span>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-2 mb-4">
          <div className="flex items-center gap-1">
            <Star className={`w-4 h-4 ${(service.reviews > 0) ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />
          </div>
          <span className="font-semibold text-[--text-main]">
            {(service.reviews > 0) ? service.rating.toFixed(1) : 'Nuevo'}
          </span>
          <span className="text-sm text-[--text-subtle]">({service.reviews})</span>
        </div>

        {/* Descripción */}
        <p className="text-sm text-[--text-muted] mb-4 line-clamp-3 min-h-[3.75rem]">
          {service.description}
        </p>

        {/* Horas y botón */}
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="1"
            value={hours}
            onChange={(e) => setHours(Math.max(1, parseInt(e.target.value) || 1))}
            className="input-base w-20 h-10 text-center"
          />
          <span className="text-sm text-[--text-muted]">hrs</span>
          <Button
            variant="primary"
            size="sm"
            className="flex-1"
            onClick={handleAddToCart}
          >
            <ShoppingCart className="w-4 h-4" />
            Agregar
          </Button>
        </div>
      </div>
    </div>
  );
};