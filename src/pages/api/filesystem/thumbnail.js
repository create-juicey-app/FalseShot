// pages/api/filesystem/thumbnail.js
import { getSafePath } from '../../../utils/filesystem';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { filePath, size } = req.query;

  if (!filePath || !size) {
    return res.status(400).json({ error: 'filePath and size are required' });
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

  const ext = path.extname(safePath).toLowerCase();
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];

  if (!imageExtensions.includes(ext)) {
    return res.status(400).json({ error: 'Not an image file' });
  }

  try {
    const buffer = fs.readFileSync(safePath);
    const thumbnail = await sharp(buffer)
      .resize(parseInt(size), parseInt(size), {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .toBuffer();

    res.setHeader('Content-Type', `image/${ext.replace('.', '')}`);
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    res.status(200).send(thumbnail);
  } catch (error) {
    console.error('Error generating thumbnail:', error);
    res.status(500).json({ error: 'Error generating thumbnail' });
  }
}