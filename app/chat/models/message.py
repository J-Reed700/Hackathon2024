import uuid
class Message:
    def __init__(self, conversation_id, user_id, user_question, bot_response, timestamp, upvote=None, feedback=None):
        self.id = str(uuid.uuid4())
        self.conversation_id = conversation_id
        self.user_id = user_id
        self.user_question = user_question
        self.bot_response = bot_response
        self.timestamp = timestamp
        self.upvote = upvote
        self.feedback = feedback

    def to_dict(self):
        return {
            'id': self.id,
            'conversation_id': self.conversation_id,
            'user_id': self.user_id,
            'user_question': self.user_question,
            'bot_response': self.bot_response,
            'timestamp': self.timestamp,
            'upvote' : self.upvote,
            'feedback' : self.feedback
        }
