import json
import os
from flask import g, current_app
from typing import List
from .report_completions_generator import ReportCompletionsGenerator
from app.services.pinecone_service import PineconeService
from app.openai_client import OpenAIClient
from ..core.base_prompt_processor import BasePromptProcessor
from .models.ViewTypeMapping import ViewTypeMapping
from .models.report import Report

class PromptProcessor(BasePromptProcessor):
    MAX_SECTION_LEN = 3500
    SEPARATOR = "\n* "
    EMBEDDING_MODEL = "text-embedding-ada-002"
    GPT_MODEL = "gpt-3.5-turbo"

    def __init__(self, api_key: str):
        super().__init__(api_key)
        self.api_key = api_key
        self.openai_client = OpenAIClient.get_client()
        self.completions_service = ReportCompletionsGenerator(api_key)

    def order_document_sections_by_query_similarity(self, query: str, similarity_threshold=0.87, max_documents=20) -> list:
        """
        Find the query embedding for the supplied query, and compare it against all of the document embeddings
        in the Pinecone index to find the most relevant sections. Return the list of document sections, sorted by relevance
        in descending order, including metadata such as article title, content, updated_at, and URL.
        """
        query_vector = self.get_embedding(query)
        matches = []
        results = current_app.pinecone_service.query_report(query_vector, max_documents)
        try:
            for match in results["matches"]:
                similarity_score = match["score"]
                if similarity_score < similarity_threshold:
                    print(f"Similarity score {similarity_score} is below threshold {similarity_threshold}. Skipping.")
                    continue
                # Extract metadata
                metadata = match.get('metadata', {})
                field_name = metadata.get('ReportFieldName', '')
                cat_name = metadata.get('CategoryName', '')
                description = metadata.get('ReportDescription', '')
                viewtype = metadata.get('ViewType', '')

                match_data = {
                    'VectorId': match['id'],
                    'FieldName': field_name,
                    'CategoryName': cat_name,
                    'Description': description,
                    'ViewType': viewtype,
                    "Score": match["score"]
                }
                   
                matches.append(match_data)

            matches.sort(key=lambda x: x['Score'], reverse=True)
        except Exception as e:
            print(f"An error occurred while writing to the log file: {e}")

        return matches


    def construct_report_fields(self, question: str, conversation_id: str) -> Report:
        """
        Constructs a prompt for the conversation based on the given question.
        """
        hypothetical_answer = self.completions_service.hyde_create(question)
        report_fields = json.loads(hypothetical_answer)
        all_hypothetical_fields = []
        report_field_list = []
        unique_fields = []

        for field, description in report_fields["Fields"].items():

            most_relevant_document_sections = self.order_document_sections_by_query_similarity(f"Field Name: {field} Description: {description}")
            all_hypothetical_fields.append(most_relevant_document_sections)

        flattened_hypothetical_fields = [item for sublist in all_hypothetical_fields for item in sublist]
        for report_field in flattened_hypothetical_fields:
            if report_field["ViewType"] in ViewTypeMapping[report_fields["ViewType"]]:
                if report_field["FieldName"] not in unique_fields:
                    report_field_list.append(report_field["FieldName"])
                    unique_fields.append(report_field["FieldName"])

        result = {
            "ReportFields": list(report_field_list), 
            "ViewType": report_fields["ViewType"]
        }
        report = Report(conversation_id, 
                        getattr(g, 'user_id', ''), 
                        question, 
                        result,
                        True, 
                        None)

        return report
