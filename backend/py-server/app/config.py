import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Redis configuration
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

# RabbitMQ configuration (default to IPv4 localhost to avoid ::1 resolution issues)
RABBITMQ_URL = os.getenv("RABBITMQ_URL", "amqp://guest:guest@127.0.0.1:5672/")
RABBITMQ_QUEUE = os.getenv("RABBITMQ_QUEUE", "py_ocr_process_invoices")

# File-system locations
_BASE_DIR = os.path.dirname(os.path.dirname(__file__))
OCR_INPUT_DIR = os.getenv("OCR_INPUT_DIR", os.path.join(_BASE_DIR, "test-data"))
OCR_OUTPUT_DIR = os.getenv("OCR_OUTPUT_DIR", os.path.join(_BASE_DIR, "output"))

# MongoDB configuration
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/test")

# OCR configuration
OCR_LANG = os.getenv("OCR_LANG", "en")