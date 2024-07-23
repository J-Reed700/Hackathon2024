from pathlib import Path
from dotenv import load_dotenv
import os

class Config:
    FLASK_ENV = 'development'
    DEBUG = False
    OPENAI_API_KEY = os.environ.get('OPENAI_API_KEY', '')
    CLAUDE_API_KEY = os.environ.get('CLAUDE_API_KEY', '') 
    PINECONE_API_KEY = os.environ.get('PINECONE_API_KEY', '') 
    GROQ_API_KEY = os.environ.get('GROQ_API_KEY', '')
    CHATBT_DB_NAME = 'chatbt'
    REPORTAI_DB_NAME = 'report'
    MODEL_NAME = 'gpt-4o'
    AI_PROVIDER = 'openai'
    HYDE_MODEL = 'gpt-4o'

class LocalConfig(Config):
    load_dotenv()
    DEBUG = True
    SECRET_KEY = 'local'
    PINECONE_API_KEY = '64ce72ee-9a1f-435b-8645-75a89d92d137'

class DevelopmentConfig(Config):
    FLASK_ENV = 'development'
    SECRET_KEY = os.environ.get('SECRET_KEY') # TODO: Need to fetch this from Secret Store
    
class ProductionConfig(Config):
    FLASK_ENV = 'production'
    MONGO_URI = os.environ.get('CONN_STRING')
    SECRET_KEY = os.environ.get('SECRET_KEY') # TODO: Need to fetch this from Secret Store