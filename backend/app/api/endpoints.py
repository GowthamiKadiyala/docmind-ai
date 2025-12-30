from fastapi import APIRouter, UploadFile, File, HTTPException
from app.workers.tasks import process_pdf_task
from celery.result import AsyncResult
from pydantic import BaseModel
from app.services.vector_store import ask_pdf 
import shutil
import os

router = APIRouter()

class ChatRequest(BaseModel):
    question: str

@router.post("/chat")
async def chat_with_pdf(request: ChatRequest):
    answer = ask_pdf(request.question)
    return {"answer": answer}

@router.post("/upload")
async def upload_document(file: UploadFile = File(...)):
    # 1. Save the file locally so the worker can find it
    file_location = f"temp_{file.filename}"
    with open(file_location, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    # 2. Trigger the Celery Task (The SDE 3 move)
    # We do NOT wait for it to finish. We return immediately.
    task = process_pdf_task.delay(file_location)
    
    return {"task_id": task.id, "status": "processing"}

@router.get("/status/{task_id}")
async def get_status(task_id: str):
    # Check Redis for the status of this task
    task_result = AsyncResult(task_id)
    
    if task_result.state == 'PENDING':
        return {"status": "pending"}
    elif task_result.state == 'SUCCESS':
        return {"status": "completed", "result": task_result.result}
    elif task_result.state == 'FAILURE':
        return {"status": "failed", "error": str(task_result.result)}
        
    return {"status": task_result.state}