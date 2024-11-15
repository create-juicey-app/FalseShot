import WebP from 'node-webpmux';
import sharp from 'sharp';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '50mb', // Adjust this limit as needed
    },
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { frames } = req.body;

    // Convert first frame to WebP and initialize
    const firstFrameBuffer = Buffer.from(frames[0].replace(/^data:image\/\w+;base64,/, ''), 'base64');
    const firstWebP = await sharp(firstFrameBuffer)
      .resize(608, 128)
      .webp()
      .toBuffer();

    const webpImage = new WebP.Image();
    await webpImage.load(firstWebP);
    webpImage.convertToAnim();

    // Add remaining frames
    for (let i = 1; i < frames.length; i++) {
      const frameBuffer = Buffer.from(frames[i].replace(/^data:image\/\w+;base64,/, ''), 'base64');
      const webpFrame = await sharp(frameBuffer)
        .resize(608, 128)
        .webp()
        .toBuffer();
        
      const frame = await WebP.Image.generateFrame({
        buffer: webpFrame,
        delay: i < frames.length - 10 ? 100 : 200
      });
      webpImage.frames.push(frame);
    }

    // Save with animation settings only (dimensions already set)
    const buffer = await webpImage.save(null, {
      loops: 0,
      bgColor: [0, 0, 0, 0],
    });

    res.setHeader('Content-Type', 'image/webp');
    res.send(buffer);
  } catch (error) {
    console.error('WebP generation failed:', error);
    res.status(500).json({ error: 'Failed to generate WebP' });
  }
}