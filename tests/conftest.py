from app.chat.chatbt import ChatBT
import pytest
from app import create_app
from unittest.mock import MagicMock, patch

@pytest.fixture()
def application(mock_pinecone_service, mock_mongo_client):
    application = create_app({
        'TESTING': True,
        'DB_NAME': 'your_test_db_name'
    }, pinecone_service=mock_pinecone_service, mongo_client=mock_mongo_client)
    return application

@pytest.fixture()
def client(application):
    return application.test_client()

@pytest.fixture
def mock_chat_repo():
    return MagicMock()

@pytest.fixture
def mock_openai_client():
    return MagicMock()

@pytest.fixture()
def mock_mongo_client():
    with patch('pymongo.MongoClient', autospec=True) as mock:
        yield mock.return_value

@pytest.fixture()
def mock_pinecone_service():
    with patch('app.services.pinecone_service.PineconeService', autospec=True) as mock:
        yield mock.return_value

@pytest.fixture
def chatbt(mock_chat_repo, mock_openai_client):
    api_key = "fake_api_key"
    chatbt = ChatBT(api_key, mock_chat_repo)
    chatbt.openai_client = mock_openai_client
    return chatbt