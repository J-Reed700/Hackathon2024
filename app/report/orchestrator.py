import json
from .prompts import orchestrator_system_prompt
from ..models.conversation import Conversation
from .report_completions_generator import ReportCompletionsGenerator
from .models.orchestrator_response import OrchestratorResponse
from opentelemetry import trace

tracer = trace.get_tracer(__name__)

class Orchestrator: 

    def __init__(self, completions_generator: ReportCompletionsGenerator):
         self.completions_generator = completions_generator
         pass

    def process_query(self, query: str, conversation: Conversation) -> OrchestratorResponse:
        with tracer.start_as_current_span("Orchestrator.process_query") as span:
            if conversation.will_hypothetical_conversation_exceed_limit(query):
                    conversation = conversation.get_reduced_conversation_history(query)                

            conversation.add_message("user", query)
            messages = conversation.history

            response = self.completions_generator.create_gpt_4o_chat_completion(
                    messages=messages,
                    max_tokens=16000,
                    as_json=True
                )

            payload = json.loads(response)
            orchestrator_response = OrchestratorResponse(payload['IsValid'], payload['FollowUpQuestion'])

            if not orchestrator_response.is_valid:
                conversation.add_message("assistant", orchestrator_response.follow_up_question())

            return orchestrator_response

