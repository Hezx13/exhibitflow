from fuzzywuzzy import fuzz
import re
from typing import List, Optional, Dict, Any

def get_bbox(poly: List[List[int]]) -> tuple[int, int, int, int]:
    """
    Returns the bounding box (min_x, min_y, max_x, max_y) for a polygon.
    """
    xs = [p[0] for p in poly]
    ys = [p[1] for p in poly]
    return min(xs), min(ys), max(xs), max(ys)

def extract_amount(s: str) -> Optional[str]:
    """
    Extracts the numeric amount from a string.
    Returns the cleaned amount string if it looks like a valid amount, else None.
    """
    # 1. Check for forbidden words that indicate this isn't a monetary amount
    forbidden = ["box", "kg", "lbs", "pcs", "date", "page", "no", "num", "code", "id", "qty", "quantity", "weight", "cbm", "iso", "registered"]
    s_lower = s.lower()
    for word in forbidden:
        # Check if word exists as a whole word
        if re.search(r'\b' + re.escape(word) + r'\b', s_lower):
            return None

    # 2. Clean the string to isolate the number
    matches = re.findall(r'[\d.,]+', s)
    if not matches:
        return None
        
    best_match = None
    for m in matches:
        # Clean up leading/trailing punctuation
        clean = m.strip('.,')
        
        # Must contain at least one digit
        if not re.search(r'\d', clean):
            continue
            
        # Filter out things that look like dates
        if clean.count('.') > 1:
            continue
            
        # If it's just an integer
        if re.match(r'^\d+$', clean):
            val = int(clean)
            # Stricter check for years: 1900-2100
            if 1900 <= val <= 2100:
                continue # Treat as year
            
            # If it's a small integer (e.g. 1, 2, 5), it's likely a quantity or page number
            if val < 10:
                continue
                
            # If it's a very long integer (like an ID), reject
            if len(clean) > 8:
                continue
                
        # If it has a lot of digits, it might be an ID
        digit_count = sum(c.isdigit() for c in clean)
        if digit_count > 12:
            continue

        best_match = clean

    return best_match

def parse_amount(s: str) -> float:
    """
    Parses a string amount into a float, handling various formats.
    """
    try:
        clean = s.replace(' ', '')
        clean = re.sub(r'[^\d.,]', '', clean)
        
        if ',' in clean and '.' in clean:
            if clean.rfind(',') > clean.rfind('.'):
                # 1.234,56
                clean = clean.replace('.', '').replace(',', '.')
            else:
                # 1,234.56
                clean = clean.replace(',', '')
        elif ',' in clean:
            # 123,45 or 1,234
            if re.search(r',\d{2}$', clean):
                clean = clean.replace(',', '.')
            else:
                clean = clean.replace(',', '')
                
        return float(clean)
    except:
        return 0.0

def find_total_amount(strs: List[str], coordinates: List[List[List[int]]]) -> Optional[str]:
    """
    Finds the total amount from the OCR output using fuzzy matching and spatial analysis.
    
    Args:
        strs: List of text strings from OCR.
        coordinates: List of polygons (each polygon is a list of [x, y] points) corresponding to the strings.
        
    Returns:
        The detected total amount string, or None if not found.
    """
    candidates: List[Dict[str, Any]] = []
    
    # Keywords to look for
    keywords = ["total", "grand total", "amount due", "due amt", "balance due", "invoice total", "total amount", "net total", "net amount"]
    
    # Negative keywords to avoid
    negative_keywords = ["sub", "subtotal", "tax", "vat", "weight", "qty", "quantity", "items", "units", "page", "loyalty", "points", "ctns", "cbm"]

    for i, text in enumerate(strs):
        text_lower = text.lower()
        
        # Skip if contains negative keywords
        if any(nk in text_lower for nk in negative_keywords):
            continue
            
        # Check for keyword match
        best_ratio = 0
        for kw in keywords:
            ratio = fuzz.partial_ratio(text_lower, kw)
            if ratio > best_ratio:
                best_ratio = ratio
        
        # Threshold for fuzzy match
        if best_ratio >= 85:
            # We found a potential label
            label_poly = coordinates[i]
            l_min_x, l_min_y, l_max_x, l_max_y = get_bbox(label_poly)
            l_center_y = (l_min_y + l_max_y) / 2
            l_height = l_max_y - l_min_y
            
            # Search for value to the right
            best_neighbor = None
            min_dist = float('inf')
            
            for j, other_text in enumerate(strs):
                if i == j: continue
                
                other_poly = coordinates[j]
                o_min_x, o_min_y, o_max_x, o_max_y = get_bbox(other_poly)
                o_center_y = (o_min_y + o_max_y) / 2
                
                # Vertical alignment check
                if abs(l_center_y - o_center_y) < (l_height * 0.8):
                    # Horizontal check: should be to the right
                    dist = o_min_x - l_max_x
                    
                    # Allow small negative distance (overlap) or reasonable positive distance
                    if dist > -25: 
                        # Check if neighbor is a valid amount
                        amount = extract_amount(other_text)
                        if amount:
                            if dist < min_dist:
                                min_dist = dist
                                best_neighbor = amount # Use the extracted amount
            
            if best_neighbor:
                candidates.append({
                    "label": text,
                    "value": best_neighbor,
                    "y": l_center_y,
                    "score": best_ratio
                })
            else:
                # Fallback: if the label itself contains the amount (e.g. "Total: 500")
                amount = extract_amount(text)
                if amount:
                     candidates.append({
                        "label": text,
                        "value": amount,
                        "y": l_center_y,
                        "score": best_ratio
                    })

    if not candidates:
        return None
        
    # Sort candidates by value (descending) to find the highest amount
    candidates.sort(key=lambda x: parse_amount(x['value']), reverse=True)
    
    return candidates[0]['value']