from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
import boto3
import json
import os
import time
from botocore.exceptions import ClientError
import logging
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from .bedrock_client import get_bedrock_client
from .utils import get_user_from_token
from django.conf import settings
from django.contrib.auth import get_user_model
import jwt
from datetime import datetime, timedelta
from collections import deque
import threading
import queue
from functools import lru_cache

User = get_user_model()
logger = logging.getLogger(__name__)

# Configuración de rate limiting más conservadora
RATE_LIMIT = 1  # mensajes por segundo
RATE_WINDOW = 10  # ventana de tiempo en segundos
MAX_RETRIES = 3
INITIAL_RETRY_DELAY = 10  # segundos

# Control de rate limiting
# Estas variables y el lock se mantienen para la lógica de conteo.
last_request_time = datetime.now()
request_count = 0
lock = threading.Lock()

# Custom exception for rate limiting
class RateLimitExceededError(Exception):
    def __init__(self, message, sleep_time):
        super().__init__(message)
        self.sleep_time = sleep_time

# Cache para respuestas comunes
@lru_cache(maxsize=100)
def get_cached_response(message):
    return None

def get_bedrock_client():
    try:
        client = boto3.client(
            service_name='bedrock-runtime',
            region_name='us-east-1',
            aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
            aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY')
        )
        logger.info("Conexión a Bedrock establecida correctamente")
        return client
    except Exception as e:
        logger.error(f"Error al conectar con Bedrock: {str(e)}")
        return None

def get_user_from_token(request):
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return None

    token = auth_header.split(' ')[1]
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
        user_id = payload.get('user_id')
        if user_id:
            return User.objects.get(id=user_id)
    except (jwt.InvalidTokenError, User.DoesNotExist):
        return None
    return None

def check_rate_limit():
    global last_request_time, request_count
    with lock:
        now = datetime.now()
        
        # Si ha pasado más de la ventana de tiempo, reiniciar el contador
        if (now - last_request_time).total_seconds() > RATE_WINDOW:
            request_count = 0
            last_request_time = now
        
        # Si hemos alcanzado el límite, esperar
        if request_count >= RATE_LIMIT:
            sleep_time = RATE_WINDOW - (now - last_request_time).total_seconds()
            if sleep_time > 0:
                logger.info(f"Rate limit check: Exceeded. Need to sleep for {sleep_time:.2f} segundos.")
                # No dormir aquí, solo devolver el tiempo de espera necesario.
                # Reiniciar el contador y tiempo para la próxima ventana después de la espera teórica.
                # Esto es una simplificación; idealmente, el cliente esperaría y luego la nueva solicitud
                # encontraría la ventana reiniciada. Para este enfoque, asumimos que el cliente
                # respetará el Retry-After.
                # last_request_time = now + timedelta(seconds=sleep_time) # Proyectar el reinicio
                # request_count = 0 # Reiniciar contador para la nueva ventana proyectada
                return sleep_time
        
        request_count += 1
        return 0 # 0 o None para indicar que no hay que esperar

def process_message_with_retry(bedrock, prompt, retry_count=0):
    try:
        # Verificar caché primero
        cached_response = get_cached_response(prompt)
        if cached_response:
            logger.info("Respuesta obtenida de caché")
            return cached_response

        # Mover la lógica de check_rate_limit aquí y manejar su resultado
        sleep_needed = check_rate_limit()
        if sleep_needed > 0:
            # Propagar la necesidad de esperar al chat_view
            raise RateLimitExceededError("Rate limit exceeded", sleep_needed)
        
        response = bedrock.invoke_model(
            modelId='anthropic.claude-3-sonnet-20240229-v1:0',
            body=json.dumps({
                "prompt": prompt,
                "max_tokens": 500,
                "temperature": 0.7,
                "top_p": 0.9,
            })
        )
        
        response_body = json.loads(response['body'].read())
        generated_text = response_body.get('completion', '')
        
        # La lógica de caché actual con get_cached_response siempre devolviendo None
        # no guarda 'generated_text'. Simplemente se eliminan las llamadas problemáticas.
        # get_cached_response.cache_clear() # Eliminado
        # get_cached_response(prompt) # Eliminado - esto no guardaba generated_text
        
        return generated_text
        
    except Exception as e:
        if 'ThrottlingException' in str(e) and retry_count < MAX_RETRIES:
            sleep_time = INITIAL_RETRY_DELAY * (2 ** retry_count)
            logger.warning(f"Intento {retry_count + 1} fallido por throttling. Esperando {sleep_time} segundos...")
            time.sleep(sleep_time)
            return process_message_with_retry(bedrock, prompt, retry_count + 1)
        raise e

@csrf_exempt
@require_http_methods(["POST"])
def chat_view(request):
    try:
        # Obtener el usuario del token
        user = get_user_from_token(request)
        if not user:
            return JsonResponse({'error': 'Token de autenticación no proporcionado'}, status=401)

        # Obtener el mensaje del cuerpo de la petición
        data = json.loads(request.body)
        message = data.get('message', '').strip()
        
        if not message:
            return JsonResponse({'error': 'El mensaje no puede estar vacío'}, status=400)

        logger.info(f"Mensaje recibido: {message}")

        # Configurar el cliente de Bedrock
        bedrock = get_bedrock_client()
        if not bedrock:
            return JsonResponse({'error': 'Error al conectar con Bedrock'}, status=503)

        # Preparar el prompt
        prompt = f"""Eres un asistente virtual amigable y servicial. 
        Responde al siguiente mensaje de manera concisa y útil: {message}"""

        try:
            generated_text = process_message_with_retry(bedrock, prompt)
            
            if generated_text: # Asumiendo que generated_text no será None si hay éxito
                logger.info(f"Respuesta generada: {generated_text}")
                return JsonResponse({'response': generated_text})
            else: # Esto no debería ocurrir si process_message_with_retry lanza excepciones en error
                logger.error("process_message_with_retry devolvió None sin lanzar excepción")
                return JsonResponse({'error': 'No se pudo generar una respuesta'}, status=500)

        except RateLimitExceededError as rle:
            logger.warning(f"Rate limit excedido para el usuario {user.username if user else 'anonymous'}. Retry-After: {rle.sleep_time}")
            response = JsonResponse({'error': 'Too many requests. Please try again later.'}, status=429)
            response['Retry-After'] = str(int(rle.sleep_time)) # Retry-After debe ser un entero de segundos
            return response
            
        except Exception as e:
            logger.error(f"Error al generar respuesta: {str(e)}")
            # Mantener el error 503 para otros errores de Bedrock/servicio,
            # pero el rate limiting ahora es 429.
            if 'ThrottlingException' in str(e): # Bedrock también puede hacer throttling
                 return JsonResponse({
                    'error': 'El servicio está experimentando una alta demanda (Bedrock). Por favor, espera unos minutos.'
                }, status=503) # Opcionalmente, también podría ser 429 con Retry-After si Bedrock lo provee

            return JsonResponse({
                'error': 'El servicio está experimentando una alta demanda. Por favor, espera unos minutos antes de intentar nuevamente.'
            }, status=503)

        # Esta parte ya no debería ser alcanzada si process_message_with_retry siempre devuelve texto o lanza excepción
        return JsonResponse({
            'error': 'No se pudo generar una respuesta (flujo inesperado)'
        }, status=500)

    except json.JSONDecodeError:
        return JsonResponse({'error': 'Formato de JSON inválido'}, status=400)
    except Exception as e:
        logger.error(f"Error en el chat: {str(e)}")
        return JsonResponse({'error': f'Error en el chat: {str(e)}'}, status=500)
