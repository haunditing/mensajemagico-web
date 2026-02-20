
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { LocalizationProvider } from './context/LocalizationContext';
import { AuthProvider } from './context/AuthContext';
import { ConfirmProvider } from './context/ConfirmContext';
import './index.css';


const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <AuthProvider>
        <ConfirmProvider>
          <LocalizationProvider>
            <App />
          </LocalizationProvider>
        </ConfirmProvider>
    </AuthProvider>
  </React.StrictMode>
);

// Eliminar Splash Screen con transición suave
const loader = document.getElementById("app-loader");
if (loader) {
  // Aceleramos la transición para que se sienta más ágil en móviles
  loader.style.transition = "opacity 0.4s ease-out";
  setTimeout(() => {
    loader.style.opacity = "0";
    setTimeout(() => {
      loader.remove();
    }, 400); // Debe coincidir con la duración de la transición
  }, 50); // Reducimos el retraso inicial (antes 150ms) para que desaparezca apenas React pinte
}
