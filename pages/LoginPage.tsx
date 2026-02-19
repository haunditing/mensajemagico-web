import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../context/api";
import LoadingSpinner from "../components/LoadingSpinner";

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(() => {
    try {
      return localStorage.getItem("termsAccepted") === "true";
    } catch {
      return false;
    }
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!acceptedTerms) {
      setError("Debes aceptar los nuevos Términos para continuar");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      const data = await api.post("/api/auth/login", { email, password });

      login(data.token);
      navigate("/");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 animate-fade-in-up">
      <div className="bg-white dark:bg-slate-900 p-8 md:p-10 rounded-[2.5rem] shadow-xl shadow-slate-200/50 dark:shadow-none max-w-md w-full border border-slate-100 dark:border-slate-800">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2">
            Bienvenido de nuevo
          </h1>
          <p className="text-slate-500 dark:text-slate-400">Ingresa para seguir creando magia.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-xl text-red-600 dark:text-red-400 text-sm font-bold flex items-center gap-2">
            <span>⚠️</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
              Correo Electrónico
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-slate-800 dark:text-slate-200"
              placeholder="tu@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
              Contraseña
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-slate-800 dark:text-slate-200 pr-10"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.45 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
          <div className="text-right">
            <Link to="/forgot-password" className="text-xs font-bold text-blue-600 hover:underline">
              ¿Olvidaste tu contraseña?
            </Link>
          </div>

          <div className="flex items-start gap-2">
            <input
              type="checkbox"
              id="terms-login"
              checked={acceptedTerms}
              onChange={(e) => {
                const isChecked = e.target.checked;
                setAcceptedTerms(isChecked);
                try {
                  localStorage.setItem("termsAccepted", String(isChecked));
                } catch {}
              }}
              className="mt-1 w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500 cursor-pointer bg-white dark:bg-slate-800"
            />
            <label htmlFor="terms-login" className="text-sm text-slate-600 dark:text-slate-400 cursor-pointer">
              He leído y acepto los nuevos <Link to="/terminos" className="text-blue-600 dark:text-blue-400 hover:underline font-bold">Términos</Link> y <Link to="/privacidad" className="text-blue-600 dark:text-blue-400 hover:underline font-bold">Política de Privacidad</Link>.
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2
              ${isLoading ? "bg-slate-400 dark:bg-slate-600 cursor-not-allowed" : "bg-slate-900 dark:bg-slate-700 hover:bg-blue-600 dark:hover:bg-blue-500 hover:shadow-blue-500/30"}
            `}
          >
            {isLoading ? (
              <>
                <LoadingSpinner size="sm" color="current" />
                <span>Iniciando...</span>
              </>
            ) : (
              "Iniciar Sesión"
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            ¿No tienes cuenta?{" "}
            <Link
              to="/signup"
              className="text-blue-600 dark:text-blue-400 font-bold hover:underline"
            >
              Regístrate gratis
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
