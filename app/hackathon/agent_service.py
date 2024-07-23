import json
from opentelemetry import trace
from .report_completions_generator import ReportCompletionsGenerator
from .duckdb_repo import DuckDBRepo
from .prompts import invoicing_system_prompt, invoice_data_question, most_profitable_prompt
from .models.agent_response import AgentResponse, SystemObject
import asyncio
from flask import current_app

tracer = trace.get_tracer(__name__)

class AgentService: 

    def __init__(self, completions_generator: ReportCompletionsGenerator, duckdb_repo: DuckDBRepo):
         self.completions_generator = completions_generator 
         self.duckdb_repo = duckdb_repo
         pass

    def invoicing(self):
        with tracer.start_as_current_span("Agent.invoicing") as span:  

            data = self.duckdb_repo.overdue_invoices(True)
            current_app.logger.info("Overdue invoices checked")
            invoice_data_set = invoice_data_question(data)
            current_app.logger.info(f"{invoice_data_set}")
            messages = [{"role": "system", "content": invoicing_system_prompt()}]
            messages.append({"role" : "user", "content": invoice_data_set})

            response = self.completions_generator.create_gpt_4o_chat_completion(
                    messages=messages,
                    max_tokens=16000,
                    as_json=False
                )

            return AgentResponse(response, SystemObject.Risk)

    def profitable(self):
        with tracer.start_as_current_span("Agent.resource_management") as span:
            current_app.logger.info("time management")
            data = self.duckdb_repo.most_profitable(True)
            time_data_set = f""" Most profitable company Data: {data} """
            current_app.logger.info("time management checked")
            messages = [{"role": "system", "content": most_profitable_prompt()}]
            messages.append({"role" : "user", "content": time_data_set})

            response = self.completions_generator.create_gpt_4o_chat_completion(
                    messages=messages,
                    max_tokens=16000,
                    as_json=False
                )

            return AgentResponse(response, SystemObject.Insight)
        
    def get_invoices(self):
        with tracer.start_as_current_span("Agent.resource_management") as span:
            current_app.logger.info("time management")
            data = self.duckdb_repo.query_invoice(9153845, False)
            serializable_answer = [invoice.to_dict() for invoice in data]
            return AgentResponse(serializable_answer, SystemObject.Invoice)