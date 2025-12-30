import webbrowser
from fastapi import FastAPI
from fastapi.responses import RedirectResponse
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.api.endpoints import router as api_router

async def lifespan(app: FastAPI):
    # Print a clear message to the terminal
    print("\n\n🚀 Opening DocMind AI in your browser...\n\n")
    
    # Open the browser automatically
    webbrowser.open("http://127.0.0.1:8000")
    
    yield  # The app runs while this yield is active

app = FastAPI(title="DocMind AI", lifespan=lifespan)

# --- CORS Configuration ---
origins = ["http://localhost:5173", "http://localhost:3000"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Register Routes ---
app.include_router(api_router)

# --- Redirect Root to Docs ---
@app.get("/")
async def root():
    return RedirectResponse(url="/docs")

@app.get("/health")
def health_check():
    return {"status": "healthy"}