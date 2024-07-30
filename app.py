from flask import Flask, request, jsonify
from flask_cors import CORS
from text_extraction import process_arxiv_paper, generate_tech_summaries, generate_business_summaries
import logging
from datetime import datetime
import threading
import hashlib

app = Flask(__name__)
CORS(app)

# Configure logging
current_time = datetime.now().strftime("%Y%m%d_%H%M%S")
log_filename = f'app_usage_{current_time}.log'

logging.basicConfig(
    filename=log_filename,
    level=logging.INFO,
    format='%(asctime)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)

# In-memory cache
cache = {}

def generate_summaries(processed_text, request_id):
    try:
        business_summary = generate_business_summaries(processed_text)
        tech_summary = generate_tech_summaries(processed_text)
        cache[request_id]['status'] = 'completed'
        cache[request_id]['business_summary'] = business_summary
        cache[request_id]['tech_summary'] = tech_summary
    except Exception as e:
        logging.error(f"Error generating summaries: {str(e)}")
        cache[request_id]['status'] = 'error'
        cache[request_id]['error'] = str(e)

@app.route('/process', methods=['POST'])
def process_paper():
    data = request.json
    url = data.get('url')

    if not url:
        logging.error("Bad request: URL is required")
        return jsonify({'error': 'URL is required'}), 400

    # Generate a unique request ID
    request_id = hashlib.md5(url.encode()).hexdigest()

    # Check if the paper is already processed and cached
    if request_id in cache:
        cached_data = cache[request_id]
        logging.info(f"Returning cached result for URL: {url}")
        
        response = {
            'status': 'Cached',
            'request_id': request_id,
            'processed_text': cached_data['processed_text']
        }
        
        # Include summaries if they're already generated
        if cached_data['status'] == 'completed':
            response['business_summary'] = cached_data['business_summary']
            response['tech_summary'] = cached_data['tech_summary']
        
        return jsonify(response), 200

    try:
        logging.info(f"Processing paper from URL: {url}")
        processed_text = process_arxiv_paper(url)
        
        # Store in cache
        cache[request_id] = {
            'status': 'processing',
            'processed_text': processed_text
        }
        
        # Start summary generation in a separate thread
        threading.Thread(target=generate_summaries, args=(processed_text, request_id)).start()

        logging.info("Text processing completed, summary generation started")
        return jsonify({
            'status': 'Text processed',
            'request_id': request_id,
            'processed_text': processed_text
        }), 202  # 202 Accepted
    except Exception as e:
        logging.error(f"Error processing paper: {str(e)}")
        return jsonify({'error': str(e)}), 400

@app.route('/summaries/<request_id>', methods=['GET'])
def get_summaries(request_id):
    if request_id not in cache:
        return jsonify({'error': 'Request ID not found'}), 404
    
    return jsonify(cache[request_id]), 200

if __name__ == '__main__':
    logging.info("Starting Flask server...")
    print(f"Logging to file: {log_filename}")
    app.run(port=5001, debug=True)