from dataclasses import asdict
from app.chat.validation.ask_question_validator import validate_question_request
from flask import Blueprint, current_app, jsonify, request, g
from flask_cors import CORS, cross_origin
from app.chat.validation.validation_error import ValidationError
from app.services.mongo_service import MongoService
from .consultant_ai import ConsultantAI
from app.report.report_repo import ReportRepo
from opentelemetry import trace
from concurrent.futures import ThreadPoolExecutor

executor = ThreadPoolExecutor(max_workers=3)


bp = Blueprint('consultantAI', __name__, url_prefix='/consultant')

CORS(bp, origins= "http://localhost:5173/", supports_credentials=True)

tracer = trace.get_tracer(__name__)


# TODO - Refactor this.
# There's probably a cleaner way of instantiating ChatBT and passing
# through dependencies
def initialize_consultantAI(app):
    config = app.config
    api_key = config.get('API_KEY')
    db = app.mongo_client[config.get('REPORTAI_DB_NAME')]
    app.consultantAI = ConsultantAI(api_key)

@bp.route('', methods=['GET', 'OPTIONS'])
@cross_origin(supports_credentials=True) 
def pulse_check():
    """
    Endpoint for getting a pulse check.
    
    Returns:
        A JSON response containing a list of AgentResponses
    """
    with tracer.start_as_current_span("ask_question") as span:
        try:
            current_app.logger.info("Received pulse check request")
            if not hasattr(current_app, 'consultantAI'):
                current_app.logger.error("consultantAI not initialized")
                return jsonify({"error": "Service not initialized"}), 500
            
            current_app.logger.info("Calling consultantAI.pulse_check()")
            answer = current_app.consultantAI.pulse_check()
            # Convert AgentResponse objects to dictionaries
            serializable_answer = [resp.to_dict() for resp in answer]
            
            current_app.logger.info(f"Received answer: {serializable_answer}")
            return jsonify(serializable_answer)
        
        except Exception as e:
            current_app.logger.error(f"Error in pulse_check: {str(e)}", exc_info=True)
            span.record_exception(e)
            span.set_status(trace.Status(trace.StatusCode.ERROR, description=str(e)))
            return jsonify({"error": "There was an error processing the query."}), 500
        
@bp.route('/invoices', methods=['GET', 'OPTIONS'])
@cross_origin(supports_credentials=True) 
def get_invoices():
    """
    Endpoint for getting invoices.
    
    Returns:
        A JSON response containing a list of AgentResponses
    """
    with tracer.start_as_current_span("ask_question") as span:
        try:
            current_app.logger.info("Received pulse check request")
            if not hasattr(current_app, 'consultantAI'):
                current_app.logger.error("consultantAI not initialized")
                return jsonify({"error": "Service not initialized"}), 500
            
            current_app.logger.info("Calling consultantAI.pulse_check()")
            answer = current_app.consultantAI.get_invoices()
            # Convert AgentResponse objects to dictionaries
            serializable_answer = answer.to_dict()
            
            current_app.logger.info(f"Received answer: {serializable_answer}")
            return jsonify(serializable_answer)
        
        except Exception as e:
            current_app.logger.error(f"Error in pulse_check: {str(e)}", exc_info=True)
            span.record_exception(e)
            span.set_status(trace.Status(trace.StatusCode.ERROR, description=str(e)))
            return jsonify({"error": "There was an error processing the query."}), 500
        

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

