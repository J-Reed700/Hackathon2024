from dataclasses import asdict
from app.chat.validation.ask_question_validator import validate_question_request
from flask import Blueprint, current_app, jsonify, request, g
from app.chat.validation.validation_error import ValidationError
from app.services.mongo_service import MongoService
from app.report.report_ai import ReportAI
from app.report.report_repo import ReportRepo
from opentelemetry import trace
import json

bp = Blueprint('reportAI', __name__, url_prefix='/report')

tracer = trace.get_tracer(__name__)


# TODO - Refactor this.
# There's probably a cleaner way of instantiating ChatBT and passing
# through dependencies
def initialize_reportAI(app):
    config = app.config
    api_key = config.get('API_KEY')
    db = app.mongo_client[config.get('REPORTAI_DB_NAME')]
    mongo_service = MongoService(db)
    report_repo = ReportRepo(mongo_service)
    app.reportAI = ReportAI(api_key, report_repo)

@bp.route('', methods=['POST', 'OPTIONS'])
def ask_question():
    """
    Endpoint for asking a question.

    Returns:
        A JSON response conatining a list of report fields and view type
    """
    with tracer.start_as_current_span("ask_question") as span:
        span.set_attribute("report.user_id", getattr(g, 'user_id', ''))
        span.set_attribute("report.conversation_id", request.json.get('conversationId'))
        span.set_attribute("report.query" , request.json['query'] )
        try:
            if not current_app.config.get("DEBUG"):
                origin = request.headers.get('Origin')

            question_data = request.json

            if 'query' not in question_data:
                return jsonify({'message': 'A query is required.'}), 400
            
            question = question_data['query']
            conversation_id = question_data.get('conversationId')

            if not hasattr(g, 'user_id') or not hasattr(g, 'conversation_id'):
                return jsonify({'message': 'Local context has not been set.'}), 400

            answer = current_app.reportAI.ask_question(question, conversation_id)

            return jsonify(answer.to_response())
        
        except Exception as e:
            span.record_exception(e)
            span.set_status(trace.Status(trace.StatusCode.ERROR, description=str(e)))
            return jsonify({"message": "There was an error processing the query."}), 400            

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

