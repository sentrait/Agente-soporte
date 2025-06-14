import os
import boto3
import logging

logger = logging.getLogger(__name__)

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