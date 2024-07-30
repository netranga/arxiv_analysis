from langchain_community.document_loaders import PyPDFLoader
import dspy
from dotenv import load_dotenv
from utils import get_token_count, create_model_instance, parse_section_headers, create_client_object, generate_completion
from http.server import HTTPServer, BaseHTTPRequestHandler
import json
import urllib.parse
import tiktoken
from openai import AzureOpenAI
import os

load_dotenv('/Users/netraranga/Desktop/Projects/.env')


def process_arxiv_paper(pdf_path):
    # Load the PDF
    loader = PyPDFLoader(pdf_path)
    pages = loader.load_and_split()
    
    # Combine all text into one string
    full_text = ' '.join([page.page_content for page in pages])
    
    # Lowercase the text
    full_text = full_text.lower()
    
    # Find the index of the reference marker
    ref_marker = 'references\n[1'
    ref_index = full_text.find(ref_marker)
    
    if ref_index != -1:
        # Remove all text after the reference marker
        full_text = full_text[:ref_index]
    
    # Remove extra spaces
    full_text = ' '.join(full_text.split())

    # Error handling for papers exceeding token limit
    if get_token_count(full_text) > 127000:
        raise ValueError("The paper is too long. A separate pipeline is needed for papers exceeding 127,000 tokens.")
    
    return full_text

class SectionHeaderExtraction(dspy.Signature):
    """Extract section headers from a research paper"""

    input_text = dspy.InputField(desc="The full text of a research paper")
    section_headers = dspy.OutputField(desc="A list of only main section headers found in the paper, do not include subheaders. Main headers typical lead with an integer and do not contains decimals. Return the first sentence after each main section header in the following format: Number. header: first sentence")

class SectionHeaderExtractor(dspy.Module):
    'Custom module, need to initialize with a prompting method  '
    def __init__(self):
        super().__init__()
        self.extractor = dspy.ChainOfThought(SectionHeaderExtraction)

    def forward(self, input_text):
        'Parameter is input field from Signature'
        result = self.extractor(input_text=input_text)
        return result
    
def extract_text_chunks(output_text, section_headers):
    # Convert the text to lowercase for case-insensitive matching
    output_text_lower = output_text.lower()
    
    chunks = {}
    
    for header, content in section_headers.items():
        current_header = content.lower()
        
        # Try to find the full first sentence
        start_index = output_text_lower.find(current_header)
        
        # If full sentence not found, try to find 6 consecutive words
        if start_index == -1:
            words = current_header.split()
            for j in range(len(words) - 5):
                six_word_phrase = ' '.join(words[j:j+6])
                start_index = output_text_lower.find(six_word_phrase)
                if start_index != -1:
                    break
        
        if start_index == -1:
            print(f"Warning: Couldn't find the content for header: {header}")
            continue
        
        # Find the start of the next section
        next_header = None
        for next_h, next_c in section_headers.items():
            if next_h > header:
                next_header = next_c.lower()
                break
        
        if next_header:
            end_index = output_text_lower.find(next_header)
            
            # If full next header not found, try to find 6 consecutive words
            if end_index == -1:
                words = next_header.split()
                for j in range(len(words) - 5):
                    six_word_phrase = ' '.join(words[j:j+6])
                    end_index = output_text_lower.find(six_word_phrase)
                    if end_index != -1:
                        break
        else:
            end_index = len(output_text)
        
        # Extract the chunk
        if end_index != -1:
            chunk = output_text[start_index:end_index].strip()
            chunks[header] = chunk
    
    return chunks

def generate_tech_summaries(article_text):
    with open('main_summaries.json', 'r') as f:
        file = json.load(f)
    client_val = create_client_object()
    messages = [{"role": "system", "content": file['technical']['system_prompt']}, 
    {"role": "user", "content": file['technical']['user_prompt'].format(processed_content=article_text)}]
    response = generate_completion(client_val, 'gpt-4o', messages)
    return response
    
    
def generate_business_summaries(article_text):
    with open('main_summaries.json', 'r') as f:
        file = json.load(f)
    client_val = create_client_object()
    messages = [{"role": "system", "content": file['business']['system_prompt']}, 
        {"role": "user", "content": file['business']['user_prompt'].format(processed_content=article_text)}]
    response = generate_completion(client_val, 'gpt-4o', messages)
    return response


class RequestHandler(BaseHTTPRequestHandler):
    def do_POST(self):
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        data = json.loads(post_data.decode('utf-8'))
        url = data.get('url')

        try:
            processed_content = process_arxiv_paper(url)
            extractor = SectionHeaderExtractor()
            section_results = extractor(input_text=processed_content)
            section_headers = parse_section_headers(section_results)
            extracted_text = extract_text_chunks(processed_content, section_headers)

            response = {
                'section_headers': list(section_headers.values()),
                'extracted_text': extracted_text
            }

            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps(response).encode())
        except Exception as e:
            self.send_response(400)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps({'error': str(e)}).encode())

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

if __name__ == "__main__":
    create_model_instance()
    server_address = ('', 5001)
    httpd = HTTPServer(server_address, RequestHandler)
    print('Server running on port 5001...')
    httpd.serve_forever()