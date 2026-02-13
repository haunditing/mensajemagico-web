import React, { useState, useEffect, useRef } from "react";
import { useLocalization } from "../context/LocalizationContext";

// Mapeo de códigos de país a nombres (Open-Meteo usa nombres en español con language=es)
const COUNTRY_MAP: Record<string, string> = {
  CO: "Colombia",
  MX: "México",
  AR: "Argentina",
  CL: "Chile",
  PE: "Perú",
  VE: "Venezuela",
};

interface CitySelectorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  restrictCountry?: string;
}

const CitySelector: React.FC<CitySelectorProps> = ({
  value,
  onChange,
  placeholder = "Escribe tu ciudad...",
  className = "",
  restrictCountry,
}) => {
  const { country } = useLocalization();
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<any>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const fetchCities = async (query: string) => {
    if (!query || query.length < 3) return;

    // Cancelar petición anterior si existe para evitar condiciones de carrera
    let controller: AbortController | null = null;
    if (typeof AbortController !== "undefined") {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      controller = new AbortController();
      abortControllerRef.current = controller;
    }

    setIsLoading(true);
    try {
      // Usamos la API de Open-Meteo (Geocoding) que es gratuita y estable
      const response = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
          query,
        )}&count=10&language=es&format=json`,
        controller ? { signal: controller.signal } : undefined,
      );
      if (!response.ok) throw new Error("Error en API");

      const data = await response.json();
      let cities: string[] = [];

      if (data.results) {
        let results = data.results;

        // Determinar restricción: prop explícita o automática por contexto
        const targetCountry =
          restrictCountry !== undefined
            ? restrictCountry
            : COUNTRY_MAP[country];

        if (targetCountry) {
          results = results.filter(
            (item: any) =>
              item.country &&
              item.country.toLowerCase().includes(targetCountry.toLowerCase()),
          );
        }

        // Extraemos el nombre completo (Ciudad, Región, País)
        cities = results
          .map((item: any) => {
            const parts = [item.name, item.admin1, item.country].filter(
              Boolean,
            );
            // Usamos Set para evitar duplicados (ej: Mexico, Mexico)
            return [...new Set(parts)].join(", ");
          })
          .slice(0, 5); // Limitamos a 5 resultados
      }

      setSuggestions(cities);
      setShowSuggestions(true);
    } catch (error: any) {
      if (error.name !== "AbortError") {
        console.error("Error buscando ciudades:", error);
        setSuggestions([]);
      }
    } finally {
      if (!controller || abortControllerRef.current === controller) {
        setIsLoading(false);
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (newValue.length >= 3) {
      // Esperar 500ms después de que el usuario deje de escribir
      debounceRef.current = setTimeout(() => {
        fetchCities(newValue);
      }, 500);
    } else {
      setShowSuggestions(false);
      setIsLoading(false);
    }
  };

  const handleSelect = (city: string) => {
    onChange(city);
    setShowSuggestions(false);
  };

  return (
    <div className={`relative ${className}`} ref={wrapperRef}>
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={handleInputChange}
          onFocus={() =>
            value.length >= 3 &&
            suggestions.length > 0 &&
            setShowSuggestions(true)
          }
          placeholder={placeholder}
          className="w-full px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all pr-10"
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-blue-500 dark:border-blue-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>

      {showSuggestions && (suggestions.length > 0 || !isLoading) && (
        <ul className="absolute left-0 right-0 top-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg max-h-48 overflow-y-auto z-50 animate-fade-in">
          {suggestions.length > 0 ? (
            suggestions.map((city, index) => (
              <li
                key={index}
                onClick={() => handleSelect(city)}
                className="px-4 py-2 hover:bg-blue-50 dark:hover:bg-blue-900/30 cursor-pointer text-sm text-slate-700 dark:text-slate-300 transition-colors border-b border-slate-50 dark:border-slate-700 last:border-0"
              >
                {city}
              </li>
            ))
          ) : (
            <li className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400 italic text-center">
              No se encontraron ciudades.
            </li>
          )}
        </ul>
      )}
    </div>
  );
};

export default CitySelector;
