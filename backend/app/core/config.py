import os
from dotenv import load_dotenv

# Load variables from .env file
load_dotenv()

class Settings:
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
    # We will save the vector database in a local folder called "chroma_db"
    VECTOR_DB_PATH = "chroma_db"

settings = Settings()