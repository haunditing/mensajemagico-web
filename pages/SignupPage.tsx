import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../context/api";
import LoadingSpinner from "../components/LoadingSpinner";

const SignupPage: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");
  const [emailAvailabilityError, setEmailAvailabilityError] = useState("");
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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

  // Referencias para gestión de foco
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const confirmEmailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmPasswordRef = useRef<HTMLInputElement>(null);
  const termsRef = useRef<HTMLInputElement>(null);

  // SEO: Título de la página
  useEffect(() => {
    document.title = "Crear Cuenta - Mensaje Mágico";
  }, []);

  // Validación asíncrona de correo
  useEffect(() => {
    const checkEmailAvailability = async () => {
      // Resetear error si está vacío o formato inválido (ya lo valida el submit)
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setEmailAvailabilityError("");
        return;
      }

      setIsCheckingEmail(true);
      try {
        const response = await api.post("/api/auth/check-email", { email });
        if (response.exists) {
          setEmailAvailabilityError("Este correo ya está registrado. Intenta iniciar sesión.");
        } else {
          setEmailAvailabilityError("");
        }
      } catch (error) {
        console.error("Error verificando correo", error);
      } finally {
        setIsCheckingEmail(false);
      }
    };

    // Debounce de 500ms para no saturar el servidor
    const timeoutId = setTimeout(checkEmailAvailability, 500);
    return () => clearTimeout(timeoutId);
  }, [email]);

  // Cálculo de fortaleza de contraseña
  const getPasswordStrength = (pass: string) => {
    let score = 0;
    if (!pass) return 0;
    if (pass.length >= 6) score++; // Mínimo requerido
    if (pass.length >= 10) score++; // Longitud buena
    if (/[0-9]/.test(pass)) score++; // Tiene números
    if (/[^A-Za-z0-9]/.test(pass)) score++; // Tiene caracteres especiales
    return score;
  };

  const strength = getPasswordStrength(password);

  const getStrengthColor = (s: number) => {
    if (s <= 2) return "bg-red-500";
    if (s === 3) return "bg-yellow-500";
    return "bg-green-500";
  };

  // Foco inicial al montar
  useEffect(() => {
    nameRef.current?.focus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!acceptedTerms) {
      setError("Debes aceptar los Términos y Condiciones para continuar");
      termsRef.current?.focus();
      return;
    }

    if (!name.trim()) {
      setError("Por favor ingresa tu nombre completo");
      nameRef.current?.focus();
      return;
    }

    // Validación: Solo letras y espacios (incluye tildes y ñ)
    const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
    if (!nameRegex.test(name)) {
      setError("El nombre solo puede contener letras y espacios");
      nameRef.current?.focus();
      return;
    }

    if (emailAvailabilityError) {
      setError("El correo electrónico no está disponible");
      emailRef.current?.focus();
      return;
    }

    // Validación de formato de correo
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Por favor ingresa un correo electrónico válido");
      emailRef.current?.focus();
      return;
    }

    if (email !== confirmEmail) {
      setError("Los correos electrónicos no coinciden");
      confirmEmailRef.current?.focus();
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      confirmPasswordRef.current?.focus();
      return;
    }

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      passwordRef.current?.focus();
      return;
    }

    setIsLoading(true);

    try {
      const data = await api.post("/api/auth/signup", { name, email, password });

      // Auto-login tras registro exitoso
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
            Crea tu cuenta
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Empieza a generar mensajes ilimitados.
          </p>
        </div>

        {error && (
          <div role="alert" className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-xl text-red-600 dark:text-red-400 text-sm font-bold flex items-center gap-2">
            <span>⚠️</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="name" className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
              Nombre Completo
            </label>
            <input
              ref={nameRef}
              id="name"
              type="text"
              value={name}
              onChange={(e) => {
                // Auto-capitalización: Primera letra de cada palabra
                const val = e.target.value.replace(/(?:^|\s)\S/g, (a) => a.toUpperCase());
                setName(val);
              }}
              required
              className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-slate-800 dark:text-slate-200"
              placeholder="Ej. Juan Pérez"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
              Correo Electrónico
            </label>
            <div className="relative">
              <input
                ref={emailRef}
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={`w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border focus:ring-2 outline-none transition-all font-medium text-slate-800 dark:text-slate-200 pr-10 ${
                  emailAvailabilityError
                    ? "border-red-300 dark:border-red-800 focus:ring-red-500"
                    : !isCheckingEmail && email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
                    ? "border-green-300 dark:border-green-800 focus:ring-green-500"
                    : "border-slate-200 dark:border-slate-700 focus:ring-blue-500"
                }`}
                placeholder="tu@email.com"
                aria-invalid={!!emailAvailabilityError}
                aria-describedby={emailAvailabilityError ? "email-error" : undefined}
              />
              {!isCheckingEmail && !emailAvailabilityError && email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500 animate-fade-in pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                    <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
            {isCheckingEmail && <p className="text-xs text-slate-500 mt-1 ml-1">Verificando disponibilidad...</p>}
            {emailAvailabilityError && (
              <p id="email-error" role="alert" className="text-xs text-red-500 font-bold mt-1 ml-1">{emailAvailabilityError}</p>
            )}
          </div>

          <div>
            <label htmlFor="confirmEmail" className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
              Confirmar Correo Electrónico
            </label>
            <input
              ref={confirmEmailRef}
              id="confirmEmail"
              type="email"
              value={confirmEmail}
              onChange={(e) => setConfirmEmail(e.target.value)}
              onPaste={(e) => e.preventDefault()}
              required
              className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-slate-800 dark:text-slate-200"
              placeholder="Confirma tu correo"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
              Contraseña
            </label>
            <div className="relative">
              <input
                ref={passwordRef}
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-slate-800 dark:text-slate-200 pr-10"
                placeholder="Mínimo 6 caracteres"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
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
            
            {/* Indicador de Fortaleza */}
            {password && (
              <div className="mt-3 animate-fade-in" aria-live="polite">
                <div className="flex gap-1 h-1.5 mb-1">
                  {[1, 2, 3, 4].map((level) => (
                    <div
                      key={level}
                      className={`h-full flex-1 rounded-full transition-all duration-300 ${
                        strength >= level ? getStrengthColor(strength) : "bg-slate-200 dark:bg-slate-700"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-xs text-right font-bold text-slate-500 dark:text-slate-400">
                  Fortaleza: <span className={`${strength <= 2 ? "text-red-500" : strength === 3 ? "text-yellow-500" : "text-green-500"}`}>
                    {strength <= 2 ? "Débil" : strength === 3 ? "Buena" : "Fuerte"}
                  </span>
                </p>
              </div>
            )}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
              Confirmar Contraseña
            </label>
            <div className="relative">
              <input
                ref={confirmPasswordRef}
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-slate-800 dark:text-slate-200 pr-10"
                placeholder="Repite tu contraseña"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label={showConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              >
                {showConfirmPassword ? (
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

          <div className="flex items-start gap-2">
            <input
              type="checkbox"
              ref={termsRef}
              id="terms"
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
            <label htmlFor="terms" className="text-sm text-slate-600 dark:text-slate-400 cursor-pointer">
              Acepto los <Link to="/terminos" className="text-blue-600 dark:text-blue-400 hover:underline font-bold">Términos y Condiciones</Link> y la <Link to="/privacidad" className="text-blue-600 dark:text-blue-400 hover:underline font-bold">Política de Privacidad</Link>.
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2
              ${isLoading ? "bg-slate-400 dark:bg-slate-600 cursor-not-allowed" : "bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-blue-500/30"}
            `}
          >
            {isLoading ? (
              <>
                <LoadingSpinner size="sm" color="current" />
                <span>Creando cuenta...</span>
              </>
            ) : (
              "Registrarse"
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            ¿Ya tienes cuenta?{" "}
            <Link
              to="/login"
              className="text-blue-600 dark:text-blue-400 font-bold hover:underline"
            >
              Inicia Sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
