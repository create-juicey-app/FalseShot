// pages/api/filesystem/copy.js
import { getSafePath, isValidName } from "../../../utils/filesystem";
import fs from "fs";
import path from "path";

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

    if (stats.isDirectory()) {
      fs.cpSync(safeSource, targetPath, { recursive: true });
    } else {
      fs.copyFileSync(safeSource, targetPath);
    }

    res.status(200).json({ message: "Copied successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}
