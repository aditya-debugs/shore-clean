import os
import logging
import requests
import base64
from PIL import Image
from io import BytesIO
import datetime
import cloudinary
import cloudinary.uploader

# Cloudinary config
cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET")
)

STABILITY_API_KEY = os.getenv("STABILITY_API_KEY")
STABILITY_API_URL = "https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image"

if not STABILITY_API_KEY:
    raise ValueError("STABILITY_API_KEY not set in .env")

logging.basicConfig(level=logging.INFO)

async def generate_flyer(prompt: str) -> dict:
    headers = {
        "Authorization": f"Bearer {STABILITY_API_KEY}",
        "Content-Type": "application/json"
    }

    payload = {
        "cfg_scale": 10,
        "clip_guidance_preset": "FAST_BLUE",
        "height": 1024,
        "width": 1024,
        "samples": 1,
        "steps": 30,
        "text_prompts": [{"text": prompt, "weight": 1}]
    }

    try:
        response = requests.post(STABILITY_API_URL, headers=headers, json=payload)
        if response.status_code != 200:
            raise Exception(f"Stability API Error: {response.text}")

        image_b64 = response.json()["artifacts"][0]["base64"]
        image_data = base64.b64decode(image_b64)

        # Save locally
        timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
        image_path = f"stability_flyer_{timestamp}.png"
        with open(image_path, "wb") as f:
            f.write(image_data)

        logging.info(f"Flyer saved at {image_path}")

        # Upload to Cloudinary
        upload_result = cloudinary.uploader.upload(image_path, folder="event_flyers")
        flyer_url = upload_result.get("secure_url")

        logging.info(f"Flyer uploaded to Cloudinary: {flyer_url}")

        return {"flyer_result": "✅ Generated successfully", "image_path": image_path, "flyer_url": flyer_url}

    except Exception as e:
        logging.error(f"Flyer generation failed: {e}")
        return {"flyer_result": f"❌ {str(e)}", "image_path": None, "flyer_url": None}
