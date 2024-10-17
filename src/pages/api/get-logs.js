import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  if (req.method === 'GET') {
    const logsDir = path.join(process.cwd(), 'logs');
    const logFiles = fs.readdirSync(logsDir);
    const logs = logFiles
      .map(file => {
        const content = fs.readFileSync(path.join(logsDir, file), 'utf-8');
        return JSON.parse(content);
      })
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.status(200).json(logs);
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}