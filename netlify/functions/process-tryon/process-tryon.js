const axios = require('axios');

exports.handler = async (event, context) => {
  // Headers CORS completos
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-freepik-api-key, X-Requested-With',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': '86400',
    'Content-Type': 'application/json'
  };

  // Manejar preflight OPTIONS inmediatamente
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    console.log('Process-tryon function called with method:', event.httpMethod);
    
    if (event.httpMethod !== 'POST') {
      return {
        statusCode: 405,
        headers,
        body: JSON.stringify({ error: 'Método no permitido. Use POST.' })
      };
    }

    // Parsear el body
    let body;
    try {
      body = JSON.parse(event.body || '{}');
    } catch (parseError) {
      console.error('Error parsing JSON:', parseError);
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          success: false, 
          error: 'Cuerpo de solicitud JSON inválido' 
        })
      };
    }

    const { profileImage, clothingImage, apiKey } = body;
    
    console.log('Received request:', {
      profileImageLength: profileImage?.length,
      clothingImageLength: clothingImage?.length,
      hasApiKey: !!apiKey,
      apiKeyLength: apiKey?.length
    });

    // Validaciones
    if (!profileImage || !clothingImage) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          success: false, 
          error: 'Se requieren ambas imágenes (profileImage y clothingImage)' 
        })
      };
    }

    // Determinar qué API key usar
    let finalApiKey;
    let authMode = '';

    if (apiKey && apiKey.trim()) {
      // Modalidad: API key del usuario
      finalApiKey = apiKey.trim();
      authMode = 'USER_PROVIDED';
      console.log('Using user-provided API key');
    } else {
      // Modalidad: API key del servidor (original)
      finalApiKey = process.env.FREEPIK_API_KEY;
      authMode = 'SERVER_PROVIDED';
      console.log('Using server API key from environment variables');
    }

    // Validar que tengamos una API key
    if (!finalApiKey) {
      console.error('No API key available');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          success: false, 
          error: 'API key no configurada. ' + 
                 (authMode === 'USER_PROVIDED' ? 
                  'La API key proporcionada es inválida.' : 
                  'Contacte al administrador del sitio.')
        })
      };
    }

    console.log(`Creating task in Freepik API (auth mode: ${authMode})...`);
    
    const createTaskData = {
      prompt: "Take the original photo of the person and add the clothing from the reference image. Keep the same size, proportions, and pose of the person, only adding the clothing naturally.",
      reference_images: [profileImage, clothingImage]
    };

    const createResponse = await axios.post(
      'https://api.freepik.com/v1/ai/gemini-2-5-flash-image-preview',
      createTaskData,
      {
        headers: {
          'Content-Type': 'application/json',
          'x-freepik-api-key': finalApiKey
        },
        timeout: 10000
      }
    );

    const taskId = createResponse.data.data.task_id;
    console.log('Task created:', taskId, '(auth mode:', authMode + ')');

    // Polling para verificar estado
    let attempts = 0;
    const maxAttempts = 36; // 3 minutos (5 segundos × 36)
    
    while (attempts < maxAttempts) {
      attempts++;
      console.log(`Checking status (attempt ${attempts}, auth: ${authMode})...`);
      
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      try {
        const statusResponse = await axios.get(
          `https://api.freepik.com/v1/ai/gemini-2-5-flash-image-preview/${taskId}`,
          {
            headers: {
              'x-freepik-api-key': finalApiKey
            },
            timeout: 10000
          }
        );

        const task = statusResponse.data.data;
        const status = task.status;
        console.log('Current status:', status, '(auth:', authMode + ')');

        if (status === 'COMPLETED') {
          const generated = task.generated;
          if (generated && generated.length > 0) {
            console.log('Generation completed successfully (auth:', authMode + ')');
            return {
              statusCode: 200,
              headers,
              body: JSON.stringify({
                success: true,
                url: generated[0],
                message: 'Generación completada exitosamente',
                taskId: taskId,
                authMode: authMode
              })
            };
          } else {
            return {
              statusCode: 500,
              headers,
              body: JSON.stringify({
                success: false,
                error: 'No se generaron imágenes en la respuesta',
                authMode: authMode
              })
            };
          }
        } else if (status === 'FAILED') {
          return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
              success: false,
              error: task.error || 'Error desconocido en la generación de Freepik',
              authMode: authMode
            })
          };
        }
        // Si está PROCESSING, continuamos el loop
        
      } catch (statusError) {
        console.error('Error checking status:', statusError.message, '(auth:', authMode + ')');
        // Continuamos intentando en el siguiente loop
      }
    }

    // Timeout después de máximo intentos
    return {
      statusCode: 408,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Tiempo de espera agotado (3 minutos)',
        authMode: authMode
      })
    };

  } catch (error) {
    console.error('Error in process-tryon:', error);
    
    let errorMessage = 'Error interno del servidor';
    let authMode = 'UNKNOWN';
    
    if (error.code === 'ECONNABORTED') {
      errorMessage = 'Timeout en la conexión con Freepik API';
    } else if (error.response) {
      // Manejar errores específicos de Freepik API
      const status = error.response.status;
      
      if (status === 401) {
        errorMessage = 'API key inválida o no autorizada';
      } else if (status === 403) {
        errorMessage = 'Acceso denegado. Verifique los permisos de su API key.';
      } else if (status === 429) {
        errorMessage = 'Límite de solicitudes excedido. Por favor espere e intente nuevamente.';
      } else {
        errorMessage = `Freepik API error: ${status} - ${error.response.data?.message || error.message}`;
      }
      
      // Determinar auth mode basado en la presencia de apiKey en el request
      try {
        const requestBody = JSON.parse(event.body || '{}');
        authMode = requestBody.apiKey ? 'USER_PROVIDED' : 'SERVER_PROVIDED';
      } catch (e) {
        authMode = 'UNKNOWN';
      }
    } else if (error.request) {
      errorMessage = 'No se pudo conectar con Freepik API';
    } else {
      errorMessage = error.message;
    }
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        success: false, 
        error: errorMessage,
        authMode: authMode
      })
    };
  }
};