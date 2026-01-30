
import { Occasion, Relationship, Tone, SharePlatform } from './types';

export const RELATIONSHIPS: Relationship[] = [
  { id: 'couple', label: 'Pareja', slug: 'pareja' },
  { id: 'ligue', label: 'Ligue/Crush', slug: 'ligue' },
  { id: 'friend', label: 'Amigo/a', slug: 'amigo' },
  { id: 'ex', label: 'Ex-pareja', slug: 'ex' },
  { id: 'mother', label: 'Madre', slug: 'madre' },
  { id: 'father', label: 'Padre', slug: 'padre' },
  { id: 'boss', label: 'Jefe/a', slug: 'jefe' },
  { id: 'secret_love', label: 'Amor Secreto', slug: 'amor-secreto' }
];

export const PENSAMIENTO_THEMES = [
  { id: 'vida', label: 'La Vida' },
  { id: 'amor', label: 'El Amor' },
  { id: 'trabajo', label: 'El Trabajo' },
  { id: 'amistad', label: 'La Amistad' },
  { id: 'crecimiento', label: 'Crecimiento Personal' },
  { id: 'soledad', label: 'Soledad y Paz' },
  { id: 'futuro', label: 'El Futuro' }
];

export const EMOTIONAL_STATES = [
  { id: 'tranquilo', label: 'Tranquilo/a' },
  { id: 'reflexivo', label: 'Reflexivo/a' },
  { id: 'triste', label: 'Melancólico/a' },
  { id: 'motivado', label: 'Motivado/a' },
  { id: 'neutro', label: 'Neutro/Ecléctico' }
];

export const RECEIVED_MESSAGE_TYPES = [
  { id: 'dry', label: 'Mensaje seco o cortante' },
  { id: 'ambiguous', label: 'Mensaje ambiguo / confuso' },
  { id: 'sweet', label: 'Mensaje cariñoso' },
  { id: 'funny', label: 'Algo divertido o un meme' },
  { id: 'cold', label: 'Mensaje frío o desinteresado' },
  { id: 'angry', label: 'Mensaje molesto' },
  { id: 'question', label: 'Una pregunta directa' }
];

export const OCCASIONS: Occasion[] = [
  {
    id: 'pensamiento',
    name: 'Y ahora un pensamiento',
    slug: 'pensamiento-del-dia',
    icon: '🧘',
    description: 'Reflexiones breves, profundas o cotidianas para tus estados e historias. Dale un respiro a tu feed con un pensamiento real.',
    h1: 'Generador de Pensamientos y Reflexiones para Estados',
    metaTitle: 'Y ahora un pensamiento: Reflexiones para Instagram y WhatsApp',
    metaDesc: 'Genera pensamientos profundos, motivadores o cotidianos para publicar en tus redes sociales. IA diseñada para reflexiones humanas y breves.',
    allowedPlatforms: [SharePlatform.INSTAGRAM, SharePlatform.FACEBOOK, SharePlatform.WHATSAPP, SharePlatform.X, SharePlatform.COPY]
  },
  {
    id: 'responder',
    name: 'Responder un mensaje',
    slug: 'responder-un-mensaje',
    icon: '💬',
    description: '¿No sabes qué contestar? Elige qué te enviaron y genera la respuesta perfecta para mantener el interés o poner límites con clase.',
    h1: 'Qué responder a un mensaje: Generador de Respuestas con IA',
    metaTitle: 'Qué responder a un mensaje: Ideas y Frases para WhatsApp',
    metaDesc: 'Genera la respuesta ideal para cualquier mensaje. Ideas para contestar mensajes secos, cariñosos o ambiguos de tu crush, pareja o amigos.',
    allowedPlatforms: [SharePlatform.WHATSAPP, SharePlatform.TELEGRAM, SharePlatform.SMS, SharePlatform.COPY]
  },
  {
    id: 'visto',
    name: 'No me dejes en visto',
    slug: 'no-me-dejes-en-visto',
    icon: 'whatsapp',
    description: '¿Te ignoraron? Genera mensajes creativos, divertidos o coquetos para recuperar su atención sin perder el estilo.',
    h1: 'Mensajes para cuando te dejan en Visto',
    metaTitle: 'Mensajes para cuando te dejan en Visto - MensajeMágico',
    metaDesc: 'Genera mensajes originales para cuando te dejan en visto. Frases divertidas, coquetas y directas para recuperar su atención.',
    allowedPlatforms: [SharePlatform.WHATSAPP, SharePlatform.TELEGRAM, SharePlatform.COPY]
  },
  {
    id: 'perdoname',
    name: 'Perdóname',
    slug: 'perdoname',
    icon: '🙏',
    description: 'Palabras sinceras para sanar heridas, pedir disculpas y buscar la reconciliación con las personas que amas.',
    h1: 'Mensajes de Perdón y Disculpas Sinceras',
    metaTitle: 'Mensajes para pedir Perdón: Frases de Disculpas y Reconciliación',
    metaDesc: 'Encuentra las palabras para pedir perdón de forma sincera. Genera mensajes de disculpa para tu pareja o amigos.',
    allowedPlatforms: [SharePlatform.WHATSAPP, SharePlatform.SMS, SharePlatform.EMAIL, SharePlatform.COPY]
  },
  {
    id: 'amor',
    name: 'Amor',
    slug: 'amor',
    icon: '❤️',
    description: 'Encuentra las palabras perfectas para expresar tus sentimientos en cualquier momento del año.',
    h1: 'Mensajes de Amor para Enamorar',
    metaTitle: 'Mensajes de Amor 2025: Frases para Dedicar',
    metaDesc: 'Genera mensajes únicos de amor. Frases románticas, cortas y profundas para tu pareja o amigos.',
    allowedPlatforms: [SharePlatform.WHATSAPP, SharePlatform.INSTAGRAM, SharePlatform.FACEBOOK, SharePlatform.COPY]
  },
  {
    id: 'birthday',
    name: 'Cumpleaños',
    slug: 'cumpleanos',
    icon: '🎂',
    description: 'Felicitaciones alegres, creativas y divertidas para un día único e inolvidable.',
    h1: 'Mensajes de Cumpleaños Originales y Divertidos',
    metaTitle: 'Frases de Cumpleaños: Mensajes para Amigos y Familia',
    metaDesc: 'Genera mensajes de cumpleaños creativos para cualquier persona. ¡Listo para enviar! Elige el tono perfecto.',
    allowedPlatforms: [SharePlatform.WHATSAPP, SharePlatform.FACEBOOK, SharePlatform.SMS, SharePlatform.COPY]
  },
  {
    id: 'anniversary',
    name: 'Aniversarios',
    slug: 'anniversary',
    icon: '💍',
    description: 'Celebra un año más de amor o compromiso con palabras bellas que lleguen al corazón.',
    h1: 'Mensajes de Aniversario para Parejas y Bodas',
    metaTitle: 'Frases de Aniversario: Mensajes Románticos de Amor',
    metaDesc: 'Cartas y mensajes para celebrar tu aniversario. Frases románticas y profundas para dedicar hoy.',
    allowedPlatforms: [SharePlatform.WHATSAPP, SharePlatform.EMAIL, SharePlatform.FACEBOOK, SharePlatform.COPY]
  },
  {
    id: 'mothers_day',
    name: 'Día de la Madre',
    slug: 'dia-de-la-madre',
    icon: '🌸',
    description: 'Demuestra todo tu amor a mamá con una carta especial llena de agradecimiento.',
    h1: 'Felicitaciones y Mensajes para el Día de la Madre',
    metaTitle: 'Día de la Madre: Mensajes y Frases de Agradecimiento',
    metaDesc: 'Encuentra el mensaje perfecto para mamá. Frases profundas y emotivas para enviar por WhatsApp.',
    allowedPlatforms: [SharePlatform.WHATSAPP, SharePlatform.FACEBOOK, SharePlatform.EMAIL, SharePlatform.COPY]
  },
  {
    id: 'fathers_day',
    name: 'Día del Padre',
    slug: 'dia-de-la-padre',
    icon: '👔',
    description: 'Frases de agradecimiento y cariño para el mejor papá del mundo.',
    h1: 'Mensajes para el Día del Padre: Inspiración y Cariño',
    metaTitle: 'Día del Padre: Frases, Mensajes y Felicitaciones 2025',
    metaDesc: 'Los mejores mensajes para papá. Genera frases cortas o profundas para enviar hoy mismo.',
    allowedPlatforms: [SharePlatform.WHATSAPP, SharePlatform.FACEBOOK, SharePlatform.EMAIL, SharePlatform.COPY]
  },
  {
    id: 'christmas',
    name: 'Navidad',
    slug: 'navidad',
    icon: '🎄',
    description: 'Deseos de paz, amor y prosperidad para tus seres queridos en estas fiestas.',
    h1: 'Frases y Mensajes de Navidad para Compartir',
    metaTitle: 'Mensajes de Navidad 2024: Frases de Paz y Amor',
    metaDesc: 'Genera felicitaciones navideñas personalizadas para familia y amigos. Listas para copiar y enviar.',
    allowedPlatforms: [SharePlatform.WHATSAPP, SharePlatform.EMAIL, SharePlatform.SMS, SharePlatform.COPY]
  }
];

export const TONES = [
  { value: Tone.ROMANTIC, label: 'Romántico' },
  { value: Tone.FUNNY, label: 'Divertido' },
  { value: Tone.FLIRTY, label: 'Coqueto' },
  { value: Tone.DIRECT, label: 'Directo' },
  { value: Tone.SUBTLE, label: 'Sutil' },
  { value: Tone.SARCASTIC, label: 'Sarcástico' },
  { value: Tone.SHORT, label: 'Corto' },
  { value: Tone.PROFOUND, label: 'Profundo' },
  { value: Tone.FORMAL, label: 'Formal' },
  { value: Tone.LIGHT_DESPERATION, label: 'Desesperado (Light)' }
];
