const axios = require('axios');

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS'
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

    const { taskId } = event.queryStringParameters;
    
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

    const apiKey = process.env.FREEPIK_API_KEY;
    
    if (!apiKey) {
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
          'x-freepik-api-key': apiKey
        }
      }
    );

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        data: response.data.data,
        message: 'Estado obtenido exitosamente'
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