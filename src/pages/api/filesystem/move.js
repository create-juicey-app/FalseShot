// pages/api/filesystem/move.js
import { getSafePath } from "../../../utils/filesystem";
import fs from "fs";
import path from "path";

/**
 * Handler for moving files and folders.
 * Supported Methods: POST
 */
export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { source, destination } = req.body;

  if (!source || !destination) {
    return res
      .status(400)
      .json({ error: "Source and destination are required" });
  }

  try {
    const safeSource = getSafePath(source);
    const safeDestination = getSafePath(destination);

    if (!fs.existsSync(safeSource)) {
      return res.status(404).json({ error: "Source does not exist" });
    }

    const stats = fs.lstatSync(safeSource);
    const baseName = path.basename(safeSource);
    const targetPath = path.join(safeDestination, baseName);

    // Prevent moving a directory into itself or its subdirectories
    if (safeSource.startsWith(targetPath)) {
      return res.status(400).json({
        error: "Cannot move a directory into itself or its subdirectories",
      });
    }

    // Perform the move operation
    fs.renameSync(safeSource, targetPath);

    res.status(200).json({ message: "Moved successfully" });
  } catch (error) {
    // Handle cases where fs.renameSync might fail (e.g., cross-device move)
    if (error.code === "EXDEV") {
      try {
        const safeSource = getSafePath(source);
        const safeDestination = getSafePath(destination);
        const baseName = path.basename(safeSource);
        const targetPath = path.join(safeDestination, baseName);

        if (fs.lstatSync(safeSource).isDirectory()) {
          fs.cpSync(safeSource, targetPath, { recursive: true });
          fs.rmSync(safeSource, { recursive: true, force: true });
        } else {
          fs.copyFileSync(safeSource, targetPath);
          fs.unlinkSync(safeSource);
        }

        return res.status(200).json({ message: "Moved successfully" });
      } catch (copyError) {
        console.error(copyError);
        return res
          .status(500)
          .json({ error: "Error moving items across devices" });
      }
    }

    console.error(error);
    res.status(400).json({ error: error.message });
  }
}
