export enum Tone {
  ROMANTIC = "romántico",
  SHORT = "corto",
  FORMAL = "formal",
  FUNNY = "divertido",
  PROFOUND = "profundo",
  FLIRTY = "coqueto",
  DIRECT = "directo",
  SUBTLE = "sutil",
  SARCASTIC = "sarcástico",
  LIGHT_DESPERATION = "desesperado-light",
  BELATED = "atrasado",
}

export type CountryCode =
  | "AR"
  | "CO"
  | "MX"
  | "PE"
  | "CL"
  | "EC"
  | "UY"
  | "VE"
  | "GENERIC";

export enum SharePlatform {
  WHATSAPP = "whatsapp",
  INSTAGRAM = "instagram",
  FACEBOOK = "facebook",
  TELEGRAM = "telegram",
  EMAIL = "email",
  SMS = "sms",
  X = "x",
  COPY = "copy",
  NATIVE = "native",
}

export interface Relationship {
  id: string;
  label: string;
  slug: string;
}

export interface Occasion {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
  h1: string;
  metaTitle: string;
  metaDesc: string;
  allowedPlatforms?: SharePlatform[];
}

export interface LocalizedContent {
  name: string;
  description: string;
  h1: string;
  metaTitle: string;
  metaDesc: string;
}

export interface CulturalVariant {
  startMonth?: number;
  name: string;
  description?: string;
  h1?: string;
  metaTitle?: string;
  metaDesc?: string;
}

export interface MessageConfig {
  occasion: string;
  relationship: string;
  tone: Tone;
  receivedMessageType?: string;
  receivedText?: string;
  contextWords?: string[];
}

export interface GeneratedMessage {
  id: string;
  content: string;
  timestamp: number;
}
