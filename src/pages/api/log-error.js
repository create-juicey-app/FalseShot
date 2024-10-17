import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  if (req.method === 'POST') {
    const logData = req.body;
    const logFileName = `error_log_${Date.now()}.json`;
    const logFilePath = path.join(process.cwd(), 'logs', logFileName);

    fs.mkdirSync(path.join(process.cwd(), 'logs'), { recursive: true });
    fs.writeFileSync(logFilePath, JSON.stringify(logData, null, 2));

    res.status(200).json({ message: 'Error log saved successfully' });
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}