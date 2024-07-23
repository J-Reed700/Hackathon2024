from app.models.conversation import Conversation, ConversationContext
from app.chat.exceptions.custom_exceptions import MessageTooLongError
import pytest

def test_conversation_does_not_exceed_max_tokens():
    conversation = Conversation(ConversationContext.ChatBT)
    message = "THIS IS A LONG MESSAGE" * 500

    max_iterations = 1000
    for _ in range(max_iterations):
        if conversation.total_tokens + conversation.calculate_tokens(message) > conversation.max_token_limit:
            break
        conversation.add_message("user", message)
    else:
        raise AssertionError("Potential infinite loop detected.")
    
    # Check that we are below the limit
    assert conversation.get_total_tokens() <= conversation.max_token_limit

    # Attempt to add a message again, presuming the conversation will truncate
    conversation.add_message("user", "Short message")

    # Assert that total tokens are still below the maximum limit
    assert conversation.get_total_tokens() <= conversation.max_token_limit
    
def test_conversation_prevents_messages_too_long():
    conversation = Conversation(ConversationContext.ChatBT)
    message = "THIS IS A LONG MESSAGE" * 10000

    with pytest.raises(MessageTooLongError) as excinfo:
        conversation.add_message("user", message)

    assert "The question is too long." in str(excinfo.value)