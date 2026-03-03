import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../context/api';
import { useAuth } from '../context/AuthContext';

const questions = [
    {
        question: '¿Cómo describirías la intensidad de tus emociones?',
        options: [
            { label: 'Uso palabras suaves y gentiles', value: 'soft' },
            { label: 'Mantengo un peso emocional estable', value: 'balanced' },
            { label: 'Uso vocabulario fuerte y apasionado', value: 'intense' },
        ],
        key: 'intensity',
    },
    {
        question: '¿Te sientes cómodo expresando tus sentimientos abiertamente?',
        options: [
            { label: 'Soy muy descriptivo y emotivo', value: 'high' },
            { label: 'Equilibro detalle y brevedad', value: 'medium' },
            { label: 'Soy reservado y conciso', value: 'low' },
        ],
        key: 'expressiveness',
    },
    {
        question: 'En una discusión, ¿tiendes a proteger tu orgullo?',
        options: [
            { label: 'Proyecto alta dignidad y compostura', value: 'high' },
            { label: 'Mantengo un autorespeto saludable', value: 'medium' },
            { label: 'Priorizo la humildad y la apertura', value: 'low' },
        ],
        key: 'pride',
    },
    {
        question: 'Finalmente, ¿qué estilo de comunicación te representa mejor?',
        options: [
            { label: 'Voy al grano sin rodeos', value: 'direct' },
            { label: 'Prefiero la sutileza y la diplomacia', value: 'indirect' },
            { label: 'Uso un lenguaje soñador y poético', value: 'romantic' },
            { label: 'Me comunico con autoridad y seguridad', value: 'firm' },
        ],
        key: 'style',
    },
];

const EssencePage: React.FC = () => {
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();
    const { refreshUser } = useAuth();

    useEffect(() => {
        document.title = "Descubre tu Esencia - Mensaje Mágico";
    }, []);

    const handleAnswer = (key: string, value: string) => {
        setAnswers((prev) => ({ ...prev, [key]: value }));
        
        // Patrón de Feedback: Esperar un momento para que el usuario vea la selección antes de cambiar
        if (currentQuestionIndex < questions.length - 1) {
            setTimeout(() => {
                setCurrentQuestionIndex((prev) => prev + 1);
            }, 350);
        }
    };

    const handleBack = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(currentQuestionIndex - 1);
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        setError(null);
        setSuccess(false);

        // Since two questions can update the 'style', we need to make sure we have a value for it.
        // We can prioritize the last one, or have a more complex logic. Here we just use the last answer.
        const finalAnswers = {
            expressiveness: answers.expressiveness,
            intensity: answers.intensity,
            pride: answers.pride,
            style: answers.style
        };

        try {
            await api.post('/api/auth/essence', finalAnswers);
            await refreshUser();
            setSuccess(true);
            setTimeout(() => navigate('/'), 2000);
        } catch (err: any) {
            if (err.message === 'Failed to fetch' || (typeof navigator !== 'undefined' && !navigator.onLine)) {
                setError('No se pudo conectar con el servidor. Verifica tu conexión a internet.');
            } else {
                setError(err.message || 'Ocurrió un error al guardar tu esencia.');
            }
        } finally {
            setLoading(false);
        }
    };

    const currentQuestion = questions[currentQuestionIndex];
    const isLastQuestion = currentQuestionIndex === questions.length - 1;
    const hasAnsweredCurrent = !!answers[currentQuestion.key];


    if (success) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center animate-fade-in-up">
                <div className="text-6xl mb-6">✨</div>
                <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-4">¡Esencia Guardada!</h1>
                <p className="text-slate-500 dark:text-slate-400 text-lg font-medium">Tu perfil ha sido actualizado. Redirigiendo...</p>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto px-4 py-12 animate-fade-in-up">
            <div className="text-center mb-10">
                <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-4">
                    Descubre tu <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Esencia</span>
                </h1>
                <p className="text-slate-500 dark:text-slate-400 font-medium">
                    Responde estas 5 preguntas para que la IA escriba como tú.
                </p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-8 md:p-10 rounded-[2.5rem] shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 relative overflow-hidden">
                {/* Progress Bar */}
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-slate-100 dark:bg-slate-800">
                    <div
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-500 ease-out"
                        style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                    />
                </div>

                <div className="mt-4">
                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">
                        Pregunta {currentQuestionIndex + 1} de {questions.length}
                    </span>
                    <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white mt-2 mb-8 leading-snug">
                        {currentQuestion.question}
                    </h2>

                    <div className="space-y-3">
                        {currentQuestion.options.map((option) => {
                            const isSelected = answers[currentQuestion.key] === option.value;
                            return (
                                <button
                                    key={option.value}
                                    onClick={() => handleAnswer(currentQuestion.key, option.value)}
                                    className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 group relative ${
                                        isSelected 
                                            ? "border-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:border-blue-500 shadow-md transform scale-[1.01]" 
                                            : "border-slate-100 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                    }`}
                                    aria-pressed={isSelected}
                                >
                                    <div className="flex items-center justify-between">
                                        <span className={`font-bold text-lg transition-colors ${
                                            isSelected
                                                ? "text-blue-700 dark:text-blue-300"
                                                : "text-slate-700 dark:text-slate-200 group-hover:text-blue-700 dark:group-hover:text-blue-300"
                                        }`}>
                                            {option.label}
                                        </span>
                                        {isSelected && (
                                            <span className="text-blue-600 dark:text-blue-400 animate-fade-in">
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                                                    <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
                                                </svg>
                                            </span>
                                        )}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="flex justify-between items-center mt-10 pt-6 border-t border-slate-100 dark:border-slate-800">
                    <button
                        onClick={handleBack}
                        disabled={currentQuestionIndex === 0 || loading}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 font-bold text-sm disabled:opacity-30 transition-colors"
                    >
                        ← Anterior
                    </button>
                    
                    {isLastQuestion && (
                        <button
                            onClick={handleSubmit}
                            disabled={loading || !hasAnsweredCurrent}
                            className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all disabled:opacity-50 disabled:scale-100"
                        >
                            {loading ? 'Guardando...' : 'Finalizar'}
                        </button>
                    )}
                </div>

                {error && (
                    <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-sm font-bold text-center">
                        {error}
                    </div>
                )}
            </div>
        </div>
    );
};

export default EssencePage;
