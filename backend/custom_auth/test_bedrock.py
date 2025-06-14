import boto3
import os
from django.test import TestCase

class BedrockTest(TestCase):
    def setUp(self):
        self.client = boto3.client(
            service_name='bedrock-runtime',
            region_name='us-east-1',
            aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
            aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY')
        )

    def test_bedrock_connection(self):
        try:
            # Test simple de conexión
            response = self.client.list_foundation_models()
            self.assertIsNotNone(response)
        except Exception as e:
            self.fail(f"Error al conectar con Bedrock: {str(e)}") 