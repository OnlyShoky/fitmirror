const axios = require('axios');

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  try {
    if (event.httpMethod === 'OPTIONS') {
      return { statusCode: 200, headers, body: '' };
    }

    if (event.httpMethod !== 'POST') {
      return {
        statusCode: 405,
        headers,
        body: JSON.stringify({ error: 'Método no permitido' })
      };
    }

    const { profileImage, clothingImage, prompt } = JSON.parse(event.body);
    
    // Validar que tenemos las imágenes
    if (!profileImage || !clothingImage) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          success: false, 
          error: 'Se requieren ambas imágenes' 
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

    const data = {
      prompt: prompt || "Take the original photo of the person and add the clothing from the reference image. Keep the same size, proportions, and pose of the person, only adding the clothing naturally.",
      reference_images: [profileImage, clothingImage]
    };

    const response = await axios.post(
      'https://api.freepik.com/v1/ai/gemini-2-5-flash-image-preview',
      data,
      {
        headers: {
          'Content-Type': 'application/json',
          'x-freepik-api-key': apiKey
        }
      }
    );

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        taskId: response.data.data.task_id,
        message: 'Tarea creada exitosamente'
      })
    };

  } catch (error) {
    console.error('Error creando tarea:', error.response?.data || error.message);
    
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