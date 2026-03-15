import motor.motor_asyncio
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # fallback to local MongoDB if not provided via environment 
    MONGO_URL: str = "mongodb://localhost:27017"
    MONGO_DATABASE: str = "healthcare"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

settings = Settings()

class Database:
    def __init__(self):
        self.client: motor.motor_asyncio.AsyncIOMotorClient = None
        self.db = None

db_instance = Database()

async def connect_to_mongo():
    db_instance.client = motor.motor_asyncio.AsyncIOMotorClient(settings.MONGO_URL)
    db_instance.db = db_instance.client[settings.MONGO_DATABASE]
    print("Connected to MongoDB")

async def close_mongo_connection():
    if db_instance.client:
        await db_instance.client.close()
        print("Closed connection to MongoDB")

def get_database():
    return db_instance.db

    