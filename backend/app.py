from flask import Flask, request, jsonify
from flask_cors import CORS
from sentiment_model import get_sentiment
import json
from datetime import datetime
import os

app = Flask(__name__)
CORS(app)

LOG_FILE = "mood_log.json"  # ✅ File where we store moods

@app.route('/analyze-sentiment', methods=['POST'])
def analyze_sentiment():
    data = request.get_json()
    message = data.get('message', '')

    if not message:
        return jsonify({"error": "No message provided"}), 400

    result = get_sentiment(message)

    # Add logging logic 💾
    log_entry = {
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "message": message,
        "mood": result["mood"],
        "compound_score": result["scores"]["compound"]
    }

    # Append to JSON file
    if os.path.exists(LOG_FILE):
        with open(LOG_FILE, "r+") as file:
            data = json.load(file)
            data.append(log_entry)
            file.seek(0)
            json.dump(data, file, indent=2)
    else:
        with open(LOG_FILE, "w") as file:
            json.dump([log_entry], file, indent=2)

    return jsonify(result), 200


# ✅ ADD THIS BELOW ↑ and BEFORE the __main__ block
@app.route('/mood-log', methods=['GET'])
def get_mood_log():
    try:
        with open(LOG_FILE, "r") as file:
            data = json.load(file)
        return jsonify(data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True)
