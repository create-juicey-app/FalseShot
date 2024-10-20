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
    // Handle multiple sources for clipboard paste
    const sources = Array.isArray(source) ? source : [source];
    const safeDestination = getSafePath(destination);

    if (!fs.existsSync(safeDestination)) {
      return res.status(404).json({ error: "Destination does not exist" });
    }

    sources.forEach((src) => {
      const safeSrc = getSafePath(src);
      if (!fs.existsSync(safeSrc)) {
        throw new Error(`Source does not exist: ${src}`);
      }

      const stats = fs.lstatSync(safeSrc);
      const baseName = path.basename(safeSrc);
      const targetPath = path.join(safeDestination, baseName);

      if (stats.isDirectory()) {
        fs.cpSync(safeSrc, targetPath, { recursive: true });
      } else {
        fs.copyFileSync(safeSrc, targetPath);
      }
    });

    res.status(200).json({ message: "Copied successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}
