import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../context/api';

const ResetPasswordPage: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { token } = useParams();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setIsLoading(true);
    try {
      await api.post(`/api/auth/reset-password/${token}`, { password });
      alert('¡Contraseña actualizada! Ahora puedes iniciar sesión.');
      navigate('/login');
    } catch (err: any) {
      setError(err.message || 'Error al restablecer la contraseña');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 animate-fade-in-up">
      <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-xl shadow-slate-200/50 max-w-md w-full border border-slate-100">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-black text-slate-900 mb-2">Nueva Contraseña</h1>
          <p className="text-slate-500 text-sm">Ingresa tu nueva clave.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-bold">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Nueva Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-slate-800"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Confirmar Contraseña</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-slate-800"
            />
          </div>
          <button type="submit" disabled={isLoading} className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all active:scale-[0.98] ${isLoading ? 'bg-slate-400 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-blue-500/30'}`}>{isLoading ? 'Guardando...' : 'Cambiar Contraseña'}</button>
        </form>
      </div>
    </div>
  );
};
export default ResetPasswordPage;