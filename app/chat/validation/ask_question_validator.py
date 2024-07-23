from flask import request, jsonify
from functools import wraps
from app.chat.validation.validation_error import ValidationError

def validate_question_request(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        max_question_length = 10000
        question_data = request.get_json(silent=True) or {}
        question = question_data.get('question')
        
        if question is None:
            raise ValidationError('Question is required')
        if len(question) > max_question_length:
            raise ValidationError(f'Question exceeds the maximum allowed length of {max_question_length} characters')
        
        return f(*args, **kwargs)
    
    return decorated_function