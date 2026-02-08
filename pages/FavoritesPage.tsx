import React from 'react';
import { useFavorites } from '../context/FavoritesContext';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import ShareBar from '../components/ShareBar';
import { SharePlatform } from '../types';

const FavoritesPage: React.FC = () => {
  const { favorites, removeFavorite, isLoading } = useFavorites();
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center animate-fade-in-up">
        <div className="text-6xl mb-4">🔒</div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Inicia sesión para ver tus favoritos</h2>
        <p className="text-slate-500 mb-6">Guarda tus mejores creaciones y accede a ellas cuando quieras.</p>
        <Link to="/login" className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors">
          Iniciar Sesión
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 animate-fade-in-up">
      <div className="flex items-center gap-4 mb-10">
        <div className="bg-red-50 p-3 rounded-2xl text-red-500 text-2xl">❤️</div>
        <div>
          <h1 className="text-3xl font-black text-slate-900">Mis Favoritos</h1>
          <p className="text-slate-500 font-medium">{favorites.length} mensajes guardados</p>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-20 text-slate-400">Cargando...</div>
      ) : favorites.length === 0 ? (
        <div className="text-center py-20 bg-slate-50 rounded-[2rem] border border-slate-100">
          <p className="text-slate-400 font-medium mb-4">Aún no tienes mensajes guardados.</p>
          <Link to="/" className="text-blue-600 font-bold hover:underline">¡Crea algo mágico!</Link>
        </div>
      ) : (
        <div className="grid gap-6">
          {favorites.map((fav) => (
            <div key={fav._id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group">
              <div className="flex justify-between items-start mb-4">
                <div className="flex gap-2">
                  <span className="text-[10px] uppercase tracking-wider font-bold bg-blue-50 text-blue-600 px-2 py-1 rounded-lg">{fav.occasion}</span>
                  <span className="text-[10px] uppercase tracking-wider font-bold bg-slate-100 text-slate-500 px-2 py-1 rounded-lg">{fav.tone}</span>
                </div>
                <button 
                  onClick={() => removeFavorite(fav._id)}
                  className="text-slate-300 hover:text-red-500 transition-colors p-1"
                  title="Eliminar"
                >
                  ✕
                </button>
              </div>
              <p className="text-slate-800 text-lg font-medium leading-relaxed mb-6">{fav.content}</p>
              <ShareBar content={fav.content} platforms={[SharePlatform.COPY, SharePlatform.WHATSAPP]} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FavoritesPage;