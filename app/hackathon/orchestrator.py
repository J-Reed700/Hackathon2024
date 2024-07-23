import json
from .prompts import orchestrator_system_prompt
from ..models.conversation import Conversation
from .report_completions_generator import ReportCompletionsGenerator
from .agent_service import AgentService
from opentelemetry import trace
from .models.agent_response import AgentResponse
import asyncio

tracer = trace.get_tracer(__name__)

class Orchestrator: 

    def __init__(self, agent_service: AgentService):
         self.agent_service = agent_service
         pass

    async def pulse_check(self) -> list[AgentResponse]:
        with tracer.start_as_current_span("Orchestrator.process_query") as span:   
            agent_response_list = []
            invoicing_result, time_management_result = await asyncio.gather(
                self.agent_service.invoicing(),
                self.agent_service.time_management()
            )          
            
            agent_response_list.append(invoicing_result)
            agent_response_list.append( time_management_result)

            return agent_response_list
