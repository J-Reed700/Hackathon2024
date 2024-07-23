import json
from opentelemetry import trace
from .report_completions_generator import ReportCompletionsGenerator
from .duckdb_repo import DuckDBRepo
from .prompts import invoicing_system_prompt, invoice_data_question
from .models.agent_response import AgentResponse, SystemObject
import asyncio

tracer = trace.get_tracer(__name__)

class AgentService: 

    def __init__(self, completions_generator: ReportCompletionsGenerator, duckdb_repo: DuckDBRepo):
         self.completions_generator = completions_generator 
         self.duckdb_repo = duckdb_repo
         pass

    async def invoicing(self):
        with tracer.start_as_current_span("Agent.invoicing") as span:  

            data = self.duckdb_repo.overdue_invoices(True)
            invoice_data_set = invoice_data_question(data)

            messages = [{"role": "system", "content": invoicing_system_prompt()}]
            messages.append({"role" : "user", "content": invoice_data_set})

            response = self.completions_generator.create_gpt_4o_chat_completion(
                    messages=messages,
                    max_tokens=16000,
                    as_json=False
                )

            return AgentResponse(response, SystemObject.Invoice)

    async def time_management(self):
        with tracer.start_as_current_span("Agent.resource_management") as span:

            data = self.duckdb_repo.staffer_time_on_overdue_invoices(True)
            time_data_set = f""" Time Data: {data} """

            messages = [{"role": "system", "content": invoicing_system_prompt()}]
            messages.append({"role" : "user", "content": time_data_set})

            response = self.completions_generator.create_gpt_4o_chat_completion(
                    messages=messages,
                    max_tokens=16000,
                    as_json=False
                )

            return AgentResponse(response, SystemObject.Time)