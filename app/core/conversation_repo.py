from datetime import datetime
from ..models.conversation import Conversation, ConversationContext
from ..services.mongo_service import MongoService
from .base_conversation_repo import BaseConversationRepo

class ConversationRepo(BaseConversationRepo):
    def __init__(self, mongo_service: MongoService, context: ConversationContext):
        self.mongo_service = mongo_service
        self.context = context

    def get_or_create_conversation(self, conversation_id, user_id) -> Conversation:
        conversation_history = self.mongo_service.get_conversation(conversation_id)
        if not conversation_history:
            conversation_object = Conversation(self.context)
            self.mongo_service.create_conversation(user_id, conversation_id, conversation_object.history)
        else: 
            # If conversation exists, use the existing history to initialize the conversation object
            conversation_object = Conversation(self.context)
            conversation_object.history = conversation_history['conversation']
        return conversation_object

    def update_conversation(self, user_id, conversation_id, conversation_obj):
        return self.mongo_service.update_conversation(conversation_id, conversation_obj.history)
    
    def reset_conversation(self, user_id, conversation_id):
        return self.mongo_service.delete_conversation(conversation_id)


class ScopedConversationRepo(BaseConversationRepo):
    def __init__(self, mongo_service: MongoService, context: ConversationContext):
        self.mongo_service = mongo_service
        self.context = context

    def get_or_create_conversation(self, conversation_id, user_id) -> Conversation:
        conversation_history = self.mongo_service.get_scoped_conversation(user_id, conversation_id)
        if not conversation_history:
            conversation_object = Conversation(self.context)
            self.mongo_service.create_scoped_conversation(user_id, conversation_id, conversation_object.history)
        else: 
            conversation_object = Conversation(self.context)
            conversation_object.history = conversation_history['conversation']
        return conversation_object

    def update_conversation(self, user_id, conversation_id, conversation_obj):
        return self.mongo_service.update_scoped_conversation(user_id, conversation_id, conversation_obj.history)
    
    def reset_conversation(self, user_id, conversation_id):
        return self.mongo_service.delete_scoped_conversation(user_id, conversation_id)