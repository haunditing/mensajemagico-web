import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import { api } from './api';

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
      const data = await api.get<FavoriteItem[]>('/api/favorites');
      setFavorites(data);
    } catch (error) {
      console.error("Error fetching favorites", error);
    } finally {
      setIsLoading(false);
    }
  };

  const addFavorite = async (content: string, occasion: string, tone: string) => {
    if (!user) return;
    try {
      const newFav = await api.post<FavoriteItem>('/api/favorites', { content, occasion, tone });
      setFavorites(prev => [newFav, ...prev]);
      showToast("Guardado en favoritos", "success");
    } catch (error: any) {
      showToast(error.message || "Error al guardar", "error");
    }
  };

  const removeFavorite = async (id: string) => {
    try {
      await api.delete(`/api/favorites/${id}`);
      setFavorites(prev => prev.filter(f => f._id !== id));
      showToast("Eliminado de favoritos", "info");
    } catch (error: any) {
      showToast(error.message || "Error al eliminar", "error");
    }
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