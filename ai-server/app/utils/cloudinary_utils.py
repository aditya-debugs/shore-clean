import os, base64, cloudinary.uploader

cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET")
)

def upload_to_cloudinary(image_b64: str, prompt: str) -> str:
    image_bytes = base64.b64decode(image_b64)
    upload_result = cloudinary.uploader.upload(
        image_bytes,
        folder="event_flyers",
        public_id=prompt.replace(" ", "_")[:50],
        overwrite=True,
        resource_type="image"
    )
    return upload_result["secure_url"]
