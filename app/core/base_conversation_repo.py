from abc import ABC, abstractmethod
from ..models.conversation import Conversation
class BaseConversationRepo(ABC):
    @abstractmethod
    def get_or_create_conversation(self, conversation_id, user_id) -> Conversation:
        pass

    @abstractmethod
    def update_conversation(self, user_id, conversation_id, conversation_obj):
        pass

    @abstractmethod
    def reset_conversation(self, user_id, conversation_id):
        pass