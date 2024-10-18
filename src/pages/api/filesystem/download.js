// pages/api/filesystem/download.js
import { getSafePath } from '../../../utils/filesystem';
import fs from 'fs';
import path from 'path';
import mime from 'mime-types';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { filePath } = req.query;

  if (!filePath) {
    return res.status(400).json({ error: 'filePath is required' });
  }

  // Validate and sanitize the filePath
  let safePath;
  try {
    safePath = getSafePath(filePath);
  } catch (error) {
    console.error('Invalid path:', error);
    return res.status(400).json({ error: 'Invalid file path' });
  }

  if (!fs.existsSync(safePath)) {
    return res.status(404).json({ error: 'File does not exist' });
  }

  const fileStat = fs.lstatSync(safePath);
  if (!fileStat.isFile()) {
    return res.status(400).json({ error: 'Path is not a file' });
  }

  const fileName = path.basename(safePath);
  const mimeType = mime.lookup(safePath) || 'application/octet-stream';

  res.setHeader('Content-Type', mimeType);
  res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
  res.setHeader('Content-Length', fileStat.size);

  const readStream = fs.createReadStream(safePath);
  readStream.pipe(res);
}