// pages/api/filesystem/list.js
import { getSafePath } from '../../../utils/filesystem';
import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { dir } = req.query;

  if (dir === undefined) {
    return res.status(400).json({ error: 'Directory path is required' });
  }

  let safeDir;
  try {
    safeDir = getSafePath(dir);
  } catch (error) {
    return res.status(400).json({ error: 'Invalid directory path' });
  }

  if (!fs.existsSync(safeDir)) {
    return res.status(404).json({ error: 'Directory does not exist' });
  }

  const files = fs.readdirSync(safeDir, { withFileTypes: true });

  const items = files.map((file) => {
    const filePath = path.join(dir, file.name);
    const stat = fs.statSync(getSafePath(filePath));
    let width = null;
    let height = null;

    if (!file.isDirectory()) {
      const ext = path.extname(file.name).toLowerCase();
      const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];
      if (imageExtensions.includes(ext)) {
        try {
          const sharp = require('sharp');
          const image = sharp(getSafePath(filePath));
          const metadata = image.metadataSync();
          width = metadata.width || null;
          height = metadata.height || null;
        } catch (err) {
          // If sharp fails, leave width and height as null
          console.error('Error reading image metadata:', err);
        }
      }
    }

    return {
      name: file.name,
      isDirectory: file.isDirectory(),
      size: file.isDirectory() ? null : Math.round(stat.size / 1024), // Size in KB
      format: file.isDirectory() ? 'Folder' : path.extname(file.name).substring(1).toUpperCase(),
      width: width,
      height: height,
    };
  });

  res.status(200).json({ path: dir.startsWith('/') ? dir : `/${dir}`, items });
}