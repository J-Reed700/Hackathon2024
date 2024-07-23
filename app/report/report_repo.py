from datetime import datetime
from ..models.conversation import ConversationContext
from .models.report import Report
from ..core.conversation_repo import ScopedConversationRepo

class ReportRepo(ScopedConversationRepo):
    def __init__(self, mongo_service):
        super().__init__(mongo_service, ConversationContext.ReportAI) 
        self.mongo_service = mongo_service

    def add_report_response_to_history(self, report: Report):
        if self.mongo_service.add_report_history(report):
            return report.id
        return 0

    def get_report_responses_by_conversation_id(self, conversation_id):
        return self.mongo_service.get_report_history(conversation_id)

