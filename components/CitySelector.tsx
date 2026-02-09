import React, { useState, useEffect, useRef } from 'react';

export const DEFAULT_CITIES = [
  "Bogotá", "Medellín", "Cali", "Barranquilla", "Cartagena", "Cúcuta", "Bucaramanga", "Pereira", "Santa Marta", "Ibagué", "Pasto", "Manizales", "Neiva", "Villavicencio", "Armenia", "Valledupar", "Montería", "Sincelejo", "Popayán", "Tunja", "Riohacha", "Florencia", "Quibdó", "Arauca", "Yopal", "Leticia", "San Andrés", "Mocoa", "Mitú", "Puerto Carreño", "Inírida", "San José del Guaviare"
];

interface CitySelectorProps {
  value: string;
  onChange: (value: string) => void;
  cities?: string[];
  placeholder?: string;
  className?: string;
}

const CitySelector: React.FC<CitySelectorProps> = ({
  value,
  onChange,
  cities = DEFAULT_CITIES,
  placeholder = "Escribe tu ciudad...",
  className = ""
}) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);

    if (newValue.length > 0) {
      const filtered = cities.filter(city =>
        city.toLowerCase().includes(newValue.toLowerCase())
      );
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSelect = (city: string) => {
    onChange(city);
    setShowSuggestions(false);
  };

  return (
    <div className={`relative ${className}`} ref={wrapperRef}>
      <input
        type="text"
        value={value}
        onChange={handleInputChange}
        onFocus={() => value.length > 0 && setShowSuggestions(true)}
        placeholder={placeholder}
        className="w-full px-4 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
      />
      {showSuggestions && suggestions.length > 0 && (
        <ul className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-48 overflow-y-auto z-50 animate-fade-in">
          {suggestions.map((city) => (
            <li
              key={city}
              onClick={() => handleSelect(city)}
              className="px-4 py-2 hover:bg-blue-50 cursor-pointer text-sm text-slate-700 transition-colors"
            >
              {city}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CitySelector;