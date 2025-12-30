from app.core.celery_app import celery_app
from app.services.vector_store import ingest_pdf
import os

@celery_app.task(name="process_pdf_task")
def process_pdf_task(file_path: str):
    """
    This function will run in the BACKGROUND.
    The API will not wait for it to finish.
    """
    print(f"--- [Worker] Starting processing for: {file_path} ---")
    
    try:
        # We reuse the logic you wrote on Day 1!
        result = ingest_pdf(file_path)
        return {"status": "completed", "message": result}
    except Exception as e:
        print(f"--- [Worker] Error: {e} ---")
        return {"status": "failed", "error": str(e)}