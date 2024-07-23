import uuid
from datetime import datetime, timezone

class OrchestratorResponse:
    def __init__(self, is_valid: bool, follow_up_question: str):
        self.id = str(uuid.uuid4())
        self.is_valid = is_valid
        self.question = follow_up_question
        self.timestamp = datetime.now(timezone.utc)

    def is_success(self):
        return self.is_valid

    def follow_up_question(self):
        return self.question
        