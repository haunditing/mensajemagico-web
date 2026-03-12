import { useAuth } from "../../context/AuthContext";
import { api } from "../../context/api";
import { useState } from "react";
import { Link } from "react-router-dom";
import CampaignIcon from "../CampaignIcon";

const PLATFORMS = [
  { value: "Instagram", label: "Instagram" },
  { value: "Facebook", label: "Facebook" },
  { value: "LinkedIn", label: "LinkedIn" },
  { value: "Twitter", label: "Twitter/X" },
  { value: "WhatsApp", label: "WhatsApp" },
  { value: "Telegram", label: "Telegram" },
];

export default function AdminCampaignGenerator() {
  const { user } = useAuth();
  const [platform, setPlatform] = useState(PLATFORMS[0].value);
  const [theme, setTheme] = useState("");
  const [painPoint, setPainPoint] = useState("");
  const [uniqueBenefit, setUniqueBenefit] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [tone, setTone] = useState("");
  const [callToAction, setCallToAction] = useState("");
  const [intention, setIntention] = useState("");
  const [contextWords, setContextWords] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState(1);
  const [suggestLoading, setSuggestLoading] = useState(false);

  if (!user || user.role !== "admin") return null;

  const handleSuggest = async () => {
    setSuggestLoading(true);
    setError("");
    try {
      const res = await api.post("/api/admin/social-campaigns/suggest", { platform, theme });
      setTone(res.tone || "");
      setIntention(res.intention || "");
      setContextWords((res.keywords || []).join(", "));
      setStep(2);
    } catch (err: any) {
      setError(err.message || "Error sugiriendo tono/intención/palabras clave");
    } finally {
      setSuggestLoading(false);
    }
  };

  const handleGenerate = async () => {
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await api.post("/api/admin/social-campaigns/generate", {
        platform,
        theme,
        painPoint,
        uniqueBenefit,
        targetAudience,
        tone,
        callToAction,
        intention,
        contextWords: contextWords.split(",").map(w => w.trim()).filter(Boolean),
      });
      setResult(res);
    } catch (err: any) {
      setError(err.message || "Error generando campaña");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 animate-fade-in-up min-h-screen pb-16">
      {/* Breadcrumb */}
      <nav className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 mb-8 flex items-center gap-3 pt-8">
        <Link
          to="/"
          className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          Inicio
        </Link>
        <span className="w-1 h-1 bg-slate-300 dark:bg-slate-600 rounded-full"></span>
        <span className="text-slate-900 dark:text-white">Campañas</span>
      </nav>

      {/* HERO */}
      <header className="mb-12 relative">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-8 mb-8">
          <div className="relative group">
            <div className="absolute -inset-2 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-500 bg-gradient-to-tr from-blue-500 to-indigo-500"></div>
            <div className="relative bg-white dark:bg-slate-900 shadow-xl border border-slate-100 dark:border-slate-800 w-20 h-20 md:w-24 md:h-24 rounded-[2rem] flex items-center justify-center transform -rotate-3 hover:rotate-0 transition-all cursor-default shadow-blue-500/10">
              <CampaignIcon className="w-12 h-12 text-blue-600 dark:text-blue-300" />
            </div>
          </div>
          <div className="flex-1">
            <h1 className="text-4xl md:text-7xl font-[800] text-slate-900 dark:text-white tracking-tight leading-[1.1] mb-4">
              Generador de campañas
            </h1>
          </div>
        </div>
        <div className="relative pl-8 md:pl-10">
          <div className="absolute left-0 top-0 bottom-0 w-1.5 rounded-full bg-gradient-to-b from-blue-500 to-indigo-600"></div>
          <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 font-light leading-relaxed max-w-4xl italic">
            Crea campañas profesionales y atractivas para redes sociales en segundos. Deja que la IA te ayude a inspirar, persuadir y conectar con tu audiencia.
          </p>
        </div>
      </header>

      {/* CARD CENTRAL */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-2xl max-w-2xl mx-auto border border-slate-200 dark:border-slate-800 transition-all mt-0">
        {step === 1 && (
          <div className="animate-fade-in">
            <div className="mb-6">
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Plataforma</label>
              <select
                value={platform}
                onChange={e => setPlatform(e.target.value)}
                className="w-full h-12 md:h-14 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 font-medium text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none cursor-pointer"
              >
                {PLATFORMS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </div>
            <div className="mb-6">
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Tema</label>
              <input value={theme} onChange={e => setTheme(e.target.value)} className="w-full h-12 md:h-14 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 font-medium text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none" placeholder="Ej: Lanzamiento de producto, Día de la Madre..." />
            </div>
            <div className="mb-6">
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">¿Cuál es el principal problema o necesidad que resuelve tu producto?</label>
              <input value={painPoint} onChange={e => setPainPoint(e.target.value)} className="w-full h-12 md:h-14 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 font-medium text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none" placeholder="Ej: Falta de tiempo, baja productividad..." />
            </div>
            <div className="mb-6">
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">¿Qué beneficio único ofrece tu producto frente a la competencia?</label>
              <input value={uniqueBenefit} onChange={e => setUniqueBenefit(e.target.value)} className="w-full h-12 md:h-14 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 font-medium text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none" placeholder="Ej: Más rápido, más económico, exclusivo..." />
            </div>
            <div className="mb-6">
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">¿Quién es tu público objetivo (edad, intereses, ubicación)?</label>
              <input value={targetAudience} onChange={e => setTargetAudience(e.target.value)} className="w-full h-12 md:h-14 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 font-medium text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none" placeholder="Ej: Jóvenes 18-25, amantes del deporte, Bogotá..." />
            </div>
            <div className="mb-6">
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">¿Qué tono prefieres para la campaña?</label>
              <select value={tone} onChange={e => setTone(e.target.value)} className="w-full h-12 md:h-14 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 font-medium text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none cursor-pointer">
                <option value="">Selecciona un tono...</option>
                <option value="Amistoso">Amistoso</option>
                <option value="Autoridad">Autoridad</option>
                <option value="Inspirador">Inspirador</option>
                <option value="Divertido">Divertido</option>
              </select>
            </div>
            <div className="mb-8">
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">¿Cuál será el llamado a la acción principal?</label>
              <select value={callToAction} onChange={e => setCallToAction(e.target.value)} className="w-full h-12 md:h-14 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 font-medium text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none cursor-pointer">
                <option value="">Selecciona una acción...</option>
                <option value="Link">Link</option>
                <option value="DM">DM</option>
                <option value="Registro">Registro</option>
                <option value="Descarga">Descarga</option>
              </select>
            </div>
            <button
              className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-bold py-3 px-6 rounded-xl shadow transition-all text-lg disabled:opacity-60"
              onClick={handleSuggest}
              disabled={suggestLoading || !platform || !theme || !painPoint || !uniqueBenefit || !targetAudience || !tone || !callToAction}
            >
              {suggestLoading ? "Generando sugerencias..." : "Sugerir tono, intención y palabras clave"}
            </button>
          </div>
        )}
        {step === 2 && (
          <div className="animate-fade-in">
            <div className="mb-6">
              <label className="block font-semibold mb-2 text-slate-700 dark:text-slate-200">Tono sugerido (editable)</label>
              <input value={tone} onChange={e => setTone(e.target.value)} className="w-full h-12 md:h-14 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 font-medium text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none" placeholder="Ej: Inspirador, Divertido, Profesional..." />
            </div>
            <div className="mb-6">
              <label className="block font-semibold mb-2 text-slate-700 dark:text-slate-200">Intención sugerida (editable)</label>
              <input value={intention} onChange={e => setIntention(e.target.value)} className="w-full h-12 md:h-14 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 font-medium text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none" placeholder="Ej: Generar interacción, Contar historia..." />
            </div>
            <div className="mb-8">
              <label className="block font-semibold mb-2 text-slate-700 dark:text-slate-200">Palabras clave sugeridas (editable, separadas por coma)</label>
              <input value={contextWords} onChange={e => setContextWords(e.target.value)} className="w-full h-12 md:h-14 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 font-medium text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none" placeholder="Ej: descuento, novedad, regalo" />
            </div>
            <div className="flex gap-2">
              <button
                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-bold py-3 px-6 rounded-xl shadow transition-all text-lg disabled:opacity-60"
                onClick={handleGenerate}
                disabled={loading}
              >
                {loading ? "Generando campaña..." : "Generar campaña"}
              </button>
              <button
                className="flex-1 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-100 font-semibold py-3 px-6 rounded-xl border border-slate-300 dark:border-slate-600 transition-all hover:bg-slate-300 dark:hover:bg-slate-600"
                onClick={() => setStep(1)}
                disabled={loading}
              >
                Volver
              </button>
            </div>
          </div>
        )}
        {error && <div className="text-red-600 mb-4 text-center font-semibold animate-shake">{error}</div>}
        {result && (
          <div className="mt-10 flex justify-center animate-fade-in">
            <div className="w-full max-w-2xl">
                <div className="flex items-center gap-3 mb-4">
                  <span className="inline-block w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-white flex items-center justify-center text-xl font-bold uppercase shadow">
                    {platform[0]}
                  </span>
                  <span className="font-bold text-slate-700 dark:text-slate-200 text-lg tracking-wide">{platform}</span>
                </div>
                {result.strategy_summary && (
                  <div className="mb-6 text-base md:text-lg text-slate-700 dark:text-slate-200 font-semibold italic">{result.strategy_summary}</div>
                )}
                {Array.isArray(result.content_plan) && result.content_plan.length > 0 && (
                  <div className="space-y-8">
                    {result.content_plan.map((item: any, idx: number) => (
                      <div key={idx} className="border-l-4 border-blue-500 dark:border-blue-400 pl-4 md:pl-6 py-2 md:py-4 bg-transparent">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-xs font-bold text-blue-600 dark:text-blue-300">Día {item.day}</span>
                          <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{item.type}</span>
                        </div>
                        {item.hook && (
                          <div className="mb-2 text-lg font-bold text-blue-700 dark:text-blue-300">{item.hook}</div>
                        )}
                        {item.body && (
                          <div className="mb-2 text-base text-slate-900 dark:text-slate-100 whitespace-pre-line leading-relaxed">{item.body}</div>
                        )}
                        {item.visual_suggestion && (
                          <div className="mb-2 text-sm text-slate-500 dark:text-slate-400">Visual: {item.visual_suggestion}</div>
                        )}
                        {item.hashtags && Array.isArray(item.hashtags) && item.hashtags.length > 0 && (
                          <div className="mb-2 flex flex-wrap gap-2">
                            {item.hashtags.map((tag: string) => (
                              <span key={tag} className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 px-3 py-1 rounded-full text-xs font-semibold shadow-sm">{tag}</span>
                            ))}
                          </div>
                        )}
                        {item.cta_included && result.callToAction && (
                          <div className="mt-2 flex justify-center">
                            <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-full shadow transition-all text-base">
                              {result.callToAction}
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                {!Array.isArray(result.content_plan) && result.raw && (
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-4">{result.raw}</div>
                )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
