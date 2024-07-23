from flask import g
from unittest.mock import MagicMock
from app.chat.chatbt import ChatBT

def test_ask_question(application):
    with application.app_context():
        # Set the required variables in the application context
        g.conversation_id = 'test_conversation_id'
        g.user_id = 'test_user_id'

        # Setup
        question = "What is the weather today?"
        expected_answer = "It's sunny."

        # Mock the OpenAIClient and its ChatCompletion.create method
        mock_openai_client = MagicMock()
        mock_openai_client.ChatCompletion.create.return_value = MagicMock(choices=[MagicMock(message=MagicMock(content=expected_answer))])

        # Mock the chat repository and conversation
        mock_chat_repo = MagicMock()
        mock_conversation = MagicMock()
        mock_chat_repo.get_or_create_conversation.return_value = mock_conversation

        # Create an instance of ChatBT with the mocked dependencies
        chatbt = ChatBT(mock_openai_client, mock_chat_repo)

        # Mock the moderate_question method to avoid real API calls
        chatbt.moderate_question = MagicMock(return_value=False)

        # Mock the create_gpt_4o_chat_completion method to avoid real API calls
        chatbt.completions_generator.create_gpt_4o_chat_completion = MagicMock(return_value=expected_answer)

        # Mock the construct_prompt method to avoid real API calls
        chatbt.prompt_processor.construct_prompt = MagicMock(return_value="mocked_prompt")

        # Action
        answer, message_id = chatbt.ask_question(question)

        # Assert
        assert answer == expected_answer
        mock_conversation.add_message.assert_any_call("user", question)
        mock_conversation.add_message.assert_any_call("assistant", expected_answer)
        mock_chat_repo.add_message_to_history.assert_called_once_with(question, expected_answer, "test_conversation_id", "test_user_id")

def test_ask_question_flagged(application, chatbt):
    # Setup
    question = "Inappropriate question"
    chatbt.moderate_question = MagicMock(return_value=True)
    chatbt.moderate_question.return_value = True

    # Action
    with application.app_context():
        g.conversation_id = 'test_conversation_id'
        g.user_id = 'test_user_id'
        answer, message_id = chatbt.ask_question(question)


    # Assert
    assert "I can't answer that question" in answer
    chatbt.chat_repo.add_message_to_history.assert_called_once()

def test_moderate_question_flagged(chatbt):
    # Setup
    input_text = "Inappropriate content"
    chatbt.openai_client.moderations.create.return_value = MagicMock(results=[MagicMock(flagged=True)])

    # Action
    result = chatbt.moderate_question(input_text)

    # Assert
    assert result == True

def test_moderate_question_not_flagged(chatbt):
    # Setup
    input_text = "Normal question"
    chatbt.openai_client.moderations.create.return_value = MagicMock(results=[MagicMock(flagged=False)])

    # Action
    result = chatbt.moderate_question(input_text)

    # Assert
    assert result == False

def test_reset_conversation_success(chatbt):
    # Setup
    conversation_id = "12345"
    chatbt.chat_repo.reset_conversation.return_value = True

    # Action
    result = chatbt.reset_conversation(conversation_id)

    # Assert
    assert result == True
    chatbt.chat_repo.reset_conversation.assert_called_once_with(conversation_id)

def test_reset_conversation_failure(chatbt):
    # Setup
    conversation_id = "12345"
    chatbt.chat_repo.reset_conversation.return_value = False

    # Action
    result = chatbt.reset_conversation(conversation_id)

    # Assert
    assert result == False