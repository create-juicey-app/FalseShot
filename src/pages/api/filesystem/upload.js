// src/pages/api/filesystem/upload.js
import { getSafePath } from "../../../utils/filesystem";
import fs from "fs";
import path from "path";
import { IncomingForm } from "formidable";

// Disable Next.js default body parsing to handle form data
export const config = {
  api: {
    bodyParser: false,
  },
};

/**
 * Helper function to sanitize file names
 * Prevents directory traversal and other potential vulnerabilities.
 */
const sanitizeFileName = (fileName) => {
  return path.basename(fileName).replace(/[^a-zA-Z0-9.-_]/g, "_");
};

/**
 * Moves a file from source to target.
 * If fs.renameSync fails due to EXDEV, falls back to copy and delete.
 * @param {string} source - The source file path.
 * @param {string} target - The target file path.
 */
const moveFile = (source, target) => {
  try {
    fs.renameSync(source, target);
  } catch (err) {
    if (err.code === "EXDEV") {
      // If cross-device, copy and delete
      fs.copyFileSync(source, target);
      fs.unlinkSync(source);
    } else {
      throw err; // Re-throw if it's a different error
    }
  }
};

/**
 * Handler for uploading files.
 * Supported Methods: POST
 */
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const form = new IncomingForm();

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("Error parsing form:", err);
      return res.status(500).json({ error: "Error parsing the files" });
    }

    let { dir } = fields;

    if (!dir) {
      return res
        .status(400)
        .json({ error: "Destination directory is required" });
    }

    // Ensure 'dir' is a string (handle if it's an array)
    dir = Array.isArray(dir) ? dir[0] : dir;

    if (typeof dir !== "string") {
      return res.status(400).json({ error: "Invalid directory path" });
    }

    let safeDir;
    try {
      safeDir = getSafePath(dir);
    } catch (error) {
      console.error("Invalid path:", error);
      return res.status(400).json({ error: "Invalid directory path" });
    }

    if (!fs.existsSync(safeDir)) {
      return res
        .status(404)
        .json({ error: "Destination directory does not exist" });
    }

    // Handle both single and multiple file uploads
    const uploadedFiles = Array.isArray(files.file) ? files.file : [files.file];

    try {
      for (const file of uploadedFiles) {
        const tempPath = file.filepath; // 'filepath' is correct in formidable v3
        let fileName = file.originalFilename; // 'originalFilename' is correct

        // Sanitize the file name
        fileName = sanitizeFileName(fileName);

        const targetPath = path.join(safeDir, fileName);

        // Check if file already exists
        if (fs.existsSync(targetPath)) {
          // Decide whether to skip, overwrite, or rename. Here, we'll skip.
          console.warn(`File "${fileName}" already exists. Skipping upload.`);
          continue; // Skip to next file
          // Alternatively, you can throw an error to stop the entire upload.
          // throw new Error(`File "${fileName}" already exists.`);
        }

        // Move the file from temp to target directory
        moveFile(tempPath, targetPath);
      }

      res.status(200).json({ message: "Files uploaded successfully" });
    } catch (error) {
      console.error("Error processing upload:", error);
      return res.status(500).json({ error: "Error processing the files" });
    }
  });
}
