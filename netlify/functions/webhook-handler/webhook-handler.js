const axios = require('axios');

// Almacenamiento en memoria (en producción usarías una base de datos)
const taskResults = new Map();

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Credentials': 'true',
    'Content-Type': 'application/json'
  };

  // Manejar preflight OPTIONS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    console.log('Webhook handler called with method:', event.httpMethod);

    if (event.httpMethod === 'POST') {
      // Este es el webhook de Freepik notificando que la tarea está lista
      const webhookData = JSON.parse(event.body || '{}');
      console.log('Webhook received:', JSON.stringify(webhookData, null, 2));

      const taskId = webhookData.id;
      const status = webhookData.status;
      const generated = webhookData.generated;

      if (taskId && status) {
        // Guardar el resultado en memoria
        taskResults.set(taskId, {
          status: status,
          generated: generated,
          error: webhookData.error,
          receivedAt: new Date().toISOString()
        });

        console.log(`Webhook processed for task ${taskId}: ${status}`);

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            success: true,
            message: 'Webhook received successfully'
          })
        };
      } else {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            success: false,
            error: 'Datos de webhook inválidos'
          })
        };
      }

    } else if (event.httpMethod === 'GET') {
      // Consultar el estado de una tarea
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

      const result = taskResults.get(taskId);
      
      if (result) {
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            success: true,
            taskId: taskId,
            status: result.status,
            generated: result.generated,
            error: result.error,
            receivedAt: result.receivedAt
          })
        };
      } else {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({
            success: false,
            error: 'Tarea no encontrada o aún no procesada'
          })
        };
      }

    } else {
      return {
        statusCode: 405,
        headers,
        body: JSON.stringify({ error: 'Método no permitido' })
      };
    }

  } catch (error) {
    console.error('Error in webhook handler:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Error procesando webhook: ' + error.message
      })
    };
  }
};