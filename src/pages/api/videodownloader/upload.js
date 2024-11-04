import formidable from "formidable";
import path from "path";
import fs from "fs";
import ffmpeg from "fluent-ffmpeg";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const sendProgress = (progress, status) => {
    if (global.progressConnection) {
      global.progressConnection.write(
        `data: ${JSON.stringify({ progress, status })}\n\n`
      );
    }
  };

  try {
    sendProgress(10, "Starting upload...");

    const form = formidable({
      uploadDir: path.join(process.cwd(), "temp"),
      keepExtensions: true,
      progressInterval: 100,
    });

    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve([fields, files]);
      });
    });

    sendProgress(50, "Upload complete, processing...");

    const { targetSize } = fields;
    const file = files.file;

    if (targetSize && targetSize !== "original") {
      const compressedPath = path.join(
        process.cwd(),
        "temp",
        `${Date.now()}_compressed.mp4`
      );

      await new Promise((resolve, reject) => {
        ffmpeg(file.filepath)
          .output(compressedPath)
          .videoBitrate(targetSize * 8192)
          .on("progress", (progress) => {
            const progressValue = 50 + progress.percent * 0.5;
            sendProgress(progressValue, "Compressing video...");
          })
          .on("end", resolve)
          .on("error", reject)
          .run();
      });

      fs.unlinkSync(file.filepath);
      fs.renameSync(compressedPath, file.filepath);
    }

    sendProgress(100, "Preparing download...");

    const stat = fs.statSync(file.filepath);
    res.writeHead(200, {
      "Content-Length": stat.size,
      "Content-Type": "video/mp4",
      "Content-Disposition": `attachment; filename=${file.originalFilename}`,
    });

    fs.createReadStream(file.filepath).pipe(res);
    fs.unlinkSync(file.filepath);
  } catch (error) {
    console.error("Error:", error);
    sendProgress(0, "Error occurred");
    res.status(500).json({ error: "Failed to process upload" });
  }
}
