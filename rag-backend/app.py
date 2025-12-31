"""
Flask API for Ragini Bhayana Portfolio RAG System
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os
from rag_engine import RAGEngine

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for frontend

# Initialize RAG engine
rag_engine = None

def init_rag_engine():
    """Initialize RAG engine and load knowledge base"""
    global rag_engine
    try:
        rag_engine = RAGEngine()
        
        # Load knowledge base from resume data
        data_file = os.path.join(os.path.dirname(__file__), '..', 'data', 'resume-data.json')
        rag_engine.load_knowledge_base(data_file)
        
        print("RAG engine initialized successfully")
        return True
    except Exception as e:
        print(f"Error initializing RAG engine: {e}")
        return False

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'rag_initialized': rag_engine is not None
    })

@app.route('/api/chat', methods=['POST'])
def chat():
    """Main chat endpoint"""
    try:
        # Get message from request
        data = request.get_json()
        message = data.get('message', '').strip()
        
        if not message:
            return jsonify({
                'error': 'Message is required'
            }), 400
        
        # Check if RAG engine is initialized
        if rag_engine is None:
            return jsonify({
                'error': 'RAG engine not initialized'
            }), 500
        
        # Query RAG engine
        result = rag_engine.query(message)
        
        return jsonify({
            'response': result['answer'],
            'sources': result.get('sources', [])
        })
        
    except Exception as e:
        print(f"Error in chat endpoint: {e}")
        return jsonify({
            'error': 'Internal server error',
            'message': str(e)
        }), 500

@app.route('/api/reset', methods=['POST'])
def reset_conversation():
    """Reset conversation history"""
    try:
        if rag_engine:
            rag_engine.reset_conversation()
            return jsonify({
                'message': 'Conversation reset successfully'
            })
        else:
            return jsonify({
                'error': 'RAG engine not initialized'
            }), 500
    except Exception as e:
        print(f"Error resetting conversation: {e}")
        return jsonify({
            'error': 'Internal server error'
        }), 500

@app.route('/', methods=['GET'])
def index():
    """Root endpoint"""
    return jsonify({
        'message': 'Ragini Bhayana Portfolio RAG API',
        'version': '1.0.0',
        'endpoints': {
            'health': '/api/health',
            'chat': '/api/chat (POST)',
            'reset': '/api/reset (POST)'
        }
    })

if __name__ == '__main__':
    # Initialize RAG engine on startup
    print("Initializing RAG engine...")
    if init_rag_engine():
        print("Starting Flask server...")
        app.run(
            host='0.0.0.0',
            port=int(os.getenv('PORT', 5000)),
            debug=os.getenv('DEBUG', 'False').lower() == 'true'
        )
    else:
        print("Failed to initialize RAG engine. Please check your configuration.")
