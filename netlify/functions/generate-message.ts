import type { Handler } from '@netlify/functions';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.AI_API_KEY || '');

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const {
      prompt,
      systemInstruction,
      temperature = 0.7,
      maxTokens = 200,
    } = body;

    if (!prompt || typeof prompt !== 'string') {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Prompt inválido' }),
      };
    }

    if (!process.env.AI_API_KEY) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'API key no configurada' }),
      };
    }

    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      systemInstruction,
    });

    const result = await model.generateContent({
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        temperature,
        maxOutputTokens: maxTokens,
      },
    });

    const text =
      result.response.text()?.trim() ||
      'No se pudo generar el mensaje en este momento.';

    return {
      statusCode: 200,
      body: JSON.stringify({ text }),
    };
  } catch (error) {
    console.error('Gemini error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Error al generar el mensaje con IA',
      }),
    };
  }
};
