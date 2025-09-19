from fastapi import FastAPI
from app.routes import ai_routes  # , email_routes
from app.db.mongo import connect_db, close_db

app = FastAPI(title="AI Server", version="1.0.0")

# Include routes
app.include_router(ai_routes.router, prefix="/ai", tags=["AI"])
# app.include_router(email_routes.router, prefix="/email", tags=["Email"])

# MongoDB connection events
@app.on_event("startup")
async def startup_db_client():
    await connect_db()

@app.on_event("shutdown")
async def shutdown_db_client():
    await close_db()
