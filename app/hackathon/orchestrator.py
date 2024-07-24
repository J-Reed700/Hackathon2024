import json
from .prompts import orchestrator_system_prompt
from ..models.conversation import Conversation
from .report_completions_generator import ReportCompletionsGenerator
from .agent_service import AgentService
from opentelemetry import trace
from .models.agent_response import AgentResponse
from flask import current_app

tracer = trace.get_tracer(__name__)

class Orchestrator: 

    def __init__(self, agent_service: AgentService):
         self.agent_service = agent_service
         pass

    def pulse_check(self) -> list[AgentResponse]:
        try:
            with tracer.start_as_current_span("Orchestrator.process_query") as span:   
                agent_response_list = []
                invoicing_result = self.agent_service.invoicing()
                time_management_results = self.agent_service.profitable()         
                agent_response_list.append(invoicing_result)
                agent_response_list.append( time_management_results)

                return agent_response_list
        except Exception as e:
            current_app.logger.error(f"Error in pulse_check: {str(e)}", exc_info=True)
            raise    

    def get_invoices(self):
        try:
            invoices = self.agent_service.get_invoices()
            return invoices
        except Exception as e:
            current_app.logger.error(f"Error in pulse_check: {str(e)}", exc_info=True)
            raise  