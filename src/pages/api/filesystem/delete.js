// pages/api/filesystem/delete.js
import { getSafePath } from "../../../utils/filesystem";
import fs from "fs";
import path from "path";

export default function handler(req, res) {
  if (req.method !== "DELETE") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { path: targetPath } = req.body;

  if (!targetPath) {
    return res.status(400).json({ error: "Path is required" });
  }

  try {
    const safePath = getSafePath(targetPath);

    if (!fs.existsSync(safePath)) {
      return res.status(404).json({ error: "File or folder does not exist" });
    }

    const stats = fs.lstatSync(safePath);
    if (stats.isDirectory()) {
      fs.rmdirSync(safePath, { recursive: true });
    } else {
      fs.unlinkSync(safePath);
    }

    res.status(200).json({ message: "Deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}
