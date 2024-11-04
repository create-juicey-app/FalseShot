import ytdl from "ytdl-core";
import ffmpeg from "fluent-ffmpeg";
import fs from "fs-extra";
import path from "path";
import { sendProgress } from "./progress";
import { getCookies } from "../../../utils/cookieManager";

export const config = {
  api: {
    responseLimit: false,
    bodyParser: {
      sizeLimit: "50mb", // Adjusted size limit
    },
  },
};

async function ensureTempDir() {
  const tempDir = path.join(process.cwd(), "public", "temp");
  await fs.ensureDir(tempDir);
  return tempDir;
}

function formatCookies(cookiesString) {
  if (!cookiesString) return {};

  return cookiesString.split(";").reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split("=");
    if (key && value) {
      acc[key] = value;
    }
    return acc;
  }, {});
}

async function downloadYouTubeVideo(url, outputPath) {
  return new Promise((resolve, reject) => {
    let lastProgress = 0;
    const cookiesString = getCookies();
    const cookies = formatCookies(cookiesString);

    const options = {
      quality: "highest",
      filter: (format) => format.container === "mp4",
      requestOptions: {
        headers: {
          Cookie: cookiesString,
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.101 Safari/537.36",
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
          "Accept-Language": "en-US,en;q=0.9",
          Connection: "keep-alive",
          Referer: "https://www.youtube.com/",
          "sec-fetch-dest": "document",
          "sec-fetch-mode": "navigate",
          "sec-fetch-site": "none",
          "sec-fetch-user": "?1",
          "upgrade-insecure-requests": "1",
        },
      },
    };

    // Get video info first
    ytdl
      .getInfo(url, {
        requestOptions: options.requestOptions,
      })
      .then((info) => {
        const format = ytdl.chooseFormat(info.formats, {
          quality: "highest",
          filter: (format) => format.container === "mp4",
        });

        if (!format) {
          return reject(new Error("No suitable format found"));
        }

        const videoStream = ytdl.downloadFromInfo(info, {
          ...options,
          format: format,
        });

        const writeStream = fs.createWriteStream(outputPath);

        videoStream.pipe(writeStream);

        videoStream.on("progress", (_, downloaded, total) => {
          const percent = (downloaded / total) * 100;
          if (percent - lastProgress >= 1) {
            lastProgress = percent;
            sendProgress({
              progress: Math.min(percent, 100),
              status: `Downloading: ${percent.toFixed(1)}%`,
            });
          }
        });

        writeStream.on("finish", resolve);
        videoStream.on("error", reject);
        writeStream.on("error", reject);
      })
      .catch(reject);
  });
}

async function compressVideo(inputPath, outputPath, targetSize) {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .output(outputPath)
      .videoBitrate(`${targetSize}k`)
      .on("progress", (progress) => {
        sendProgress({
          progress: Math.min(progress.percent + 50, 100),
          status: `Compressing: ${progress.percent.toFixed(1)}%`,
        });
      })
      .on("end", resolve)
      .on("error", reject)
      .run();
  });
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { url, targetSize } = req.body;

  if (!url) {
    return res.status(400).json({ error: "URL is required" });
  }

  let tempDir;
  let outputPath;
  let compressedPath;

  try {
    // Validate YouTube URL
    if (!ytdl.validateURL(url)) {
      throw new Error("Invalid YouTube URL");
    }

    tempDir = await ensureTempDir();
    const videoId = Date.now();
    outputPath = path.join(tempDir, `${videoId}.mp4`);
    compressedPath = path.join(tempDir, `${videoId}_compressed.mp4`);

    sendProgress({ progress: 0, status: "Starting download..." });

    await downloadYouTubeVideo(url, outputPath);
    sendProgress({ progress: 50, status: "Download complete" });

    if (targetSize && targetSize !== "original") {
      await compressVideo(outputPath, compressedPath, targetSize * 8192);
      await fs.remove(outputPath);
      await fs.move(compressedPath, outputPath);
    }

    sendProgress({ progress: 100, status: "Preparing download..." });

    const stat = await fs.stat(outputPath);
    res.writeHead(200, {
      "Content-Length": stat.size,
      "Content-Type": "video/mp4",
      "Content-Disposition": `attachment; filename=video_${videoId}.mp4`,
    });

    const readStream = fs.createReadStream(outputPath);
    await new Promise((resolve, reject) => {
      readStream.pipe(res);
      readStream.on("end", resolve);
      readStream.on("error", reject);
    });

    await fs.remove(outputPath);
  } catch (error) {
    console.error("Error:", error);
    sendProgress({ progress: 0, status: "Error occurred" });

    try {
      if (outputPath && (await fs.pathExists(outputPath))) {
        await fs.remove(outputPath);
      }
      if (compressedPath && (await fs.pathExists(compressedPath))) {
        await fs.remove(compressedPath);
      }
    } catch (cleanupError) {
      console.error("Cleanup error:", cleanupError);
    }

    return res.status(500).json({
      error: "Failed to process video",
      details: error.message,
    });
  }
}
