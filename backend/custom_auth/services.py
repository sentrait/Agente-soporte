import boto3
import json
import logging
import jwt
from datetime import datetime, timedelta
from django.conf import settings

logger = logging.getLogger(__name__)

class AuthService:
    def __init__(self):
        self.secret_key = settings.SECRET_KEY

    def generate_token(self, user_data):
        """Genera un token JWT para el usuario."""
        try:
            payload = {
                'user_id': user_data.get('id'),
                'email': user_data.get('email'),
                'exp': datetime.utcnow() + timedelta(days=1)
            }
            token = jwt.encode(payload, self.secret_key, algorithm='HS256')
            return token
        except Exception as e:
            logger.error(f"Error al generar token: {str(e)}")
            raise

    def validate_token(self, token):
        """Valida un token JWT."""
        try:
            payload = jwt.decode(token, self.secret_key, algorithms=['HS256'])
            return payload
        except jwt.ExpiredSignatureError:
            logger.error("Token expirado")
            raise Exception("Token expirado")
        except jwt.InvalidTokenError as e:
            logger.error(f"Token inválido: {str(e)}")
            raise Exception("Token inválido")

class BedrockService:
    def __init__(self):
        try:
            self.bedrock = boto3.client(
                service_name='bedrock-runtime',
                region_name=settings.AWS_REGION,
                aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
                aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY
            )
            logger.info("Conexión a Bedrock establecida correctamente")
        except Exception as e:
            logger.error(f"Error al inicializar Bedrock: {str(e)}")
            raise

    def generate_response(self, message):
        """Genera una respuesta usando AWS Bedrock."""
        try:
            body = json.dumps({
                "anthropic_version": "bedrock-2023-05-31",
                "max_tokens": 100,
                "messages": [
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": message}
                        ]
                    }
                ]
            })

            response = self.bedrock.invoke_model(
                modelId='anthropic.claude-3-5-sonnet-20240620-v1:0',
                body=body,
                contentType="application/json",
                accept="application/json"
            )

            response_body = json.loads(response.get('body').read())
            return response_body.get('content', [{}])[0].get('text', '')
        except Exception as e:
            logger.error(f"Error al generar respuesta con Bedrock: {str(e)}")
            raise Exception(f"Error al procesar la solicitud: {str(e)}")

# Instancias globales de los servicios
auth_service = AuthService()
bedrock_service = BedrockService() 