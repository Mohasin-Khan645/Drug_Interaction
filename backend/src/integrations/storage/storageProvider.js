import fs from 'fs/promises';
import path from 'path';
import { logger } from '../../config/logger.js';

export class StorageProvider {
  constructor(baseDir = 'uploads') {
    this.baseDir = baseDir;
  }

  async saveFile(file) {
    await fs.mkdir(this.baseDir, { recursive: true });
    const filename = `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const targetPath = path.join(this.baseDir, filename);

    if (file.buffer) {
      await fs.writeFile(targetPath, file.buffer);
    } else if (file.path) {
      await fs.copyFile(file.path, targetPath);
    }

    logger.info({ filename }, 'Stored prescription file securely');
    return {
      fileName: filename,
      fileUrl: `/uploads/${filename}`,
      fileSize: file.size,
      mimeType: file.mimetype,
    };
  }

  async getFile(filename) {
    const targetPath = path.join(this.baseDir, filename);
    return fs.readFile(targetPath);
  }
}

export const defaultStorageProvider = new StorageProvider();

