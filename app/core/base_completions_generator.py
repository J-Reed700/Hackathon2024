import time
from app.openai_client import OpenAIClient
from opentelemetry import trace
import tiktoken
import anthropic
from groq import Groq
import config

tracer = trace.get_tracer(__name__)

class BaseCompletionsGenerator:
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.tokenizer = tiktoken.get_encoding('cl100k_base')
        self.MODEL_CONFIG = {
            'claude-3-sonnet-20240229': {'max_tokens': 8192, 'max_output_tokens': 4096},
            'mixtral-8x7b-32768': {'max_tokens': 32000, 'max_output_tokens': 4096},
            'llama3-70b-8192': {'max_tokens': 8192, 'max_output_tokens': 4096},
            'gpt-3.5-turbo': {'max_tokens': 16000, 'max_output_tokens': 4096},
            'gpt-4o': {'max_tokens': 128000, 'max_output_tokens': 2048},
        }
        self.extra_token_safety_buffer = 20
        self.provider = config.Config.AI_PROVIDER
        

    def create_chat_completion(self, model_name, messages, max_retries=3, delay_seconds=3, as_json=False, **params):
        with tracer.start_as_current_span(f"{self.__class__.__name__}.create_chat_completion") as span:
            try:
                client = self.get_client(self.provider)
                available_tokens_for_response = self.calculate_available_tokens_for_response(messages, model_name)
                params['max_tokens'] = available_tokens_for_response
                return self.retry_with_delay(client, messages, params, max_retries, delay_seconds, model_name, as_json)
            except Exception as e:
                span.record_exception(e)
                span.set_status(trace.status.Status(trace.status.StatusCode.ERROR))
                raise e

    def retry_with_delay(self, client, messages, params, max_retries, delay_seconds, model_name, as_json=False):
        with tracer.start_as_current_span(f"{self.__class__.__name__}.retry_with_delay") as span:
            for attempt in range(max_retries):
                try:
                    if not as_json:
                        response = client.chat.completions.create(model=model_name, messages=messages, **params)
                    else:
                        response = client.chat.completions.create(model=model_name, messages=messages, response_format={"type": "json_object"}, **params)
                    if not response:
                        span.set_status(trace.status.Status(trace.status.StatusCode.ERROR))
                        raise ValueError("Empty response from AI provider")
                    return response.choices[0].message.content
                except Exception as e:
                    if attempt < max_retries - 1:
                        time.sleep(delay_seconds)
                    else:
                        span.set_status(trace.status.Status(trace.status.StatusCode.ERROR))
                        raise

    def get_client(self, provider=None):
        if provider is None:
            provider = self.provider
        if provider == 'openai':
            return OpenAIClient.get_client(config.Config.MODEL_NAME)
        elif provider == 'anthropic':
            return anthropic.Anthropic(api_key=config.Config.CLAUDE_API_KEY)
        elif provider == 'groq':
            return Groq(api_key=config.Config.GROQ_API_KEY)
        else:
            raise ValueError(f"AI Provider {provider} not recognized")

    def calculate_tokens(self, text: str) -> int:
        return len(self.tokenizer.encode(text))

    def calculate_available_tokens_for_response(self, messages: list, model_name: str) -> int:
        total_prompt_tokens = sum(self.calculate_tokens(message['content']) for message in messages)
        model_config = self.MODEL_CONFIG.get(model_name, {})
        max_tokens = model_config.get('max_tokens')
        max_output_tokens = model_config.get('max_output_tokens')

        available_tokens_for_response = max_tokens - total_prompt_tokens - self.extra_token_safety_buffer
        available_tokens_for_response = max(0, min(available_tokens_for_response, max_output_tokens))

        return available_tokens_for_response
    
    def create_gpt_4o_chat_completion(self, messages: list, max_retries=3, delay_seconds=3, as_json=False, **params):
        with tracer.start_as_current_span("CompletionsGenerator.create_gpt_4o_chat_completion") as span:
            return self.create_chat_completion('gpt-4o', messages, max_retries, delay_seconds, as_json, **params)

    def create_gpt_35_chat_completion(self, messages: list, max_retries=3, delay_seconds=3, as_json=False, **params):
        with tracer.start_as_current_span("CompletionsGenerator.create_gpt_35_chat_completion") as span:
            return self.create_chat_completion('gpt-3.5-turbo', messages, max_retries, delay_seconds, as_json, **params)
                    
    def create_claude_chat_completion(self, messages: list, max_retries=3, delay_seconds=3, **params):
        with tracer.start_as_current_span("CompletionsGenerator.create_claude_chat_completion") as span:
            return self.create_chat_completion('claude-3-sonnet-20240229', messages, max_retries, delay_seconds, **params)
                    
    def create_mixtral8x7b_chat_completion(self, messages: list, max_retries=3, delay_seconds=3, **params):
        with tracer.start_as_current_span("CompletionsGenerator.create_mixtral8x7b_chat_completion") as span:
            return self.create_chat_completion('mixtral-8x7b-32768', messages, max_retries, delay_seconds, **params)
                    
    def create_llama38b_chat_completion(self, messages: list, max_retries=3, delay_seconds=3, **params):
        with tracer.start_as_current_span("CompletionsGenerator.llama38b_chat_completion") as span:
            return self.create_chat_completion('llama3-70b-8192', messages, max_retries, delay_seconds, **params)