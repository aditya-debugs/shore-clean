from motor.motor_asyncio import AsyncIOMotorClient
import os

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
client = None
db = None
flyers_collection = None

async def connect_db():
    global client, db, flyers_collection
    client = AsyncIOMotorClient(MONGO_URI)
    db = client["ai_server"]
    flyers_collection = db["flyers"]
    print("MongoDB connected")

async def close_db():
    if client:
        client.close()
        print("MongoDB disconnected")
