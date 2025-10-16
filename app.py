from flask import Flask, render_template, request, jsonify
import requests
import os # <-- 1. IMPORT THE 'os' LIBRARY

# --- Configuration ---
# 2. READ THE KEY FROM THE ENVIRONMENT. IT WILL BE 'None' ON YOUR LOCAL MACHINE FOR NOW.
LONGCAT_API_KEY = os.environ.get("LONGCAT_API_KEY") 
LONGCAT_API_URL = "https://api.longcat.chat/openai/v1/chat/completions"

app = Flask(__name__)

@app.route("/")
def index():
    """Renders the main chat page."""
    return render_template("index.html")

@app.route("/chat", methods=["POST"])
def chat():
    """Handles the chat logic using a standard request."""
    try:
        data = request.json
        message_history = data.get("history")

        headers = {
            "Authorization": f"Bearer {LONGCAT_API_KEY}",
            "Content-Type": "application/json",
        }
        
        # We REMOVED "stream": True from the payload
        payload = {
            "model": "LongCat-Flash-Thinking",
            "messages": message_history,
            "max_tokens": 4096, # Increased max_tokens to give room for both thinking and answer
            "enable_thinking": True,
            "thinking_budget": 1024 # Set a hard limit of 1024 tokens for the "thinking" part
        }
        
        # Make a single, non-streaming request
        response = requests.post(LONGCAT_API_URL, headers=headers, json=payload)
        response.raise_for_status()  # This will raise an error if the request fails

        response_data = response.json()
        
        # Extract the full message content
        content = response_data['choices'][0]['message']['content']
        
        # Send the full response back to the frontend
        return jsonify({"response": content})

    except requests.exceptions.RequestException as e:
        print(f"An error occurred: {e}")
        # Return a JSON error message
        return jsonify({"error": "Failed to get a response from the API."}), 500
    except (KeyError, IndexError) as e:
        print(f"Error parsing API response: {e}")
        return jsonify({"error": "Invalid response format from the API."}), 500

if __name__ == "__main__":
    app.run(debug=True, port=5000)