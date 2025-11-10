#!/usr/bin/env python3
"""Simple OCR smoke test using PaddleOCR v3 API."""

import os
import sys
from paddleocr import PaddleOCR

from app.config import OCR_OUTPUT_DIR
from app.processing import collect_image_inputs, run_ocr_batch
from pymongo import MongoClient
from bson import ObjectId
def main() -> None:
    print("Initializing PaddleOCR (PP-OCRv5 mobile models)...")
    jobId = sys.argv[1]
    print(f"Using jobId: {jobId}")
    if (not jobId):
        raise ValueError("No jobId provided")
    
    uri = os.getenv("MONGO_URI", "mongodb://localhost:27017") 
    client = MongoClient(uri)
    db = client.get_database('test')
    jobCollection = db.get_collection('ocr_jobs')
    fileDataCollection = db.get_collection('file_data')
    ocr = PaddleOCR(
        lang="en",
        ocr_version="PP-OCRv5",
        use_doc_orientation_classify=False,
        use_doc_unwarping=False,
        use_textline_orientation=False,
        text_detection_model_name="PP-OCRv5_mobile_det",
        text_recognition_model_name="PP-OCRv5_mobile_rec"
    )
    print("✓ OCR initialized\n")
    jobData = jobCollection.find_one({"_id": ObjectId(jobId)})
    print(f"Job data: {jobData}")
    # Get test images
    test_dir = os.path.join(os.path.dirname(__file__), "test-data")
    
    if not os.path.exists(test_dir):
        print(f"No test-data directory found")
        return
    
    image_files = collect_image_inputs(test_dir)
    print(f"images_files: {image_files}")
    if not image_files:
        print(f"No images found in {test_dir}")
        return
    
    print(f"Found {len(image_files)} image(s)\n")
    fileRefs = []
    for img_path in image_files:
        fileStats = os.stat(img_path)
        fileRefs.append({
            "filePath": img_path,
            "fileName": os.path.basename(img_path),
            "fileModifiedAt": fileStats.st_mtime,
            "fileSize": fileStats.st_size,
            "ocrStatus": "pending",
            "isInvoice": True,
        })
    insertedFiles = fileDataCollection.insert_many(fileRefs)
    fileRefsWithStatus = [
    {"ref": _id, "processingStatus": "not_started"}
    for _id in insertedFiles.inserted_ids
    ]
    jobCollection.update_one(
        {"_id": ObjectId(jobId)},
        {"$set": {"fileRefs": fileRefsWithStatus}}
    )
    print(f"Updated job entry with {len(fileRefs)} fileRefs\n")
    batch_results = run_ocr_batch(ocr, image_files, output_root=OCR_OUTPUT_DIR, jobCollection=jobCollection, jobId=jobId, fileDataCollection=fileDataCollection)

    # Present a concise preview similar to the previous inline printing
    for idx, result in enumerate(batch_results, 1):
        filename = os.path.basename(result.image_path)
        print(f"[{idx}/{len(batch_results)}] Processed: {filename}")
        print("-" * 60)

        if not result.text_lines:
            print("⚠ No text detected\n")
            continue

        print(f"✓ Extracted {len(result.text_lines)} lines:\n")
        for j, line in enumerate(result.text_lines[:10], 1):
            print(f"  {j:2d}. {line}")
        if len(result.text_lines) > 10:
            print(f"  ... and {len(result.text_lines) - 10} more lines")

        print()

if __name__ == "__main__":
    main()
