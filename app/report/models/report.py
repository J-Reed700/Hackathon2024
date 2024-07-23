import uuid
from datetime import datetime, timezone

class Report:
    def __init__(self, conversation_id, user_id, user_question, report_reponse, is_valid, follow_up_question):
        self.id = str(uuid.uuid4())
        self.conversation_id = conversation_id
        self.user_id = user_id
        self.user_question = user_question
        self.report_response = report_reponse
        self.timestamp = datetime.now(timezone.utc)
        self.is_valid = is_valid
        self.follow_up_question = follow_up_question

    def to_dict(self):
        return {
            'id': self.id,
            'conversation_id': self.conversation_id,
            'user_id': self.user_id,
            'user_question': self.user_question,
            'report_response': self.report_response,
            'timestamp': self.timestamp,
        }

    def to_response(self):
        response = {
            "conversationId": self.conversation_id,
            "isSuccess": self.is_valid,
            "data": {
                "viewType": self.report_response["ViewType"] if self.is_valid else "",
                "reportFields": self.report_response["ReportFields"] if self.is_valid else [],
                "followUpQuestion": self.follow_up_question if not self.is_valid else ""
            }
        }
        return response
        
