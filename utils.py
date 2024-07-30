import tiktoken
import dspy
from dotenv import load_dotenv
from openai import AzureOpenAI
import os

load_dotenv('/Users/netraranga/Desktop/Projects/.env')

def get_token_count(text):
    'Function to get the token count of a text string'

    encoder = tiktoken.get_encoding("cl100k_base")
    return len(encoder.encode(text))

def create_model_instance():
    'Function to create an instance of the Azure OpenAI model in dspy'

    azure_oai = dspy.AzureOpenAI(api_base='https://fsodnaopenai2.openai.azure.com/', api_version='2023-05-15',model='gpt-4o', max_tokens=4000)
    dspy.configure(lm=azure_oai)


def parse_section_headers(section_results):
    'Function to parse the section headers from the output of the SectionHeaderExtraction module'

    section_headers = {}
    for header in section_results.section_headers.split('\n'):
        if ':' in header:
            key, value = header.split(':', 1)
            section_headers[key.strip().lower()] = value.strip().lower()
    return section_headers

def create_client_object():
    client_val = AzureOpenAI(
        api_key=os.getenv('AZURE_OPENAI_KEY'),
        api_version='2023-12-01-preview',
        azure_endpoint = os.getenv('AZURE_OPENAI_ENDPOINT')
    )
    return client_val

def generate_completion(client, model, messages):
    response = client.chat.completions.create(
        model=model,
        messages=messages,
        temperature=0.3,
        max_tokens=4096
    )
    return response.choices[0].message.content