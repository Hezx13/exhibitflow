"""Runtime helpers for sharing OCR resources across workers."""

from __future__ import annotations

import logging
import os
from typing import Optional

from app.config import OCR_LANG
from app.ocr_service import OCRService

# macOS behaves poorly with forked processes when Objective-C libraries are
# involved. Setting these flags early prevents crashes and controls thread
# counts before Paddle loads.
os.environ.setdefault("OBJC_DISABLE_INITIALIZE_FORK_SAFETY", "YES")

logger = logging.getLogger(__name__)

_ocr_service: Optional[OCRService] = None


def get_ocr_service(lang: Optional[str] = None) -> OCRService:

    global _ocr_service
    effective_lang = lang or OCR_LANG

    if _ocr_service is None:
        logger.info("Initializing shared OCR service (lang=%s)", effective_lang)
        _ocr_service = OCRService(effective_lang)
        logger.info("OCR service ready")

    return _ocr_service
