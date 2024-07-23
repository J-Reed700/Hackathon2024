import os
from openai import OpenAI
from config import Config

class OpenAIClient:
    _instance = None
    
    def __init__(self, model_name=Config.MODEL_NAME):
        self.model_name = model_name

    def __new__(cls, model_name=Config.MODEL_NAME):
        if cls._instance is None:
            print("Creating the OpenAI client instance")
            cls._instance = super(OpenAIClient, cls).__new__(cls)
            cls._instance.client = OpenAI(
                api_key=Config.OPENAI_API_KEY
            )
            cls._instance.model_name = model_name
            print("OpenAI client instance created")
        return cls._instance

    @classmethod
    def get_client(cls, model_name=Config.MODEL_NAME):
        if cls._instance is None:
            cls(model_name=model_name)
        return cls._instance.client