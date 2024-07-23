import tiktoken
from typing import List
from .chat_completions_generator import ChatCompletionsGenerator
from app.services import pinecone_service
from app.openai_client import OpenAIClient
from ..core.base_prompt_processor import BasePromptProcessor
from flask import current_app

class PromptProcessor(BasePromptProcessor):
    MAX_SECTION_LEN = 3500
    SEPARATOR = "\n* "
    EMBEDDING_MODEL = "text-embedding-ada-002"
    GPT_MODEL = "gpt-3.5-turbo"

    def __init__(self, api_key: str):
        super().__init__(api_key)
        self.openai_client = OpenAIClient.get_client()
        self.completions_service = ChatCompletionsGenerator(api_key)


    def order_document_sections_by_query_similarity(self, query: str, similarity_threshold=0.8, max_documents=20) -> list:
        """
        Find the query embedding for the supplied query, and compare it against all of the document embeddings
        in the Pinecone index to find the most relevant sections. Return the list of document sections, sorted by relevance
        in descending order, including metadata such as article title, content, updated_at, and URL.
        """
        query_vector = self.get_embedding(query)
        matches = []
        results = current_app.pinecone_service.query_chat(query_vector, max_documents)

        for match in results["matches"]:
            similarity_score = match["score"]
            if similarity_score < similarity_threshold:
                print(f"Similarity score {similarity_score} is below threshold {similarity_threshold}. Skipping.")
                continue
            
            # Extract metadata
            metadata = match.get('metadata', {})
            article_title = metadata.get('article_title', '')
            content = metadata.get('content', '')
            updated_at = metadata.get('updated_at', '')
            url = metadata.get('url', '')

            match_data = {
                'id': match['id'],
                'score': similarity_score,
                'article_title': article_title,
                'content': content,
                'updated_at': updated_at,
                'url': url
            }
            matches.append(match_data)

        # Sort matches by score
        matches.sort(key=lambda x: x['score'], reverse=True)

        return matches


    def construct_prompt(self, conversation, question: str):
        """
        Constructs a prompt for the conversation based on the given question.
        """
        hypothetical_answer = self.completions_service.hyde_create(question, conversation)
        most_relevant_document_sections = self.order_document_sections_by_query_similarity(hypothetical_answer)

        chosen_sections = []
        chosen_sections_len = 0

        # Use the conversation's method to calculate the token count for the system prompt and question
        system_prompt_tokens = conversation.calculate_tokens(conversation.history[0]["content"] if conversation.history else "")
        question_tokens = conversation.calculate_tokens(question)
        context_setup_tokens = conversation.calculate_tokens("1. CONTEXT:\n. 2. USER QUESTION: {}. 3. ANSWER: ".format(question))
        
        # Calculate the available token space
        used_tokens = conversation.get_total_tokens()
        available_tokens = self.MAX_SECTION_LEN - (used_tokens + system_prompt_tokens + question_tokens + context_setup_tokens)

        for match_data in most_relevant_document_sections:
            section_text = match_data['content']
            section_url = match_data['url']
            document_section_tokens = conversation.calculate_tokens(section_text + self.SEPARATOR)

            if chosen_sections_len + document_section_tokens > available_tokens:
                break

            chosen_sections_len += document_section_tokens
            section_text_clean = section_text.replace('\n', ' ')
            chosen_sections.append(f"{self.SEPARATOR}{section_text_clean} (URL: {section_url})")

        context = f"1. CONTEXT:\n{''.join(chosen_sections)}. \n2. USER QUESTION: {question}. 3. ANSWER: "
        messages = conversation.history.copy()
        messages.append({"role": "user", "content": context})
        return messages




