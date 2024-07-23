import time
import pandas as pd
import requests
import uuid
from flask import current_app, g
from datetime import timedelta
from datetime import datetime
import threading
from app.openai_client import OpenAIClient
from ..models.conversation import Conversation
from .report_completions_generator import ReportCompletionsGenerator
from .agent_service import AgentService
from .duckdb_repo import DuckDBRepo
from opentelemetry import trace
from config import Config
from .orchestrator import Orchestrator

tracer = trace.get_tracer(__name__)

class ConsultantAI:
    embeddings: dict
    dataFrame: pd.DataFrame
    conversations = {}
    COMPLETIONS_API_PARAMS = {
            "temperature": 0.0
    }
    
    def __init__(self, apikey: str):
        self.completions_generator = ReportCompletionsGenerator(api_key=apikey)
        duckdb_repo = DuckDBRepo()
        self.agent_service = AgentService(self.completions_generator, duckdb_repo)
        self.openai_client = OpenAIClient.get_client(Config.MODEL_NAME)
        self.orchestrator = Orchestrator(self.agent_service)

    def pulse_check(self):
        current_app.logger.info("Starting pulse_check method")
        try:
            response = self.orchestrator.pulse_check()      
            return response
        except Exception as e:
            current_app.logger.error(f"Error in pulse_check: {str(e)}", exc_info=True)
            raise       

    def get_invoices(self):
        try:
            response = self.orchestrator.get_invoices()     
            return response
        except Exception as e:
            current_app.logger.error(f"Error in pulse_check: {str(e)}", exc_info=True)
            raise 


