from pymongo import ASCENDING
from pymongo.errors import PyMongoError
from opentelemetry import trace
from ..report.models.report import Report
import logging

tracer = trace.get_tracer(__name__)

class MongoService:
    def __init__(self, db):
        self.conversation_collection = db["conversation"]
        self.conversation_history_collection = db["conversation_history"]
        self.report_history_collection = db["report_history"]
    
    # ================================
    # Conversation Cache related methods
    # ================================

    def create_conversation(self, user_id, conversation_id, conversation_obj):
        with tracer.start_as_current_span("MongoService.create_conversation") as span:
            span.set_attribute("user_id", user_id)
            span.set_attribute("conversation_id", conversation_id)
            try:
                result = self.conversation_collection.insert_one({
                    'user_id': user_id, 
                    'conversation_id': conversation_id, 
                    'conversation': conversation_obj
                })
                return result
            except PyMongoError as e:
                logging.error("Error creating session: %s", e)
                span.record_exception(e)
                span.set_status(trace.status.Status(trace.status.StatusCode.ERROR))
                return None

    def get_conversation(self, conversation_id):
        with tracer.start_as_current_span("MongoService.get_conversation") as span:
            span.set_attribute("conversation_id", conversation_id)
            try:
                result = self.conversation_collection.find_one({'conversation_id': conversation_id})
                return result
            except PyMongoError as e:
                logging.error("Error getting session: %s", e)
                span.record_exception(e)
                span.set_status(trace.status.Status(trace.status.StatusCode.ERROR))
                return None

    def update_conversation(self, conversation_id, conversation_obj):
        with tracer.start_as_current_span("MongoService.update_conversation") as span:
            span.set_attribute("conversation_id", conversation_id)
            try:
                result = self.conversation_collection.update_one(
                    {'conversation_id': conversation_id}, 
                    {'$set': {'conversation': conversation_obj}}
                )
                return result
            except PyMongoError as e:
                logging.error("Error updating session: %s", e)
                span.record_exception(e)
                span.set_status(trace.status.Status(trace.status.StatusCode.ERROR))
                return None
        
    def delete_conversation(self, conversation_id):
        with tracer.start_as_current_span("MongoService.delete_conversation") as span:
            span.set_attribute("conversation_id", conversation_id)
            try:
                result = self.conversation_collection.delete_one({'conversation_id': conversation_id})
                return result
            except PyMongoError as e:
                logging.error("Error removing session: %s", e)
                span.record_exception(e)
                span.set_status(trace.status.Status(trace.status.StatusCode.ERROR))
                return None

    # ================================
    # Scoped on User ID Conversation Cache related methods
    # ================================

    def create_scoped_conversation(self, user_id, conversation_id, conversation_obj):
        with tracer.start_as_current_span("MongoService.create_scoped_conversation") as span:
            span.set_attribute("user_id", user_id)
            span.set_attribute("conversation_id", conversation_id)
            try:
                return self.create_conversation(user_id, conversation_id, conversation_obj)
            except PyMongoError as e:
                logging.error("Error creating session: %s", e)
                span.record_exception(e)
                span.set_status(trace.status.Status(trace.status.StatusCode.ERROR))
                return None

    def get_scoped_conversation(self, user_id, conversation_id):
        with tracer.start_as_current_span("MongoService.get_scoped_conversation") as span:
            span.set_attribute("user_id", user_id)
            span.set_attribute("conversation_id", conversation_id)
            try:
                result = self.conversation_collection.find_one({
                    'conversation_id': conversation_id,
                    'user_id': user_id
                })
                return result
            except PyMongoError as e:
                logging.error("Error getting session: %s", e)
                span.record_exception(e)
                span.set_status(trace.status.Status(trace.status.StatusCode.ERROR))
                return None

    def update_scoped_conversation(self, user_id, conversation_id, conversation_obj):
        with tracer.start_as_current_span("MongoService.update_scoped_conversation") as span:
            span.set_attribute("user_id", user_id)
            span.set_attribute("conversation_id", conversation_id)
            try:
                result = self.conversation_collection.update_one(
                    {'conversation_id': conversation_id, 'user_id': user_id}, 
                    {'$set': {'conversation': conversation_obj}}
                )
                return result
            except PyMongoError as e:
                logging.error("Error updating session: %s", e)
                span.record_exception(e)
                span.set_status(trace.status.Status(trace.status.StatusCode.ERROR))
                return None
        
    def delete_scoped_conversation(self, user_id, conversation_id):
        with tracer.start_as_current_span("MongoService.delete_scoped_conversation") as span:
            span.set_attribute("user_id", user_id)
            span.set_attribute("conversation_id", conversation_id)
            try:
                result = self.conversation_collection.delete_one({
                    'conversation_id': conversation_id,
                    'user_id': user_id
                })
                return result
            except PyMongoError as e:
                logging.error("Error removing session: %s", e)
                span.record_exception(e)
                span.set_status(trace.status.Status(trace.status.StatusCode.ERROR))
                return None


    # ===================================
    # Conversation history related methods
    # ===================================

    def add_message(self, message):
        with tracer.start_as_current_span("MongoService.add_message") as span:
            try:
                result = self.conversation_history_collection.insert_one(message.to_dict())
                return result
            except PyMongoError as e:
                logging.error("Error adding message: %s", e)
                span.record_exception(e)
                span.set_status(trace.status.Status(trace.status.StatusCode.ERROR))
                return None

    def get_messages_by_conversation_id(self, conversation_id):
        with tracer.start_as_current_span("MongoService.get_messages_by_conversation_id") as span:
            span.set_attribute("conversation_id", conversation_id)
            try:
                result = list(self.conversation_history_collection.find({'conversation_id': conversation_id}).sort('timestamp', 1))
                return result
            except PyMongoError as e:
                logging.error("Error getting messages by conversation ID: %s", e)
                span.record_exception(e)
                span.set_status(trace.status.Status(trace.status.StatusCode.ERROR))
                return []

    def remove_messages_by_conversation_id(self, conversation_id):
        with tracer.start_as_current_span("MongoService.remove_messages_by_conversation_id") as span:
            span.set_attribute("conversation_id", conversation_id)
            try:
                result = self.conversation_history_collection.delete_many({'conversation_id': conversation_id})
                return result
            except PyMongoError as e:
                logging.error("Error removing messages by conversation ID: %s", e)
                span.record_exception(e)
                span.set_status(trace.status.Status(trace.status.StatusCode.ERROR))
                return None
        
    def update_message_feedback_by_id(self, message_id, vote, feedback):
        with tracer.start_as_current_span("MongoService.update_message_feedback_by_id") as span:
            span.set_attribute("message_id", message_id)
            span.set_attribute("vote", vote)
            span.set_attribute("feedback", feedback)
            try:
                result = self.conversation_history_collection.update_one(
                    {'id': message_id},
                    {"$set": {"feedback": {"vote": vote, "comments": feedback}}}
                )
                return result
            
            except PyMongoError as e:
                logging.error("Error removing messages by conversation ID: %s", e)
                span.record_exception(e)
                span.set_status(trace.status.Status(trace.status.StatusCode.ERROR))
                return None
        
    def update_message_by_conversation_id(self, id, message):
        with tracer.start_as_current_span("MongoService.update_message_by_conversation_id") as span:
            span.set_attribute("conversation_id", id)
            try:
                result = self.conversation_history_collection.update_one(
                    {'id': id},
                    {"$set": message}
                )
                return result
            except PyMongoError as e:
                logging.error("Error updating message by conversation ID: %s", e)
                span.record_exception(e)
                span.set_status(trace.status.Status(trace.status.StatusCode.ERROR))
                return None

    # ===================================
    # Report AI History Related Methods
    # ===================================

    def add_report_history(self, report_model: Report):
        with tracer.start_as_current_span("MongoService.add_report_history") as span:
            try:
                result = self.report_history_collection.insert_one(
                    report_model.to_dict()
                )
                return result
            except PyMongoError as e:
                logging.error("Error adding report history: %s", e)
                span.record_exception(e)
                span.set_status(trace.status.Status(trace.status.StatusCode.ERROR))
                return None
    
    def get_report_history(self, conversation_id):
        with tracer.start_as_current_span("MongoService.get_report_history") as span:
            span.set_attribute("conversation_id", conversation_id)
            try:
                result = list(self.report_history_collection.find_one({'conversation_id': conversation_id}).sort('timestamp', 1))
                return result
            except PyMongoError as e:
                logging.error("Error getting report history: %s", e)
                span.record_exception(e)
                span.set_status(trace.status.Status(trace.status.StatusCode.ERROR))
                return None
            
