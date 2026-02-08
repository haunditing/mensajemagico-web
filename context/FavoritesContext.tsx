import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

export interface FavoriteItem {
  _id: string;
  content: string;
  occasion: string;
  tone: string;
  timestamp: string;
}

interface FavoritesContextType {
  favorites: FavoriteItem[];
  addFavorite: (content: string, occasion: string, tone: string) => Promise<void>;
  removeFavorite: (id: string) => Promise<void>;
  isFavorite: (content: string) => boolean;
  isLoading: boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const FavoritesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchFavorites();
    } else {
      setFavorites([]);
    }
  }, [user]);

  const fetchFavorites = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/favorites', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setFavorites(data);
      }
    } catch (error) {
      console.error("Error fetching favorites", error);
    } finally {
      setIsLoading(false);
    }
  };

  const addFavorite = async (content: string, occasion: string, tone: string) => {
    if (!user) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/favorites', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ content, occasion, tone })
      });
      
      if (res.ok) {
        const newFav = await res.json();
        setFavorites(prev => [newFav, ...prev]);
        showToast("Guardado en favoritos", "success");
      } else {
        const err = await res.json();
        showToast(err.error || "Error al guardar", "error");
      }
    } catch (error) {
      showToast("Error de conexión", "error");
    }
  };

  const removeFavorite = async (id: string) => {
    const token = localStorage.getItem('token');
    await fetch(`/api/favorites/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    setFavorites(prev => prev.filter(f => f._id !== id));
    showToast("Eliminado de favoritos", "info");
  };

  const isFavorite = (content: string) => favorites.some(f => f.content === content);

  return (
    <FavoritesContext.Provider value={{ favorites, addFavorite, removeFavorite, isFavorite, isLoading }}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (context === undefined) throw new Error('useFavorites must be used within a FavoritesProvider');
  return context;
};