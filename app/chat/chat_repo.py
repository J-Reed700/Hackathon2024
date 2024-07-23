from datetime import datetime
from ..models.conversation import ConversationContext
from .models.message import Message
from ..core.conversation_repo import ConversationRepo

class ChatRepo(ConversationRepo):
    def __init__(self, mongo_service):
        super().__init__(mongo_service, ConversationContext.ChatBT) 
        self.mongo_service = mongo_service

    def add_message_to_history(self, user_question, bot_response, conversation_id, user_id):
        message = Message(conversation_id, user_id, user_question, bot_response, datetime.utcnow())
        if self.mongo_service.add_message(message):
            return message.id
        return 0

    def get_messages_by_conversation_id(self, conversation_id):
        return self.mongo_service.get_messages_by_conversation_id(conversation_id)

    def update_message_by_id(self, message_id, vote, feedback):
        return self.mongo_service.update_message_feedback_by_id(message_id, vote, feedback)

    def remove_messages_by_conversation_id(self, conversation_id):
        return self.mongo_service.remove_messages_by_conversation_id(conversation_id)
