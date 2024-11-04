// pages/api/videodownloader/progress.js
export const config = {
  api: {
    bodyParser: false,
  },
};

const clients = new Set();

export function sendProgress(data) {
  clients.forEach((client) => {
    client.res.write(`data: ${JSON.stringify(data)}\n\n`);
  });
}

export default function handler(req, res) {
  if (req.method === "GET") {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.flushHeaders();

    const clientId = Date.now();
    const newClient = {
      id: clientId,
      res,
    };

    clients.add(newClient);

    // Send initial connection success
    res.write(
      `data: ${JSON.stringify({ progress: 0, status: "Connected" })}\n\n`
    );

    // Keep connection alive
    const keepAlive = setInterval(() => {
      res.write(": keepalive\n\n");
    }, 30000);

    // Remove client when they disconnect
    req.on("close", () => {
      clients.delete(newClient);
      clearInterval(keepAlive);
    });
  } else {
    res.status(405).end();
  }
}
