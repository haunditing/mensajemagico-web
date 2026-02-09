import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { OCCASIONS, RELATIONSHIPS } from "../constants";
import { updateSeoTags } from "../services/seoService";
import { getLocalizedOccasion } from "../services/localizationService";
import Generator from "../components/Generator";
import AdBanner from "../components/AdBanner";
import { LocalizedContent } from "../types";
import { useLocalization } from "../context/LocalizationContext";

const RelationPage: React.FC = () => {
  const { slug, relSlug } = useParams();
  const { country } = useLocalization();
  const rawOccasion = OCCASIONS.find((o) => o.slug === slug);
  const relationship = RELATIONSHIPS.find((r) => r.slug === relSlug);
  const [localized, setLocalized] = useState<LocalizedContent | null>(null);

  useEffect(() => {
    if (rawOccasion && relationship) {
      const data = getLocalizedOccasion(rawOccasion, country);
      setLocalized(data);
      updateSeoTags({ ...rawOccasion, ...data }, relationship);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [rawOccasion, relationship, country]);

  if (!rawOccasion || !relationship || !localized) {
    return (
      <div className="p-20 text-center font-bold italic text-slate-400">
        Cargando contexto...
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 animate-fade-in-up">
      <nav className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-8 flex items-center gap-3">
        <Link to="/" className="hover:text-blue-600 transition-colors">
          Inicio
        </Link>
        <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
        <Link
          to={`/mensajes/${rawOccasion.slug}`}
          className="hover:text-blue-600"
        >
          {localized.name}
        </Link>
        <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
        <span className="text-slate-900">{relationship.label}</span>
      </nav>

      <header className="mb-12">
        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-1.5 rounded-full text-xs font-bold mb-6 border border-blue-100">
          <span>{rawOccasion.icon}</span>
          Especial de {localized.name}
        </div>
        <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight leading-[1.1] mb-6">
          Mensajes de {localized.name} para mi{" "}
          <span className="text-gradient">{relationship.label}</span>
        </h1>
        <p className="text-xl md:text-2xl text-slate-600 font-light leading-relaxed max-w-3xl">
          Específicamente diseñados para sorprender a tu{" "}
          {relationship.label.toLowerCase()} en {localized.name}. Encuentra
          frases profundas, divertidas o cortas listas para compartir.
        </p>
      </header>

      {/*<AdBanner position="top" />*/}

      <Generator
        occasion={{ ...rawOccasion, name: localized.name }}
        initialRelationship={relationship}
      />

      <section className="mt-20 bg-slate-900 rounded-[3rem] p-10 md:p-16 text-white relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-3xl font-bold mb-6">
            Más para tu {relationship.label.toLowerCase()}
          </h2>
          <p className="text-slate-400 mb-10 max-w-xl text-lg">
            Cualquier momento es perfecto para recordar cuánto te importa.
            Explora otras ocasiones populares.
          </p>
          <div className="flex flex-wrap gap-4">
            {OCCASIONS.filter((o) => o.id !== rawOccasion.id).map((o) => {
              const loc = getLocalizedOccasion(o, country);
              return (
                <Link
                  key={o.id}
                  to={`/mensajes/${o.slug}/${relationship.slug}`}
                  className="bg-white/10 backdrop-blur-md border border-white/20 px-8 py-3 rounded-2xl text-white font-bold hover:bg-white hover:text-slate-900 transition-all text-sm"
                >
                  {o.icon} {loc.name}
                </Link>
              );
            })}
          </div>
        </div>
        <div className="absolute -right-10 -bottom-10 text-[18rem] opacity-[0.03] pointer-events-none transform rotate-12">
          {rawOccasion.icon}
        </div>
      </section>

      {/*<AdBanner position="bottom" />*/}
    </div>
  );
};

export default RelationPage;
