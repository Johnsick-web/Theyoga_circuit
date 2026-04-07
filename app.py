import os
from flask import Flask, request, jsonify, send_from_directory
from pymongo import MongoClient
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables (useful for local testing)
load_dotenv()

app = Flask(__name__)

# Set up MongoDB
MONGO_URI = os.environ.get("MONGO_URI")
client = None
users_collection = None

if MONGO_URI:
    try:
        client = MongoClient(MONGO_URI)
        db = client.yogacircuit  # Create/Use 'yogacircuit' database
        users_collection = db.users # Create/Use 'users' collection
        print("Connected to MongoDB!")
    except Exception as e:
        print("Error connecting to MongoDB:", e)
else:
    print("WARNING: No MONGO_URI provided. Running in testing mode (data won't be saved permanently).")

@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    # Only allow safe static extensions to be served
    allowed_extensions = {'.html', '.css', '.js', '.png', '.jpg', '.jpeg', '.svg'}
    ext = os.path.splitext(path)[1]
    
    if ext in allowed_extensions or path.startswith('images/'):
        return send_from_directory('.', path)
    
    return "Not Found", 404

@app.route('/api/join', methods=['POST'])
def join():
    data = request.json
    if not data:
        return jsonify({'status': 'error', 'message': 'Invalid data received'}), 400
    
    data['timestamp'] = datetime.now().isoformat()
    
    if users_collection is not None:
        try:
            users_collection.insert_one(data)
            return jsonify({'status': 'success', 'message': 'Successfully joined the movement!'})
        except Exception as e:
            return jsonify({'status': 'error', 'message': str(e)}), 500
    else:
        # Fallback testing response so the frontend still works locally without MongoDB
        print("Testing Mode Registration Received:", data)
        return jsonify({'status': 'success', 'message': '(Testing mode) Your info was received!'})

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 10000))
    app.run(host='0.0.0.0', port=port)
