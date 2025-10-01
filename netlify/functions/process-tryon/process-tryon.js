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

    const { profileImage, clothingImage } = JSON.parse(event.body);
    
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

    // 1. Crear tarea
    const createTaskData = {
      prompt: "Take the original photo of the person and add the clothing from the reference image. Keep the same size, proportions, and pose of the person, only adding the clothing naturally.",
      reference_images: [profileImage, clothingImage]
    };

    // console.log('Creando tarea de generación...');
    
    const createResponse = await axios.post(
      'https://api.freepik.com/v1/ai/gemini-2-5-flash-image-preview',
      createTaskData,
      {
        headers: {
          'Content-Type': 'application/json',
          'x-freepik-api-key': apiKey
        }
      }
    );

    const taskId = createResponse.data.data.task_id;
    // console.log('Tarea creada:', taskId);

    // 2. Polling para verificar estado
    let attempts = 0;
    const maxAttempts = 60; // Máximo 5 minutos (5 segundos × 60)
    
    while (attempts < maxAttempts) {
      attempts++;
    //   console.log(`Verificando estado (intento ${attempts})...`);
      
      await new Promise(resolve => setTimeout(resolve, 5000)); // Esperar 5 segundos
      
      try {
        const statusResponse = await axios.get(
          `https://api.freepik.com/v1/ai/gemini-2-5-flash-image-preview/${taskId}`,
          {
            headers: {
              'x-freepik-api-key': apiKey
            }
          }
        );

        const task = statusResponse.data.data;
        const status = task.status;
        // console.log('Estado actual:', status);

        if (status === 'COMPLETED') {
          const generated = task.generated;
          if (generated && generated.length > 0) {
            // Devolvemos la URL de la imagen generada
            return {
              statusCode: 200,
              headers,
              body: JSON.stringify({
                success: true,
                url: generated[0],
                message: 'Generación completada exitosamente'
              })
            };
          } else {
            return {
              statusCode: 500,
              headers,
              body: JSON.stringify({
                success: false,
                error: 'No se generaron imágenes'
              })
            };
          }
        } else if (status === 'FAILED') {
          return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
              success: false,
              error: task.error || 'Error desconocido en la generación'
            })
          };
        }
        // Si está PROCESSING, continuamos el loop
      } catch (error) {
        // console.error('Error verificando estado:', error.message);
        // Continuamos intentando
      }
    }

    // Timeout después de máximo intentos
    return {
      statusCode: 408,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Tiempo de espera agotado'
      })
    };

  } catch (error) {
    // console.error('Error en process-tryon:', error.response?.data || error.message);
    
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