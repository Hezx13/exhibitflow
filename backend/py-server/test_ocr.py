#!/usr/bin/env python3
"""Simple OCR test - just verifies PaddleOCR can be imported and initialized."""

import sys
import os

try:
    print("🐍 Testing Python environment...")
    print(f"Python: {sys.version.split()[0]}")
    
    print("📦 Importing PaddleOCR...")
    from paddleocr import PaddleOCR
    
    print("⚙️  Initializing PaddleOCR (PP-OCRv5 mobile models)...")
    ocr = PaddleOCR(
        lang="en",
        ocr_version="PP-OCRv5",
        use_doc_orientation_classify=False,
        use_doc_unwarping=False,
        use_textline_orientation=False,
        text_detection_model_name="PP-OCRv5_mobile_det",
        text_recognition_model_name="PP-OCRv5_mobile_rec"
    )
    
    print("✅ PaddleOCR successfully initialized!")
    print("✅ All dependencies are working correctly!")
    
except ImportError as e:
    print(f"❌ Import error: {e}")
    sys.exit(1)
except Exception as e:
    print(f"❌ Error: {e}")
    sys.exit(1)
