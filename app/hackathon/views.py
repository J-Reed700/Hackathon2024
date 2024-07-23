from dataclasses import asdict
from app.chat.validation.ask_question_validator import validate_question_request
from flask import Blueprint, current_app, jsonify, request, g
from app.chat.validation.validation_error import ValidationError
from app.services.mongo_service import MongoService
from .consultant_ai import ConsultantAI
from app.report.report_repo import ReportRepo
from opentelemetry import trace
from concurrent.futures import ThreadPoolExecutor
import asyncio

executor = ThreadPoolExecutor(max_workers=3)


bp = Blueprint('consultantAI', __name__, url_prefix='/consultant')

tracer = trace.get_tracer(__name__)


# TODO - Refactor this.
# There's probably a cleaner way of instantiating ChatBT and passing
# through dependencies
def initialize_consultantAI(app):
    config = app.config
    api_key = config.get('API_KEY')
    db = app.mongo_client[config.get('REPORTAI_DB_NAME')]
    app.consultantAI = ConsultantAI(api_key)

@bp.route('', methods=['POST', 'OPTIONS'])
async def pulse_check():
    """
    Endpoint for getting a pulse check.

    Returns:
        A JSON response conatining a list of AgentResponses
    """
    with tracer.start_as_current_span("ask_question") as span:
        try:
            answer = await current_app.consultantAI.pulse_check()
            return jsonify(answer)      
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

