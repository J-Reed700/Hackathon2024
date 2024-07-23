from app.models.conversation import Conversation, ConversationContext
import pytest
from unittest.mock import MagicMock
from app.chat.chat_repo import ChatRepo

@pytest.fixture
def mock_mongo_service():
    """Fixture to mock the MongoService."""
    return MagicMock()

@pytest.fixture
def chat_repo(mock_mongo_service):
    """Fixture to create a ChatRepo instance with a mocked MongoService."""
    return ChatRepo(mock_mongo_service)

def test_reset_conversation(chat_repo, mock_mongo_service):
    # Given
    conversation_id = "12345"

    # Mock
    mock_mongo_service.delete_conversation.return_value = True

    # When
    result = chat_repo.reset_conversation(conversation_id)

    # Then
    assert result == True
    mock_mongo_service.delete_conversation.assert_called_once_with(conversation_id)

def test_get_or_create_conversation_new(chat_repo, mock_mongo_service):
    conversation_id = "54321"
    user_id = "1234"

    mock_mongo_service.get_conversation.return_value = None

    # Execute
    conversation = chat_repo.get_or_create_conversation(conversation_id, user_id)

    # Verify
    assert conversation is not None
    mock_mongo_service.create_conversation.assert_called_once_with(user_id, conversation_id, conversation.history)

def test_get_or_create_conversation_existing(chat_repo, mock_mongo_service):
    conversation_id = "54321"
    user_id = "1234"
    existing_history = ["test"]

    # Simulate an existing conversation
    mock_mongo_service.get_conversation.return_value = {"conversation": existing_history}

    # Execute
    conversation = chat_repo.get_or_create_conversation(conversation_id, user_id)

    # Verify
    assert conversation.history == existing_history
    mock_mongo_service.get_conversation.assert_called_once_with(conversation_id)
    mock_mongo_service.create_conversation.assert_not_called()

def test_update_conversation(chat_repo, mock_mongo_service):
    conversation_id = "1234"
    conversation_obj = Conversation(ConversationContext.ChatBT)
    conversation_obj.history.append("test")

    # Execute
    chat_repo.update_conversation(conversation_id, conversation_obj)

    # Verify
    mock_mongo_service.update_conversation.assert_called_once_with(conversation_id, conversation_obj.history)

def test_add_message_to_history(chat_repo, mock_mongo_service):
    user_question = "How do I reset my password?"
    bot_response = "You can reset your password by clicking 'Forgot Password'."

    # Mock `add_message` to simulate successful addition
    mock_mongo_service.add_message.return_value = True

    # Execute
    result = chat_repo.add_message_to_history(user_question, bot_response, "conversation_id", "user_id")

    # Verify
    assert result != 0
    mock_mongo_service.add_message.assert_called()

def test_get_messages_by_conversation_id(chat_repo, mock_mongo_service):
    conversation_id = "1234"
    mock_mongo_service.get_messages_by_conversation_id.return_value = [{"message": "Hi"}]

    # Execute
    messages = chat_repo.get_messages_by_conversation_id(conversation_id)

    # Verify
    assert len(messages) == 1
    mock_mongo_service.get_messages_by_conversation_id.assert_called_once_with(conversation_id)

def test_update_message_by_id(chat_repo, mock_mongo_service):
    message_id = "1234"
    vote = True
    feedback = "Useful"

    # Execute
    chat_repo.update_message_by_id(message_id, vote, feedback)

    # Verify
    mock_mongo_service.update_message_feedback_by_id.assert_called_once_with(message_id, vote, feedback)

def test_remove_messages_by_conversation_id(chat_repo, mock_mongo_service):
    conversation_id = "1234"

    # Execute
    chat_repo.remove_messages_by_conversation_id(conversation_id)

    # Verify
    mock_mongo_service.remove_messages_by_conversation_id.assert_called_once_with(conversation_id)
