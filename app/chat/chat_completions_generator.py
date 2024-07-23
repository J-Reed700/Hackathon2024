import time
from .prompts import hyde_create_prompt
from opentelemetry import trace
import tiktoken
import config
from ..core.base_completions_generator import BaseCompletionsGenerator

tracer = trace.get_tracer(__name__)

class ChatCompletionsGenerator(BaseCompletionsGenerator):
    def __init__(self, api_key: str):
        super().__init__(api_key=api_key)    
        self.hyde_max_tokens = 100

    def hyde_create(self, question: str, conversation) -> str:
        with tracer.start_as_current_span(f"{self.__class__.__name__}.hyde_create") as span:
            """
            This method creates a hypothetical "answer" to the question so we can try to match it to an article in the KB
            """
            conversation_history = conversation.flatten_history()
            prompt_text = hyde_create_prompt(question, conversation_history)

            if conversation.will_hypothetical_conversation_exceed_limit(prompt_text):
                conversation = conversation.get_reduced_conversation_history(prompt_text)
                conversation_history = conversation.flatten_history()
                prompt_text = hyde_create_prompt(question, conversation_history)

            # Calculate available tokens for the response
            messages = [{"role": "user", "content": prompt_text}]

            response = self.create_gpt_4o_chat_completion(
                messages=messages,
                max_tokens=self.hyde_max_tokens
            )
            return response
    