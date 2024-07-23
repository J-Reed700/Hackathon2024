import tiktoken
import json
import os
from typing import List
from app.services import pinecone_service
from app.openai_client import OpenAIClient



class BasePromptProcessor:
    MAX_SECTION_LEN = 3500
    SEPARATOR = "\n* "
    EMBEDDING_MODEL = "text-embedding-ada-002"
    GPT_MODEL = "gpt-3.5-turbo"
    ENCODING = tiktoken.encoding_for_model(GPT_MODEL)
    SEPARATOR_LENGTH = len(ENCODING.encode(SEPARATOR))

    def __init__(self, api_key: str):
        self.api_key = api_key
        self.openai_client = OpenAIClient.get_client()

    def num_tokens(self, text: str) -> int:
        """Return the number of tokens in a string."""
        return len(self.ENCODING.encode(text))

    def get_embedding(self, text: str, model: str = EMBEDDING_MODEL) -> List[float]:
            """
            Retrieves the embedding for the given text using the specified model.
            """
            result = self.openai_client.embeddings.create(model=model, input=text)
            return result.data[0].embedding

    