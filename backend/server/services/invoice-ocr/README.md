# Python OCR Service

## Overview

This service provides Express route handlers that execute OCR processing tasks by spawning isolated Python processes. Each request runs `simple_test.py` from the `py-server` directory directly without a worker pool.

## Architecture

### Components

- **`OCRService`** (`ocr-service.ts`)
  - Express Router with authenticated endpoints
  - Spawns isolated Python processes on demand
  - Handles stdout/stderr capture and timeouts

### Routes

- **`GET /api/ocr/test`** - Public test endpoint (no authentication)
  - Returns OCR processing results
  
- **`POST /api/ocr/process`** - Admin-only endpoint
  - Requires authentication and admin role
  - Request body: `{ "imagePath": "string" }`
  - Returns: `{ "success": boolean, "imagePath": string, "result": string }`

## Process Flow

```
Request → Express Route → OCRService 
  → spawn(pythonExecutable, ['simple_test.py']) 
  → Capture stdout/stderr 
  → Return output
```

## Features

✅ **Isolated Processes** - Each request runs a separate Python instance
✅ **Direct Execution** - No worker pool overhead
✅ **Error Handling** - Process timeouts (120s), exit codes, and stderr captured
✅ **Async/Await** - Fully async with proper error propagation
✅ **Type Safe** - Full TypeScript support

## Configuration

The service automatically:
- Detects the virtual environment at `.venv/bin/python3`
- Uses the virtual environment's Python with installed dependencies
- Runs from the `py-server` directory

## Testing

### Test Endpoint
```bash
curl http://localhost:5000/api/ocr/test
```

### Production Endpoint
```bash
curl -X POST http://localhost:5000/api/ocr/process \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"imagePath": "/path/to/image.jpg"}'
```

## Logging

The service outputs logs with emoji indicators:
- 🐍 Service initialization
- � OCR requests
- 🧪 Test runs
- ✓ Completion
- ✗ Errors
- 🛑 Shutdown

## Error Handling

- **Invalid request** - Returns 400 with validation error
- **Process timeout** (120s) - Kills process and returns error
- **Exit code non-zero** - Captures stderr and returns error
- **Process spawn error** - Propagates error to response

## Dependencies

- `child_process.spawn` - Node.js built-in
- Python packages in `py-server/requirements.txt`:
  - paddleocr
  - paddlepaddle
  - opencv-python
  - numpy
  - requests

## Future Improvements

1. **Worker Pool** - Add back worker pool for better concurrency
2. **Queue Management** - Queue requests if processing is slow
3. **Caching** - Cache OCR results for identical images
4. **Metrics** - Track processing times, success rates
5. **Progress Updates** - WebSocket updates for long-running processes

