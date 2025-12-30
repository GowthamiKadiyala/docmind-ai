# 🧠 DocMind AI

DocMind AI is a Full-Stack RAG (Retrieval-Augmented Generation) application that allows users to chat with their PDF documents in real-time.

It features an **Asynchronous Architecture** using Celery and Redis to handle heavy PDF processing without blocking the user interface.

![Project Screenshot](https://via.placeholder.com/800x400?text=DocMind+AI+Screenshot) 
*(You can replace this link with a real screenshot later)*

---

## 🚀 Features

- **📄 Drag & Drop Upload:** Upload PDF documents instantly.
- **⚡️ Async Processing:** Heavy ingestion tasks run in the background using Celery workers.
- **🔍 Vector Search:** Uses OpenAI Embeddings & ChromaDB to find relevant document context.
- **💬 AI Chat Interface:** Ask questions about your document and get accurate answers backed by data.
- **☁️ Cloud Ready:** Designed for deployment on Render (Backend) and Vercel (Frontend).

---

## 🛠 Tech Stack

### **Frontend**
- **React (Vite)** - Fast, modern UI framework.
- **TypeScript** - Type safety for reliable code.
- **Tailwind CSS** - Responsive styling.
- **Axios** - API communication.

### **Backend**
- **FastAPI** - High-performance Python API.
- **Celery** - Asynchronous task queue for background processing.
- **Redis** - Message broker and caching.
- **LangChain** - Framework for LLM orchestration.
- **ChromaDB** - Vector database for storing document embeddings.
- **OpenAI GPT-4o** - The intelligence engine.

---

## ⚙️ Local Setup Guide

Follow these steps to run the project on your machine.

### **1. Prerequisites**
- Python 3.9+
- Node.js & npm
- Docker (for running Redis)

### **2. Clone the Repository**
```bash
git clone [https://github.com/YOUR_USERNAME/docmind-ai.git](https://github.com/YOUR_USERNAME/docmind-ai.git)
cd docmind-ai
3. Start Redis (The Database)
Make sure Docker is running, then run:

Bash

docker run -d -p 6379:6379 --name redis-local redis
4. Backend Setup (The Brain)
Open a new terminal and navigate to the backend folder:

Bash

cd backend
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
Create a .env file in backend/ and add your key:

Bash

OPENAI_API_KEY=sk-proj-your-key-here...
Start the API Server:

Bash

uvicorn app.main:app --reload
Start the Background Worker: (Open a separate terminal window)

Bash

cd backend
source venv/bin/activate
celery -A app.workers.tasks worker --loglevel=info
5. Frontend Setup (The UI)
Open a new terminal and navigate to the frontend folder:

Bash

cd frontend
npm install
npm run dev
Open http://localhost:5173 in your browser.

📐 Architecture
User uploads PDF → Frontend sends file to FastAPI.

FastAPI saves file & pushes a task to Redis.

Celery Worker picks up the task, splits text, creates embeddings, and saves to ChromaDB.

Frontend polls for status updates.

Chat: User asks a question → System retrieves top k-chunks → GPT generates an answer.
