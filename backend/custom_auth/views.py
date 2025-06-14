from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
from .services import auth_service, bedrock_service
import logging

logger = logging.getLogger(__name__)

def get_auth_header(request):
    """Extrae el token de autenticación del header."""
    auth_header = request.headers.get('Authorization', '')
    if not auth_header.startswith('Bearer '):
        raise Exception("Token de autenticación no proporcionado")
    return auth_header.split(' ')[1]

@csrf_exempt
def login(request):
    """Maneja el inicio de sesión de usuarios."""
    if request.method != 'POST':
        return JsonResponse({'error': 'Método no permitido'}, status=405)
    
    try:
        data = json.loads(request.body)
        email = data.get('email')
        password = data.get('password')
        
        if not email or not password:
            return JsonResponse({
                'error': 'Email y contraseña son requeridos'
            }, status=400)
        
        # TODO: Implementar validación real contra la base de datos
        # Por ahora, simulamos un usuario válido
        user_data = {
            'id': 1,
            'email': email
        }
        
        token = auth_service.generate_token(user_data)
        
        return JsonResponse({
            'user': user_data,
            'token': token
        })
        
    except json.JSONDecodeError:
        logger.error("Error al decodificar JSON en login")
        return JsonResponse({
            'error': 'Formato de datos inválido'
        }, status=400)
    except Exception as e:
        logger.error(f"Error en login: {str(e)}")
        return JsonResponse({
            'error': str(e)
        }, status=500)

@csrf_exempt
def chat(request):
    """Maneja las peticiones de chat."""
    logger.info("=== Nueva petición de chat recibida ===")
    logger.info(f"Método: {request.method}")
    logger.info(f"Headers: {request.headers}")
    
    if request.method == 'GET':
        return JsonResponse({
            'status': 'ok',
            'message': 'El endpoint de chat está funcionando correctamente'
        })
    
    if request.method == 'POST':
        try:
            # Validar autenticación
            token = get_auth_header(request)
            auth_service.validate_token(token)
            
            # Procesar mensaje
            data = json.loads(request.body)
            message = data.get('message', '')
            
            if not message:
                return JsonResponse({
                    'error': 'El mensaje no puede estar vacío'
                }, status=400)
            
            logger.info(f"Mensaje recibido: {message}")
            
            # Generar respuesta
            response = bedrock_service.generate_response(message)
            logger.info(f"Respuesta generada: {response}")
            
            return JsonResponse({
                'response': response
            })
            
        except json.JSONDecodeError as e:
            logger.error(f"Error al decodificar JSON: {str(e)}")
            logger.error(f"Body recibido: {request.body}")
            return JsonResponse({
                'error': 'Formato de datos inválido'
            }, status=400)
        except Exception as e:
            logger.error(f"Error en el chat: {str(e)}")
            return JsonResponse({
                'error': str(e)
            }, status=500)
    
    logger.warning(f"Método no permitido: {request.method}")
    return JsonResponse({
        'error': 'Método no permitido'
    }, status=405)
