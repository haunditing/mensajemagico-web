import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../context/api';
import LoadingSpinner from '../components/LoadingSpinner';

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setIsLoading(true);

    try {
      await api.post('/api/auth/forgot-password', { email });
      setMessage('Si el correo está registrado, recibirás instrucciones en breve. Revisa tu consola del servidor (en desarrollo).');
    } catch (err: any) {
      setError(err.message || 'Error al solicitar recuperación');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 animate-fade-in-up">
      <div className="bg-white dark:bg-slate-900 p-8 md:p-10 rounded-[2.5rem] shadow-xl shadow-slate-200/50 dark:shadow-none max-w-md w-full border border-slate-100 dark:border-slate-800">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Recuperar Contraseña</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Ingresa tu correo y te enviaremos un enlace mágico.</p>
        </div>

        {message && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-900/30 rounded-xl text-green-700 dark:text-green-400 text-sm font-bold">
            ✅ {message}
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-xl text-red-600 dark:text-red-400 text-sm font-bold">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Correo Electrónico</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-slate-800 dark:text-slate-200"
              placeholder="tu@email.com"
            />
          </div>

          <button type="submit" disabled={isLoading} className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2 ${isLoading ? 'bg-slate-400 dark:bg-slate-600 cursor-not-allowed' : 'bg-slate-900 dark:bg-slate-700 hover:bg-blue-600 dark:hover:bg-blue-500 hover:shadow-blue-500/30'}`}>
            {isLoading ? (
              <>
                <LoadingSpinner size="sm" color="current" />
                <span>Enviando...</span>
              </>
            ) : (
              'Enviar enlace'
            )}
          </button>
        </form>
        <div className="mt-6 text-center"><Link to="/login" className="text-blue-600 dark:text-blue-400 font-bold hover:underline text-sm">Volver al login</Link></div>
      </div>
    </div>
  );
};
export default ForgotPasswordPage;