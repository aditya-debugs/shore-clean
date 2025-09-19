from fastapi import APIRouter, HTTPException
from app.services.email_service import send_email

router = APIRouter()

@router.post("/send")
async def send_event_email(to_email: str, subject: str, image_url: str, description: str):
    try:
        result = await send_email(to_email, subject, image_url, description)
        return {"success": True, "message": "Email sent", "details": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
