from datetime import datetime, timezone
from ..chat.exceptions.custom_exceptions import MessageTooLongError
from ..chat.prompts import opening_system_prompt
from ..report.prompts import orchestrator_system_prompt
from ..models.conversation_context import ConversationContext
import tiktoken
import copy

class Conversation:
    def __init__(self, context: ConversationContext):
        self.MODEL_MAX_TOKENS = 16000
        self.MODEL = "gpt-3.5-turbo"
        self.MODEL_MAX_OUTPUT_TOKENS = 4096
        self.TOKEN_BUFFER = 100
        self.max_token_limit = self.MODEL_MAX_TOKENS - self.MODEL_MAX_OUTPUT_TOKENS - self.TOKEN_BUFFER
        self.history = []
        self.total_tokens = 0
        self.tokenizer = tiktoken.encoding_for_model(self.MODEL)
        self.updated_at = datetime.now(timezone.utc)
        if context == ConversationContext.ChatBT:
            self.add_message("system", opening_system_prompt())
        if context == ConversationContext.ReportAI:
            self.add_message("system",  orchestrator_system_prompt())

    def add_message(self, role: str, message: str):
        tokens_in_message = self.calculate_tokens(message)
        new_total_tokens = self.total_tokens + tokens_in_message
        
        if tokens_in_message > self.max_token_limit:
            raise MessageTooLongError()
        
        if new_total_tokens > self.max_token_limit:
            self.manage_conversation_size()
            new_total_tokens = self.total_tokens + tokens_in_message

        self.history.append({"role": role, "content": message})
        self.total_tokens = new_total_tokens
        self.updated_at = datetime.now(timezone.utc)

    def calculate_tokens(self, message: str) -> int:
        return len(self.tokenizer.encode(message))

    def manage_conversation_size(self):
        while self.total_tokens > self.max_token_limit and len(self.history) > 1:
            self.pop_earliest_message()
   

    def get_total_tokens(self):
        return self.total_tokens

    def conversation_will_exceed_token_limit(self) -> bool:
        return self.total_tokens > self.max_token_limit

    def pop_earliest_message(self):
        """
        Remove the second earliest message from the conversation history and update the total token count.
        """
        if len(self.history) > 1:
            removed_message = self.history.pop(1)
            removed_tokens = self.calculate_tokens(removed_message["content"])
            self.total_tokens -= removed_tokens
            self.updated_at = datetime.now(timezone.utc)

    def is_idle(self, threshold):
        """
        Checks to see if the given conversation has been idle
        """
        return datetime.now(timezone.utc) - self.updated_at > threshold

    def to_dict(self):
        return {
            "history": [message for message in self.history if message["role"] != "system"],
        }
    
    def will_hypothetical_conversation_exceed_limit(self, message) -> bool:
        message_length = len(self.tokenizer.encode(message))
        return message_length > self.max_token_limit

    def get_reduced_conversation_history(self, message):
        conversation = copy.deepcopy(self.history)
        message_length = len(self.tokenizer.encode(message))
        while (message_length) > conversation.max_token_limit and len(conversation.history) > 1:
            conversation.pop_earliest_message()
        return conversation

    def flatten_history(self):
        """
        Concatenate all messages from the conversation history into a single string,
        formatted to include the role and content of each message.
        """
        # Concatenate role and content with appropriate labeling and formatting
        return " ".join([f"Role: {message['role']} Content: {message['content']}" for message in self.history])
    
    def is_new_conversation(self):
        """
        Check if the conversation is new (no messages other than system messages).
        """
        return all(message['role'] == 'system' for message in self.history)
