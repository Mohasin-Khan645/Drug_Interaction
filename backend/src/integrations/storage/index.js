'use strict';

const fs = require('fs/promises');
const path = require('path');
const crypto = require('crypto');
const config = require('../../config');

class StorageProvider {
  // eslint-disable-next-line no-unused-vars
  async put(buffer, meta) {
    throw new Error('put() must be implemented by a storage provider');
  }

  // eslint-disable-next-line no-unused-vars
  async get(key) {
    throw new Error('get() must be implemented by a storage provider');
  }
}

class LocalStorageProvider extends StorageProvider {
  constructor(baseDir = config.storage.localDir) {
    super();
    this.baseDir = path.isAbsolute(baseDir) ? baseDir : path.join(process.cwd(), baseDir);
  }

  async put(buffer, { mimeType }) {
    await fs.mkdir(this.baseDir, { recursive: true });
    const extension = mimeType === 'application/pdf' ? 'pdf' : mimeType.split('/')[1];
    // The client-supplied filename is never used to build the storage key.
    const key = `${crypto.randomUUID()}.${extension}`;
    await fs.writeFile(path.join(this.baseDir, key), buffer);
    return { key, checksum: crypto.createHash('sha256').update(buffer).digest('hex') };
  }

  async get(key) {
    if (path.basename(key) !== key) throw new Error('Invalid storage key');
    return fs.readFile(path.join(this.baseDir, key));
  }
}

class InMemoryStorageProvider extends StorageProvider {
  constructor() {
    super();
    this.files = new Map();
  }

  async put(buffer, { mimeType }) {
    const extension = mimeType === 'application/pdf' ? 'pdf' : mimeType.split('/')[1];
    const key = `${crypto.randomUUID()}.${extension}`;
    this.files.set(key, buffer);
    return { key, checksum: crypto.createHash('sha256').update(buffer).digest('hex') };
  }

  async get(key) {
    if (!this.files.has(key)) throw new Error('File not found');
    return this.files.get(key);
  }
}

let instance = null;

const getStorageProvider = () => {
  if (instance) return instance;
  instance = config.env === 'test' ? new InMemoryStorageProvider() : new LocalStorageProvider();
  return instance;
};

module.exports = {
  StorageProvider,
  LocalStorageProvider,
  InMemoryStorageProvider,
  getStorageProvider,
};
