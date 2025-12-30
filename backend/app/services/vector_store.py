import os
import shutil
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain_community.vectorstores import Chroma
from langchain.chains import RetrievalQA
from app.core.config import settings

# Initialize OpenAI Tools
embeddings = OpenAIEmbeddings(openai_api_key=settings.OPENAI_API_KEY)
llm = ChatOpenAI(model_name="gpt-4o", openai_api_key=settings.OPENAI_API_KEY)

def ingest_pdf(file_path: str):
    # 1. Load PDF
    loader = PyPDFLoader(file_path)
    documents = loader.load()

    # 2. Split Text
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
    chunks = text_splitter.split_documents(documents)

    # 3. Store in Vector DB
    # --- RESET LOGIC (Re-enabled) ---
    if os.path.exists(settings.VECTOR_DB_PATH):
        shutil.rmtree(settings.VECTOR_DB_PATH)  # <--- Deletes old memory
        
    Chroma.from_documents(
        documents=chunks,
        embedding=embeddings,
        persist_directory=settings.VECTOR_DB_PATH
    )
    return "Ingestion Complete!"

def ask_pdf(query: str):
    """
    1. Search the Vector DB for relevant chunks.
    2. Send them to GPT-4o to generate an answer.
    """
    # Load the DB
    vector_db = Chroma(persist_directory=settings.VECTOR_DB_PATH, embedding_function=embeddings)
    
    # Create a "Chain" (Search -> LLM)
    retriever = vector_db.as_retriever(search_kwargs={"k": 3})
    qa_chain = RetrievalQA.from_chain_type(llm=llm, chain_type="stuff", retriever=retriever)
    
    # Get the answer
    response = qa_chain.invoke(query)
    return response["result"]