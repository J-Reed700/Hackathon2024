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
from .prompt_processor import PromptProcessor
from .report_completions_generator import ReportCompletionsGenerator
from .report_repo import ReportRepo
from opentelemetry import trace
from config import Config
from .models.report import Report
from .orchestrator import Orchestrator
tracer = trace.get_tracer(__name__)

class ReportAI:
    prompt_processor: PromptProcessor
    completions_generator: PromptProcessor
    embeddings: dict
    dataFrame: pd.DataFrame
    conversations = {}
    COMPLETIONS_API_PARAMS = {
            "temperature": 0.0
    }
    
    def __init__(self, apikey: str, report_repo: ReportRepo = None):
        self.prompt_processor = PromptProcessor(api_key=apikey)
        self.completions_generator = ReportCompletionsGenerator(api_key=apikey)
        self.report_repo = report_repo
        self.openai_client = OpenAIClient.get_client(Config.MODEL_NAME)
        self.orchestrator = Orchestrator(self.completions_generator)

    def ask_question(self, question: str, conversation_id: str = None) -> Report:
        if conversation_id is None or conversation_id == '':
            conversation_id = str(uuid.uuid4())

        conversation = self.report_repo.get_or_create_conversation(conversation_id, g.user_id)
        
        flagged = self.moderate_question(question)
        if flagged:
            #toDo
            return "I'm sorry, I can't answer that question as our system deemed this potentially inappropriate."
        
        response = self.orchestrator.process_query(question, conversation)
        if not response.is_success():
            report = Report(conversation_id, 
                            g.user_id, 
                            question, 
                            None, 
                            False, 
                            response.follow_up_question())
            self.report_repo.update_conversation(g.user_id, conversation_id, conversation)
            return report
        
        answer = self.answer_query(question, conversation_id)
        conversation.add_message("assistant", str(answer.to_response()))
        self.report_repo.update_conversation(g.user_id, conversation_id, conversation)
        self.report_repo.add_report_response_to_history(answer)
        return answer
        
    def answer_query(self, query: str, conversation_id) -> Report:
        with tracer.start_as_current_span("ReportAI.answer_query_with_context") as span:
            result = self.prompt_processor.construct_report_fields(query, conversation_id)
            return result

    def moderate_question(self, input_text: str, max_retries=2, delay_seconds=1) -> bool:
        with tracer.start_as_current_span("ReportAI.moderate_question") as span:
            for attempt in range(max_retries):
                try:
                    response = self.openai_client.moderations.create(input=input_text)
                    response_data = response.results[0]
                    flagged = response_data.flagged
                    span.set_attribute("moderation.flagged", flagged)
                    if flagged is None:
                        span.set_status(trace.status.Status(trace.status.StatusCode.ERROR))
                        raise ValueError("No moderation result returned")
                    return flagged
                except requests.exceptions.RequestException as e:
                    if attempt < max_retries:
                        time.sleep(delay_seconds)
                    else:
                        span.record_exception(e)
                        span.set_status(trace.status.Status(trace.status.StatusCode.ERROR))
                        return False
            return False