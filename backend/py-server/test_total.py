import json
import os
import sys
from app.post_processing.total import find_total_amount

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

def process_all_invoices():
    output_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "output")
    results = []

    if not os.path.exists(output_dir):
        print(f"Output directory not found: {output_dir}")
        return

    for root, dirs, files in os.walk(output_dir):
        for file in files:
            if file.endswith("_res.json"):
                file_path = os.path.join(root, file)
                try:
                    with open(file_path, 'r') as f:
                        data = json.load(f)
                    
                    strs = data.get('rec_texts', [])
                    coordinates = data.get('dt_polys', [])
                    
                    if not strs or not coordinates:
                        print(f"Skipping {file}: Missing text or coordinates")
                        continue

                    total = find_total_amount(strs, coordinates)
                    results.append({
                        "file": file,
                        "total": total
                    })
                    print(f"Processed {file}: Total = {total}")
                except Exception as e:
                    print(f"Error processing {file}: {e}")

    print("\n--- Summary ---")
    for res in results:
        print(f"{res['file']}: {res['total']}")

if __name__ == "__main__":
    process_all_invoices()
