from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.content_service import generate_content
from app.services.flyer_service import generate_flyer
from app.db.mongo import flyers_collection

router = APIRouter()

# Pydantic model for JSON body
class EventQueryRequest(BaseModel):
    event_query: str

@router.post("/description")
async def create_description(request: EventQueryRequest):
    try:
        result = await generate_content(request.event_query)
        # Save to DB
        if flyers_collection:
            await flyers_collection.insert_one({
                "query": request.event_query,
                "description": result
            })
        return {"success": True, "description": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/flyer")
async def create_flyer_endpoint(request: EventQueryRequest):
    try:
        result = await generate_flyer(request.event_query)
        # Save to DB if flyer_url exists
        if flyers_collection and result.get("flyer_url"):
            await flyers_collection.insert_one({
                "query": request.event_query,
                "flyer_url": result["flyer_url"]
            })
        return {"success": True, **result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
