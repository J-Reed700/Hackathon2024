import time
import pandas as pd
import requests
from flask import current_app, g
from datetime import timedelta
from datetime import datetime
import threading
from app.openai_client import OpenAIClient
from ..models.conversation import Conversation, ConversationContext
from .prompt_processor import PromptProcessor
from .chat_completions_generator import ChatCompletionsGenerator
from .chat_repo import ChatRepo
from opentelemetry import trace
from config import Config

tracer = trace.get_tracer(__name__)

class ChatBT:
    prompt_processor: PromptProcessor
    completions_generator: PromptProcessor
    embeddings: dict
    dataFrame: pd.DataFrame
    conversations = {}
    COMPLETIONS_API_PARAMS = {
            "temperature": 0.0
    }
    
    def __init__(self, apikey: str, chat_repo: ChatRepo = None):
        self.prompt_processor = PromptProcessor(api_key=apikey)
        self.completions_generator = ChatCompletionsGenerator(api_key=apikey)
        self.cleanup_thread = threading.Thread(target=self.cleanup_conversations, daemon=True)
        self.cleanup_thread.start()
        self.chat_repo = chat_repo
        self.openai_client = OpenAIClient.get_client(Config.MODEL_NAME)

    def alter_completions_parameters(self, temperature: float, max_tokens: int):
        self.prompt_processor.modify_completions_params(temperature, max_tokens)

    def ask_question(self, question) -> tuple[str, int]:
        conversation = self.chat_repo.get_or_create_conversation(g.conversation_id, g.user_id)
        conversation.add_message("user", question)
        flagged = self.moderate_question(question)
        if flagged:
            return self._handle_flagged_question(conversation, question)
        answer = self.answer_query_with_context(conversation, question)
        conversation.add_message("assistant", answer) 
        self.chat_repo.update_conversation(g.user_id, g.conversation_id, conversation)
        messageid = self.chat_repo.add_message_to_history(question, answer, g.conversation_id, g.user_id)
        return answer, messageid
    
    def add_feedback(self, feedback):
        if 'Id' not in feedback or feedback['Id'] is None:
            raise ValueError("Id is required to give feedback")
        return self.chat_repo.update_message_by_id(feedback['Id'], feedback['Upvote'], feedback['Comments'])
    
    def _handle_flagged_question(self, conversation, question) -> tuple[str, int]:
        flagged_message = "I'm sorry, I can't answer that question as our system deemed this potentially inappropriate."
        conversation.add_message("assistant", flagged_message)
        self.chat_repo.update_conversation(g.user_id, g.conversation_id, conversation)
        messageid = self.chat_repo.add_message_to_history(question, flagged_message, g.conversation_id, g.user_id)
        return flagged_message, messageid
    
    def moderate_question(self, input_text: str, max_retries=2, delay_seconds=1) -> bool:
        with tracer.start_as_current_span("ChatBT.moderate_question") as span:
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
        
    def get_conversation(self, conversation_id: str, user_id: str):
        conversation_history = self.chat_repo.get_or_create_conversation(conversation_id, user_id)
        if conversation_history is None:
            return None
        return conversation_history
        
    def reset_conversation(self, conversation_id: str):
        with tracer.start_as_current_span("ChatBT.reset_conversation") as span:
            try:
                if not self.chat_repo.reset_conversation(g.user_id, conversation_id):
                    span.set_status(trace.status.Status(trace.status.StatusCode.ERROR))
                    return False
                return True
            except Exception as e:
                span.record_exception(e)
                return False
        
    def cleanup_conversations(self):
        """
        This method will cleanup stale sessions if they have been idle for more than an hour.
        This thread will run every hour.
        """
        while True:
            current_time = datetime.now()
            for session, conversation in list(self.conversations.items()):
                if (current_time - conversation.last_activity_time) > timedelta(hours=1):
                    del self.conversations[session]
            # Sleep for a while (e.g., one hour) before checking again
            threading.Event().wait(60*60)
        
    def answer_query_with_context(self, conversation, query: str) -> str:
        with tracer.start_as_current_span("ChatBT.answer_query_with_context") as span:
            prompt = self.prompt_processor.construct_prompt(conversation, query)
            response = self.completions_generator.create_gpt_4o_chat_completion(prompt, **self.COMPLETIONS_API_PARAMS)
            return response
    
    def create_new_conversation(self):
        conversation = Conversation(ConversationContext.ChatBT)
        return conversation
    
    def test_console_ask(self, question, conversation) -> str:
        flagged = self.moderate_question(question)
        if flagged:
            return "I'm sorry, I can't answer that question as our system deemed this potentially inappropriate.", None

        use_embeddings = True
        
        conversation.add_message("user", question)

        if use_embeddings:
            print("Using embeddings")
            answer = self.answer_query_with_context(conversation, question)
        else:
            print("Not using embeddings")
            answer = self.get_simple_answer(question)

        conversation.add_message("assistant", answer)

        return answer
    
    def test_retrieval(self, query):
        conversation = self.create_new_conversation()
        hyde_answer = self.prompt_processor.completions_service.hyde_create(question=query, conversation=conversation)
        matched_articles = self.prompt_processor.order_document_sections_by_query_similarity(hyde_answer)
        return matched_articles
    
    def test_hyde(self, query):
        conversation = self.create_new_conversation()
        return self.prompt_processor.completions_service.hyde_create(question=query, conversation=conversation)