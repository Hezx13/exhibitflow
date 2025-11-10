from paddleocr import PaddleOCR
from typing import List
import logging
import os

logger = logging.getLogger(__name__)

class OCRService:
    def __init__(self, lang: str = "en") -> None:
        """Initialize PaddleOCR with specified language."""
        try:
            self.ocr = PaddleOCR(
                lang=lang,
                ocr_version="PP-OCRv5",  # Use v5 models
                use_doc_orientation_classify=False, 
                use_doc_unwarping=False, 
                use_textline_orientation=False,
            )
        except Exception as e:
            logger.error(f"Failed to initialize PaddleOCR: {str(e)}")
            raise

    def extract_text(self, image_path: str) -> List[str]:
        """Extract text from image using PaddleOCR."""
        if not os.path.exists(image_path):
            raise FileNotFoundError(f"Image file not found: {image_path}")
        
        try:
            logger.info(f"Running OCR on: {os.path.basename(image_path)}")
            
            results = self.ocr.predict(input=image_path)
            
            if not results:
                logger.warning(f"No text detected in {image_path}")
                return []
            
            text_lines: List[str] = []
            for res in results:
                items = getattr(res, "ocr_result", None)
                if items is None:
                    to_dict = getattr(res, "to_dict", None)
                    if callable(to_dict):
                        items = to_dict().get("ocr_result", [])
                if items is None:
                    items = []

                for item in items:
                    if not isinstance(item, dict):
                        continue
                    text = item.get("text")
                    if text:
                        text_lines.append(text)
            
            logger.info(f"Extracted {len(text_lines)} lines")
            return text_lines
            
        except Exception as e:
            logger.error(f"OCR failed: {str(e)}")
            raise