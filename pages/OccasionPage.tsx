import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { OCCASIONS, RELATIONSHIPS } from "../constants";
import { CONFIG } from "../config";
import { updateSeoTags } from "../services/seoService.ts";
import { getLocalizedOccasion } from "../services/localizationService";
import Generator from "../components/Generator";
import AdBanner from "../components/AdBanner";
import OccasionIcon from "../components/OccasionIcon";
import FallingParticles from "../components/FallingParticles";
import { Relationship, LocalizedContent } from "../types";
import { useLocalization } from "../context/LocalizationContext";

const OccasionPage: React.FC = () => {
  const { slug } = useParams();
  const { country } = useLocalization();
  const rawOccasion = OCCASIONS.find((o) => o.slug === slug);
  const [selectedRel, setSelectedRel] = useState<Relationship | undefined>(
    undefined,
  );
  const [localized, setLocalized] = useState<LocalizedContent | null>(null);

  const isValentine = CONFIG.THEME.IS_VALENTINE;
  const isChristmas = CONFIG.THEME.IS_CHRISTMAS;

  useEffect(() => {
    if (rawOccasion) {
      const data = getLocalizedOccasion(rawOccasion, country);
      setLocalized(data);
      updateSeoTags({ ...rawOccasion, ...data }, selectedRel);
    }
  }, [rawOccasion, selectedRel, country]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [slug]);

  if (!rawOccasion || !localized) {
    return (
      <div className="p-20 text-center animate-pulse">
        <div className="text-4xl mb-4">✨</div>
        <div className="font-bold text-slate-400 italic">
          Cargando inspiración...
        </div>
      </div>
    );
  }

  const handleRelationshipChange = (relId: string) => {
    const rel = RELATIONSHIPS.find((r) => r.id === relId);
    setSelectedRel(rel);
  };

  const dynamicH1 = selectedRel
    ? `${localized.name} para mi ${selectedRel.label}`
    : localized.h1;

  const isVisto = rawOccasion.slug === "no-me-dejes-en-visto";

  const relatedOccasions = OCCASIONS.filter((o) => {
    if (rawOccasion.slug === "no-me-dejes-en-visto")
      return ["perdoname", "amor", "anniversary"].includes(o.slug);
    if (rawOccasion.slug === "perdoname")
      return ["no-me-dejes-en-visto", "anniversary"].includes(o.slug);
    if (rawOccasion.slug === "amor")
      return ["no-me-dejes-en-visto", "anniversary", "cumpleanos"].includes(
        o.slug,
      );
    return ["perdoname", "no-me-dejes-en-visto"].includes(o.slug);
  }).slice(0, 3);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 animate-fade-in-up">
      <nav className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-8 flex items-center gap-3">
        <Link to="/" className="hover:text-blue-600 transition-colors">
          Inicio
        </Link>
        <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
        <span className="text-slate-900">{localized.name}</span>
      </nav>

      <header className="mb-12 relative">
        {(isValentine || isChristmas) && (
          <FallingParticles
            count={20}
            emojis={
              isValentine
                ? ["❤️", "💖", "💘", "💝", "🌹"]
                : ["❄️", "❅", "🌨️", "☃️"]
            }
            iterationCount={isValentine ? 2 : "infinite"}
          />
        )}

        <div className="flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-8 mb-8">
          <div className="relative group">
            <div
              className={`absolute -inset-2 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-500 ${isVisto ? "bg-green-500" : "bg-gradient-to-tr from-blue-500 to-indigo-500"}`}
            ></div>
            <div
              className={`relative bg-white shadow-xl border border-slate-100 w-20 h-20 md:w-24 md:h-24 rounded-[2rem] flex items-center justify-center transform -rotate-3 hover:rotate-0 transition-all cursor-default ${isVisto ? "text-green-600 shadow-green-500/10" : "shadow-blue-500/10"}`}
            >
              <OccasionIcon
                slug={rawOccasion.slug}
                icon={rawOccasion.icon}
                isLarge
              />
            </div>
          </div>
          <div className="flex-1">
            <h1 className="text-4xl md:text-7xl font-[800] text-slate-900 tracking-tight leading-[1.1] mb-4">
              {dynamicH1.split(" ").map((word, i, arr) => {
                const isLastWord = i === arr.length - 1;
                const isVistoWord = isVisto && word.toLowerCase() === "visto";
                return (
                  <span
                    key={i}
                    className={
                      isLastWord || isVistoWord
                        ? isVisto
                          ? "text-green-600"
                          : isValentine
                            ? "text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-pink-600"
                            : "text-gradient"
                        : ""
                    }
                  >
                    {word}{" "}
                  </span>
                );
              })}
            </h1>
          </div>
        </div>

        <div className="relative pl-8 md:pl-10">
          <div
            className={`absolute left-0 top-0 bottom-0 w-1.5 rounded-full ${isVisto ? "bg-green-500" : "bg-gradient-to-b from-blue-500 to-indigo-600"}`}
          ></div>
          <p className="text-xl md:text-2xl text-slate-600 font-light leading-relaxed max-w-4xl italic">
            {localized.description}{" "}
            <span className="text-slate-400 font-normal not-italic">
              — Elige a quién escribes y el tono para crear un mensaje
              inolvidable.
            </span>
          </p>
        </div>
      </header>

      {/*<AdBanner position="top" />*/}

      <div className="mt-12">
        <Generator
          occasion={{ ...rawOccasion, name: localized.name }}
          onRelationshipChange={handleRelationshipChange}
        />
      </div>

      <section className="mt-24">
        <div className="flex items-center gap-6 mb-10">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Explora más categorías
          </h2>
          <div className="h-0.5 flex-grow bg-slate-100 rounded-full"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {relatedOccasions.map((relOcc) => {
            const locOcc = getLocalizedOccasion(relOcc, country);
            return (
              <Link
                key={relOcc.id}
                to={`/mensajes/${relOcc.slug}`}
                className="group bg-white p-6 rounded-3xl font-bold text-slate-700 hover:border-blue-500 hover:text-blue-600 transition-all border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-xl hover:-translate-y-1"
              >
                <div className="flex items-center gap-4">
                  <div className="grayscale group-hover:grayscale-0 transition-all">
                    <OccasionIcon slug={relOcc.slug} icon={relOcc.icon} />
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase tracking-widest text-slate-400 mb-0.5 group-hover:text-blue-400 transition-colors italic">
                      Ver más
                    </span>
                    <span className="text-base">{locOcc.name}</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/*<AdBanner position="bottom" />*/}
    </div>
  );
};

export default OccasionPage;
