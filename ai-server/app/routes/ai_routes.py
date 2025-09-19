from fastapi import APIRouter, HTTPException
from app.services.content_service import generate_content
from app.services.flyer_service import generate_flyer
from app.db.mongo import flyers_collection

router = APIRouter()

@router.post("/description")
async def create_description(event_query: str):
    try:
        result = await generate_content(event_query)
        # Save to DB
        if flyers_collection:
            await flyers_collection.insert_one({"query": event_query, "description": result})
        return {"success": True, "description": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/flyer")
async def create_flyer_endpoint(event_query: str):
    try:
        result = await generate_flyer(event_query)
        # Save to DB
        if flyers_collection:
            await flyers_collection.insert_one({"query": event_query, "flyer_url": result.get("image_path")})
        return {"success": True, **result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
