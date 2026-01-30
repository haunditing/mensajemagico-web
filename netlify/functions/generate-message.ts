import type { Handler } from '@netlify/functions';

export const handler: Handler = async (event) => {
  // Solo permitimos POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  try {
    // Parseo seguro del body
    const body = JSON.parse(event.body || '{}');
    const { prompt, systemInstruction, temperature, maxTokens } = body;

    // Validación mínima
    if (!prompt || typeof prompt !== 'string') {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Prompt inválido' }),
      };
    }

    /**
     * ⚠️ IMPORTANTE
     * Por ahora NO llamamos a ningún proveedor de IA real.
     * Devolvemos una respuesta mock para validar infraestructura.
     */

    const mockText = `✨ Mensaje generado (mock):
${prompt.slice(0, 120)}${prompt.length > 120 ? '...' : ''}`;

    return {
      statusCode: 200,
      body: JSON.stringify({
        text: mockText,
        meta: {
          temperature,
          maxTokens,
          mocked: true,
        },
      }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Error interno en la función' }),
    };
  }
};
