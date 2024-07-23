import logging
from dataclasses import asdict
from app.chat.validation.ask_question_validator import validate_question_request
from flask import Blueprint, current_app, jsonify, request, g
from app.chat.validation.validation_error import ValidationError
from app.services.mongo_service import MongoService
from app.chat.chatbt import ChatBT
from app.chat.chat_repo import ChatRepo
from opentelemetry import trace
import json

CORS_ALLOW_ORIGIN="*,*"
CORS_EXPOSE_HEADERS="*,*"
CORS_ALLOW_HEADERS="content-type,*"

bp = Blueprint('chat', __name__, url_prefix='/chat')

#CORS(bp, origins= "http://localhost:64551", supports_credentials= True)

tracer = trace.get_tracer(__name__)
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# TODO - Refactor this.
# There's probably a cleaner way of instantiating ChatBT and passing
# through dependencies
def initialize_chatBT(app):
    config = app.config
    api_key = config.get('API_KEY')
    db = app.mongo_client[config.get('CHATBT_DB_NAME')]
    mongo_service = MongoService(db)
    chat_repo = ChatRepo(mongo_service)
    app.chatBT = ChatBT(api_key, chat_repo)

@bp.route('', methods=['POST', 'OPTIONS'])
#@cross_origin(supports_credentials=True) 
def ask_question():
    """
    Endpoint for asking a question.

    Returns:
        A JSON response containing the answer and message ID.
    """
    with tracer.start_as_current_span("ask_question") as span:
        span.set_attribute("chat.user_id", getattr(g, 'user_id', ''))
        span.set_attribute("chat.conversation_id", getattr(g, 'conversation_id', ''))

        try:
            user_id = request.headers.get("user_id")
            logger.debug(f'User Id: {user_id}')
            if not current_app.config.get("DEBUG"):
                origin = request.headers.get('Origin')

            question_data = request.json

            if 'question' not in question_data:
                return jsonify({'message': 'A question or query is required.'}), 400
            
            question = question_data['question']
            
            if not hasattr(g, 'user_id') or not hasattr(g, 'conversation_id'):
                return jsonify({'message': 'Local context has not been set.'}), 400

            answer, messageid = current_app.chatBT.ask_question(question)

            return jsonify({"Answer": answer, "Id": messageid})
        except Exception as e:
            span.record_exception(e)
            span.set_status(trace.Status(trace.StatusCode.ERROR, description=str(e)))
            return jsonify({"message": "There was an error processing the query."}), 400

@bp.route('/feedback', methods=['POST','OPTIONS'])
#@cross_origin(supports_credentials=True)
def ad_feedback():
    with tracer.start_as_current_span("ad_feedback") as span:
        try:
            if not current_app.config["DEBUG"]:
                origin = request.headers.get('Origin')

            feedback = request.json

            if feedback is None:
                return jsonify({'message': 'feedback is required'}), 400
            
            if not hasattr(g, 'user_id') or not hasattr(g, 'conversation_id'):
                return jsonify({'message': 'Local context has not been set'}), 400

            update_result = current_app.chatBT.add_feedback(feedback)
            
            success = update_result.modified_count > 0

            return jsonify({'Success' : success}), 200
        except Exception as e:
            span.record_exception(e)
            span.set_status(trace.Status(trace.StatusCode.ERROR, description=str(e)))
            return jsonify({'message': 'There was an error processing the feedback'}), 400
    
@bp.route('/reset_session', methods=['POST','OPTIONS'])
#@cross_origin(supports_credentials=True)
def reset_session():
    """
    Endpoint to reset the user's session.
    """
    with tracer.start_as_current_span("reset_session") as span:
        try:
            conversation_id = getattr(g, 'conversation_id', None)
            if conversation_id is None:
                return jsonify({'message': 'No active conversation to reset.'}), 400
            reset_success = current_app.chatBT.reset_conversation(conversation_id)
            if reset_success:
                span.set_attribute("chat.reset_success", True)
                return jsonify({'message': 'Conversation has successfully been reset.'}), 200
            else:
                span.set_attribute("chat.reset_success", False)
                return jsonify({'message': 'Failed to reset conversation in MongoDB.'}), 400
        except Exception as e:
            span.record_exception(e)
            span.set_status(trace.Status(trace.StatusCode.ERROR, description=str(e)))
            return jsonify({'message': 'There was an error resetting the conversation.'}), 400
            
# An endpoint to retrieve the conversation object currently cached for the user
@bp.route('/get_conversation', methods=['GET','OPTIONS'])
#@cross_origin(supports_credentials=True) 
def get_conversation():
    with tracer.start_as_current_span("get_conversation") as span:
        conversation_id = getattr(g, 'conversation_id', None)
        if conversation_id is None:
            return jsonify({'message': 'No active conversation to retrieve.'}), 400
        user_id = getattr(g, 'user_id', None)
        if user_id is None:
            return jsonify({'message': 'No user ID set in local context.'}), 400
        conversation = current_app.chatBT.get_conversation(conversation_id=conversation_id, user_id=user_id)
        conversation_dict = conversation.to_dict()
        conversation_json = json.dumps(conversation_dict)
        return jsonify(conversation_dict)

@bp.route('/test_semantic_retrieval', methods=['POST'])
def test_semantic_retrieval():
    query = request.json.get('question')

    if query is None:
        return jsonify({'message': 'question is required'}), 400

    matches = current_app.chatBT.test_retrieval(query)
    return jsonify({'matches': matches})

@bp.route('/test_hyde', methods=['POST'])
def test_hyde():
    if not current_app.config["DEBUG"]:
        origin = request.headers.get('Origin')

    question = request.json.get('question')

    if question is None:
        return jsonify({'message': 'question is required'}), 400

    hyde_answer = current_app.chatBT.test_hyde(question)
    return jsonify({'Answer': hyde_answer})

@bp.route('/test', methods=['GET'])
def hello(): 
    return "Hello"

@bp.errorhandler(ValidationError)
def handle_validation_error(error):
    with tracer.start_as_current_span("handle_validation_error") as span:
        span.record_exception(error)
        span.set_status(trace.Status(trace.StatusCode.ERROR, description=str(error)))
        
        response = jsonify(error=str(error.message))
        response.status_code = error.status_code if hasattr(error, 'status_code') else 400
        return response

