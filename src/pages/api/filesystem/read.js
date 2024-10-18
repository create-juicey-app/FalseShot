// pages/api/filesystem/read.js
import { getSafePath } from "../../../utils/filesystem";
import fs from "fs";
import path from "path";
import mime from "mime-types";

/**
 * Handler for reading files.
 * Supported Methods: GET
 * Query Parameters:
 *  - filePath: string (path to the file relative to the base directory)
 */
export default function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { filePath } = req.query;

  if (!filePath) {
    return res.status(400).json({ error: "File path is required" });
  }

  let safePath;
  try {
    safePath = getSafePath(filePath);
  } catch (error) {
    console.error("Invalid path:", error);
    return res.status(400).json({ error: "Invalid file path" });
  }

  if (!fs.existsSync(safePath)) {
    return res.status(404).json({ error: "File does not exist" });
  }

  const fileStat = fs.lstatSync(safePath);
  if (!fileStat.isFile()) {
    return res.status(400).json({ error: "Path is not a file" });
  }

  const ext = path.extname(safePath).toLowerCase();
  const mimeType = mime.lookup(ext) || "application/octet-stream";

  // For text files, read and return the content
  if (mimeType.startsWith("text/") || mimeType === "application/json") {
    try {
      const content = fs.readFileSync(safePath, "utf-8");
      return res.status(200).json({
        filePath: filePath,
        mimeType: mimeType,
        content: content,
      });
    } catch (error) {
      console.error("Error reading file:", error);
      return res.status(500).json({ error: "Error reading the file" });
    }
  }

  // For binary files (like images, PDFs), send the file as a buffer encoded in base64
  try {
    const fileBuffer = fs.readFileSync(safePath);
    const base64Data = fileBuffer.toString("base64");
    return res.status(200).json({
      filePath: filePath,
      mimeType: mimeType,
      data: base64Data,
    });
  } catch (error) {
    console.error("Error reading file:", error);
    return res.status(500).json({ error: "Error reading the file" });
  }
}
