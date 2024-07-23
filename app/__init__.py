from app.services.pinecone_service import PineconeService
from flask import Flask, jsonify, Response, session, g, request
from flask_session import Session
from pymongo import MongoClient
from flask_cors import CORS
from .chat.chat_repo import ChatRepo
from .services.mongo_service import MongoService  
import os
from . import utils
from . import intrumentation

def create_app(test_config=None, pinecone_service=None, mongo_client=None):
    app = Flask(__name__)
    intrumentation.setup_opentelemetry(app)

    CORS(app, origins= "http://localhost:5173/", supports_credentials= True)

    app.config['CORS_HEADERS'] = 'Content-Type'

    
    # Initialize PineconeService and MongoClient and attach to app
    app.pinecone_service = pinecone_service or PineconeService()
    app.mongo_client = mongo_client or MongoClient(os.environ.get('CONN_STRING'))

    @app.before_request
    def load_user():

        if request.method != "OPTIONS":

            conversation_id = session.get("conversation_id")
            user_id = request.headers.get('userid')

            # Ensure case-insensitive retrieval of user_id
            if not user_id:
                user_id = request.headers.get("UserId") or request.headers.get("USERID")

            if not conversation_id:
                conversation_id = utils.generate_new_user_id()
                session["conversation_id"] = conversation_id

            #Add the required variables to local context 
            g.user_id = user_id
            g.conversation_id = conversation_id


    run_mode = os.environ.get('RUN_MODE', 'dev')

    if test_config is None:
        if run_mode == 'local':
            app.config.from_object('config.LocalConfig')
        elif run_mode == 'dev':
            app.config.from_object('config.DevelopmentConfig')
        elif run_mode == 'prod':
            app.config.from_object('config.ProductionConfig')
        else:
            app.config.from_object('config.DevelopmentConfig')
    else:
        # load the test config if passed in
        app.config.update(test_config)
    
    app.config['SESSION_COOKIE_NAME'] = 'BTAISession'
    # Set the session type to mongodb
    app.config['SESSION_TYPE'] = 'mongodb'
    app.config['SESSION_PERMANENT'] = True
    app.config['SESSION_PERMANENT_SESSION_LIFETIME'] = 86400 # 1 day
    app.config['SESSION_USE_SIGNER'] = True
    app.config['SESSION_KEY_PREFIX'] = 'web_session:'
    app.config['SESSION_MONGODB'] = app.mongo_client
    app.config['SESSION_MONGODB_DB'] = app.config.get('CHATBT_DB_NAME')
    app.config['SESSION_MONGODB_COLLECT'] = "sessions"
    app.config["SESSION_COOKIE_SAMESITE"] = "None"
    app.config["SESSION_COOKIE_SECURE"] = True

    Session(app)
    
    from .chat.views import bp as chat_bp
    app.register_blueprint(chat_bp)
    
    from .chat.views import initialize_chatBT
    initialize_chatBT(app)

    from .report.views import bp as report_bp
    app.register_blueprint(report_bp)

    from .report.views import initialize_reportAI
    initialize_reportAI(app)

    from .hackathon.views import bp as report_bp
    app.register_blueprint(report_bp)

    from .hackathon.views import initialize_consultantAI
    initialize_consultantAI(app)

    @app.route("/healthz", methods=['GET'])
    def health_check():
        return jsonify({'status': 'ok'})

    @app.route("/readyz", methods=['GET'])
    def ready_check():
        try:
            database_check = app.mongo_client['chatbt'].command("ping")
            vector_database_check = app.pinecone_service.describe_index_stats()

            if not database_check:
                return jsonify({'status': 'Database not available'}), 503
            if not vector_database_check:
                return jsonify({'status': 'Vector database not available'}), 503
    
            return jsonify({'status': 'ok'})
        except Exception as e:
            return jsonify({'status': 'error', 'message': str(e)}), 503

    # Handle 404s with custom JSON response
    @app.errorhandler(404)
    def route_not_found(e):
        return jsonify({'message': 'not found'}), 404


    return app
