import time
from .prompts import invoicing_system_prompt
from opentelemetry import trace
import tiktoken
from . import prompts
import config
from ..core.base_completions_generator import BaseCompletionsGenerator

tracer = trace.get_tracer(__name__)

class ReportCompletionsGenerator(BaseCompletionsGenerator):
    def __init__(self, api_key: str):
        super().__init__(api_key=api_key)    
        self.hyde_max_tokens = 100


    def hyde_create(self, question: str) -> str:
        with tracer.start_as_current_span(f"{self.__class__.__name__}.hyde_create") as span:
            """
            This method creates a hypothetical "answer" to the question to infer report columns necessary
            """
            prompt_text = invoicing_system_prompt()

            messages = [{"role": "system", "content": prompt_text}]
            messages.append({"role" : "user", "content": question})

            response = self.create_gpt_4o_chat_completion(
                messages=messages,
                max_tokens=self.hyde_max_tokens,
                as_json=True
            )
            return response
    