import os
import logging
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv() 
logging.basicConfig(level=logging.INFO)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY not found in .env")

gemini_client = OpenAI(
    api_key=GEMINI_API_KEY,
    base_url="https://generativelanguage.googleapis.com/v1beta/openai/"
)

system_prompt_content = """
You are a helpful AI assistant. Generate a detailed, attractive event description.
Include: purpose, audience, location, date/time, activities, registration, call-to-action.
"""

async def generate_content(event_query: str) -> str:
    logging.info(f"Generating content for: {event_query}")
    try:
        response = gemini_client.chat.completions.create(
            model="gemini-2.5-flash",
            messages=[
                {"role": "system", "content": system_prompt_content},
                {"role": "user", "content": event_query}
            ]
        )
        result = response.choices[0].message.content.strip()
        return result
    except Exception as e:
        logging.error(f"Content generation failed: {e}")
        raise
