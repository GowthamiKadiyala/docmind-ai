from celery import Celery
import os

# Configure Celery to use Redis as the "Broker" (Message Queue)
# and "Backend" (To store results)
celery_app = Celery(
    "docmind_worker",
    broker="redis://localhost:6379/0",
    backend="redis://localhost:6379/0"
)

# Optional: Configuration for better serialization
celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
)