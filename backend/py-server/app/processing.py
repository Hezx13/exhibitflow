from __future__ import annotations

import logging
import os
from dataclasses import dataclass, field
from typing import List, Sequence
from pymongo import collection
import fitz
from paddleocr import PaddleOCR
import json
from bson import ObjectId
import pika
import json as json_module

logger = logging.getLogger(__name__)

SUPPORTED_IMAGE_SUFFIXES = {".png", ".jpg", ".jpeg", ".bmp", ".tiff"}
PDF_SUFFIXES = {".pdf"}


def publish_ocr_notification(job_id: str, job_status: str, file_refs: list = None):
    """Publish OCR job status update to RabbitMQ"""
    try:
        rabbitmq_url = os.getenv("RABBITMQ_URL", "amqp://localhost:5672")
        connection = pika.BlockingConnection(pika.URLParameters(rabbitmq_url))
        channel = connection.channel()
        
        channel.queue_declare(queue='ocr_job_notification_queue', durable=True)
        
        message = {
            "jobId": job_id,
            "jobStatus": job_status,
            "fileRefs": file_refs or [],
            "timestamp": __import__("datetime").datetime.utcnow().isoformat()
        }
        
        channel.basic_publish(
            exchange='',
            routing_key='ocr_job_notification_queue',
            body=json_module.dumps(message),
            properties=pika.BasicProperties(delivery_mode=2)
        )
        
        logger.info(f"Published notification: job={job_id}, status={job_status}")
        connection.close()
    except Exception as e:
        logger.error(f"Failed to publish RabbitMQ notification: {e}")


@dataclass
class ImageOCRResult:
    """Lightweight container describing the outcome for a single image."""

    image_path: str
    output_dir: str
    text_lines: List[str] = field(default_factory=list)
    page_count: int = 0

    def to_summary(self) -> dict:
        return {
            "image_path": self.image_path,
            "output_dir": self.output_dir,
            "text_line_count": len(self.text_lines),
            "page_count": self.page_count,
        }


def _default_cache_root(input_dir: str) -> str:
    return os.path.join(input_dir, "_pdf_cache")


def extract_pdf_pages(pdf_path: str, cache_root: str | None = None, dpi_scale: float = 2.0) -> List[str]:
    """Render each page of ``pdf_path`` to PNG files.

    Returns the list of image paths. Pages are rendered once and stored on disk
    so reruns can reuse the cached PNGs.
    """

    pdf_name = os.path.splitext(os.path.basename(pdf_path))[0]
    cache_root = cache_root or _default_cache_root(os.path.dirname(pdf_path))
    target_dir = os.path.join(cache_root, pdf_name)
    os.makedirs(target_dir, exist_ok=True)

    image_paths: List[str] = []
    zoom = fitz.Matrix(dpi_scale, dpi_scale)

    try:
        doc = fitz.open(pdf_path)
    except Exception:  # pragma: no cover - we always log the details below
        logger.exception("Failed to open PDF %s", pdf_path)
        raise

    for page_index, page in enumerate(doc):
        out_path = os.path.join(target_dir, f"{pdf_name}_pdfpage_{page_index:03d}.png")
        if not os.path.exists(out_path):
            pix = page.get_pixmap(matrix=zoom)
            pix.save(out_path)
        image_paths.append(out_path)

    doc.close()
    return image_paths


def collect_image_inputs(input_dir: str) -> List[str]:
    """Collect all raster images and PDF pages beneath ``input_dir``."""

    if not os.path.isdir(input_dir):
        raise FileNotFoundError(f"Input directory not found: {input_dir}")

    images: List[str] = []
    pdfs: List[str] = []

    for name in sorted(os.listdir(input_dir)):
        path = os.path.join(input_dir, name)
        if not os.path.isfile(path):
            continue
        suffix = os.path.splitext(name)[1].lower()
        if suffix in SUPPORTED_IMAGE_SUFFIXES:
            images.append(path)
        elif suffix in PDF_SUFFIXES:
            pdfs.append(path)

    for pdf in pdfs:
        extracted = extract_pdf_pages(pdf)
        logger.info("Extracted %d page(s) from %s", len(extracted), os.path.basename(pdf))
        images.extend(extracted)

    return images


def _extract_text_lines(result_obj) -> List[str]:
    items = getattr(result_obj, "ocr_result", None)
    if items is None:
        to_dict = getattr(result_obj, "to_dict", None)
        if callable(to_dict):
            items = to_dict().get("ocr_result", [])
    if items is None:
        items = []

    lines: List[str] = []
    for item in items:
        if not isinstance(item, dict):
            continue
        text = item.get("text")
        if text:
            lines.append(text)
    return lines


def run_ocr_batch(ocr: PaddleOCR, image_paths: Sequence[str], output_root: str, jobCollection:  collection, jobId: str, fileDataCollection: collection = None) -> List[ImageOCRResult]:
    """Run PaddleOCR on ``image_paths`` and persist artifacts under ``output_root``."""

    os.makedirs(output_root, exist_ok=True)
    results: List[ImageOCRResult] = []
    
    jobCollection.update_one({"_id": ObjectId(jobId)},
        {"$set": {
            "jobStatus": "in_progress"
        }}
    )
    publish_ocr_notification(jobId, "in_progress")
    
    for index, img_path in enumerate(image_paths, 1):
        filename = os.path.basename(img_path)
        basename, _ = os.path.splitext(filename)
        out_dir = os.path.join(output_root, basename)
        os.makedirs(out_dir, exist_ok=True)
        logger.info("Running OCR on [%d/%d] %s", index, len(image_paths), filename)
        
        if fileDataCollection is None or jobCollection is None:
            raise ValueError("Cannot save OCR results: fileDataCollection or jobCollection is None")
        
        fileDbData = fileDataCollection.find_one({"filePath": img_path}, {"_id": 1, "ocrStatus": 1})
        if fileDbData is None:
            logger.warning("File not found in database: %s", img_path)
            continue
            
        fileDbId = fileDbData.get("_id")
        fileDbOcrStatus = fileDbData.get("ocrStatus")
        
        if fileDbOcrStatus not in ["pending", "failed"]:
            logger.info("Skipping OCR for %s because it was processed (status: %s)", filename, fileDbOcrStatus)
            jobCollection.update_one({"_id": ObjectId(jobId), "fileRefs.fileData": ObjectId(fileDbId)},
            {"$set": {
                "fileRefs.$.processingStatus": fileDbOcrStatus
            }}
        )
            continue
        
        fileDataCollection.update_one(
            {"_id": ObjectId(fileDbId)},
            {"$set": {
                    "ocrStatus": "in_progress"
                }
            },
            upsert=False
        )
        
        jobCollection.update_one({"_id": ObjectId(jobId), "fileRefs.fileData": ObjectId(fileDbId)},
            {"$set": {
                "fileRefs.$.processingStatus": "in_progress"
            }}
        )
        
        
        try:
            predict_results = ocr.predict(input=img_path)
        except Exception:
            logger.exception("PaddleOCR.predict failed for %s", filename)
            fileDataCollection.update_one(
                {"_id": ObjectId(fileDbId)},
                {
                    "$set": {
                        "ocrStatus": "failed"
                    }
                },
                upsert=False
            )
            
            jobCollection.update_one(
                {"_id": ObjectId(jobId), "fileRefs.fileData": ObjectId(fileDbId)},
                {"$set": {
                    "fileRefs.$.processingStatus": "failed"
                }}
            )
            raise

        if not predict_results:
            logger.warning("No text detected in %s", filename)
            results.append(ImageOCRResult(image_path=img_path, output_dir=out_dir, page_count=0))
            continue

        aggregated_lines: List[str] = []
        ocr_json_data = []

        for page_index, res in enumerate(predict_results):
            text_lines = _extract_text_lines(res)
            aggregated_lines.extend(text_lines)

            result_dir = out_dir if len(predict_results) == 1 else os.path.join(out_dir, f"page_{page_index:02d}")
            os.makedirs(result_dir, exist_ok=True)
            res.save_to_img(save_path=result_dir)
            print(f"{res}")
            res.save_to_json(save_path=result_dir)
            with open(os.path.join(result_dir, f"{basename}_res.json"), "r", encoding="utf-8") as f:
                json_data = json.load(f)
                ocr_json_data.append(json_data)
                f.close()

        results.append(
            ImageOCRResult(
                image_path=img_path,
                output_dir=out_dir,
                text_lines=aggregated_lines,
                page_count=len(predict_results),
            )
        )
        
        try:
            fileDataCollection.update_one(
                {"_id": ObjectId(fileDbId)},
                {
                    "$set": {
                        "ocrContent": ocr_json_data,
                        "ocrStatus": "completed"
                    }
                },
                upsert=False
            )
            
            jobCollection.update_one(
                {"_id": ObjectId(jobId), "fileRefs.fileData": ObjectId(fileDbId)},
                {"$set": {
                    "fileRefs.$.processingStatus": "completed"
                }}
            )
            # Publish notification after completing file processing
            publish_ocr_notification(jobId, "in_progress")
            logger.info("Saved OCR results to fileData for %s", filename)
        except Exception as e:
            logger.error("Failed to save OCR results to fileData for %s: %s", filename, str(e))

    logger.info("OCR batch complete")
    # Publish final completion notification
    publish_ocr_notification(jobId, "completed")

    return results
