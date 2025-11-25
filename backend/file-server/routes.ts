import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { config } from './config';
import { FileController } from './controller';

const router = Router();
const controller = new FileController();

// Ensure storage directory exists
if (!fs.existsSync(config.storage.path)) {
  fs.mkdirSync(config.storage.path, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, config.storage.path);
  },
  filename: (req, file, cb) => {
    // Temporary filename, will be renamed in controller
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
  }
});

router.post('/upload', upload.single('file'), controller.uploadFile.bind(controller));
router.get('/files/:id', controller.getFile.bind(controller));
router.get('/files/:id/meta', controller.getFileMetadata.bind(controller));

export default router;
