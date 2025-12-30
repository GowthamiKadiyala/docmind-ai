from app.services.vector_store import ingest_pdf, query_vector_db

# 1. Run Ingestion
print("--- STARTING INGESTION ---")
ingest_pdf("test.pdf")

# 2. Run Query
print("\n--- STARTING SEARCH ---")
question = "What is this document about?"
results = query_vector_db(question)

print(f"\nQuestion: {question}")
print(f"Top Result: {results[0].page_content[:300]}...")