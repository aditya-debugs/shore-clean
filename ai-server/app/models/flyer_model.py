from pydantic import BaseModel

class Flyer(BaseModel):
    query: str
    description: str | None = None
    flyer_url: str | None = None
