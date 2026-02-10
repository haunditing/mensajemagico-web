import React, { useEffect } from 'react';
import FaqSection from '../components/FaqSection';
import { faqData } from '../components/FaqSection'; // Import data for schema

const FaqPage: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "Preguntas Frecuentes - MensajeMágico";

    // --- SEO: Structured Data (JSON-LD) ---
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.innerHTML = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": faqData.map(item => ({
        "@type": "Question",
        "name": item.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": typeof item.answer === 'string' ? item.answer : 'Visita nuestra página de precios para más detalles.' // Fallback for JSX content
        }
      }))
    });
    document.head.appendChild(script);

    return () => {
      // Clean up script on component unmount
      document.head.removeChild(script);
    };

  }, []);

  return (
    <div className="animate-fade-in-up">
      <FaqSection />
    </div>
  );
};

export default FaqPage;