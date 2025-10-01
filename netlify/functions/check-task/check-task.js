const axios = require('axios');

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-freepik-api-key, X-Requested-With',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Credentials': 'true',
    'Content-Type': 'application/json'
  };

  try {
    if (event.httpMethod === 'OPTIONS') {
      return { statusCode: 200, headers, body: '' };
    }

    if (event.httpMethod !== 'GET') {
      return {
        statusCode: 405,
        headers,
        body: JSON.stringify({ error: 'Método no permitido' })
      };
    }

    const { taskId, apiKey } = event.queryStringParameters;
    
    if (!taskId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          success: false, 
          error: 'Se requiere taskId' 
        })
      };
    }

    // Determinar API key a usar
    let finalApiKey = apiKey && apiKey.trim() ? apiKey.trim() : process.env.FREEPIK_API_KEY;
    const authMode = apiKey ? 'USER_PROVIDED' : 'SERVER_PROVIDED';
    
    if (!finalApiKey) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          success: false, 
          error: 'API key no configurada' 
        })
      };
    }

    const response = await axios.get(
      `https://api.freepik.com/v1/ai/gemini-2-5-flash-image-preview/${taskId}`,
      {
        headers: {
          'x-freepik-api-key': finalApiKey
        }
      }
    );

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        data: response.data.data,
        message: 'Estado obtenido exitosamente',
        authMode: authMode
      })
    };

  } catch (error) {
    console.error('Error verificando tarea:', error.response?.data || error.message);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        success: false, 
        error: error.response?.data?.message || error.message 
      })
    };
  }
};