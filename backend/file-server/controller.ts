import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import FileData from '../server/models/fileData';
import { config } from './config';

export class FileController {
  
  async uploadFile(req: Request, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      const { originalname, mimetype, size, filename } = req.file;
      
      // Create FileData entry
      const fileData = new FileData({
        fileName: originalname,
        fileType: mimetype,
        fileSize: size,
        fileModifiedAt: new Date(),
        // We store the physical filename (which might be a UUID from multer) 
        // or we can store the path. 
        // The FileData model doesn't have a 'path' field explicitly in the root, 
        // but it has 'input_path' in OcrDataItemSchema. 
        // We might need to add a field to FileData or use 'fileName' as the key.
        // Let's assume we can store the physical path or ID.
        // For now, I'll add a 'storageName' or just use 'fileName' if it's unique enough.
        // But 'fileName' in FileData seems to be the display name.
        // I'll assume we can store the physical filename in a new field or reuse one.
        // Looking at FileData schema again:
        // fileName: { type: String, required: true }
        // It doesn't have a storage path. 
        // I will assume for now that we can find the file by its _id or we need to add a field.
        // Or maybe 'fileName' IS the storage name?
        // Let's check how the main server uses it.
        // The main server doesn't seem to use FileData for uploads yet (it uses List/Task).
        // So I am free to define how to link them.
        // I will store the physical filename in a new field 'storageKey' if I could edit the model,
        // but I shouldn't edit existing models without need.
        // I'll use the _id as the filename on disk to ensure uniqueness and easy lookup.
      });

      // Rename the file to use the MongoDB _id
      const fileId = fileData._id.toString();
      const ext = path.extname(originalname);
      const newFilename = `${fileId}${ext}`;
      const newPath = path.join(config.storage.path, newFilename);

      await fs.promises.rename(req.file.path, newPath);

      // Update fileData if needed (e.g. if we want to store the extension or path)
      // But if we use _id + ext, we can reconstruct it if we know the extension.
      // FileData has 'fileType' (mimetype). We can deduce extension from it or store it.
      // Let's store the original name in fileName.
      
      await fileData.save();

      res.status(201).json({
        message: 'File uploaded successfully',
        file: {
          id: fileData._id,
          name: fileData.fileName,
          size: fileData.fileSize,
          type: fileData.fileType,
          url: `/files/${fileData._id}`
        }
      });

    } catch (error: any) {
      console.error('Upload error:', error);
      // Clean up file if it exists
      if (req.file) {
        try {
          await fs.promises.unlink(req.file.path);
        } catch (e) {
          // ignore
        }
      }
      res.status(500).json({ message: error.message });
    }
  }

  async getFile(req: Request, res: Response) {
    try {
      const fileId = req.params.id;
      if (!fileId) {
        return res.status(400).json({ message: 'File ID is required' });
      }
      const fileData = await FileData.findById(fileId);

      if (!fileData) {
        return res.status(404).json({ message: 'File not found' });
      }

      // Construct path
      // We need to know the extension. 
      // If we didn't store it, we might have to try matching files or store it.
      // Mime type to extension mapping is not 1-to-1.
      // Ideally we should store the storage filename.
      // Since I can't easily change the model right now without potentially breaking other things (though it seems unused),
      // I will look for a file starting with fileId in the storage directory.
      
      const files = await fs.promises.readdir(config.storage.path);
      const file = files.find(f => f.startsWith(fileId));

      if (!file) {
        return res.status(404).json({ message: 'File content not found' });
      }

      const filePath = path.join(config.storage.path, file);

      // Stream the file
      res.setHeader('Content-Type', fileData.fileType);
      res.setHeader('Content-Length', fileData.fileSize);
      // Cache control
      res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1 year

      const stream = fs.createReadStream(filePath);
      stream.pipe(res);

    } catch (error: any) {
      console.error('Get file error:', error);
      res.status(500).json({ message: error.message });
    }
  }
  
  async getFileMetadata(req: Request, res: Response) {
      try {
          const fileId = req.params.id;
          const fileData = await FileData.findById(fileId).lean();
          
          if (!fileData) {
              return res.status(404).json({ message: 'File not found' });
          }

          if (!fileData.filePath && fileData.ocrContent && fileData.ocrContent.length > 0) {
              fileData.filePath = fileData.ocrContent[0]?.input_path;
          }
          
          res.json(fileData);
      } catch (error: any) {
          res.status(500).json({ message: error.message });
      }
  }
}
