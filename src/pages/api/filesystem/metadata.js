// pages/api/filesystem/metadata.js
import { getSafePath } from "../../../utils/filesystem";
import fs from "fs";
import path from "path";

/**
 * Handler for fetching metadata of a file or folder.
 * Supported Methods: GET
 */
export default function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { path: itemPath } = req.query;

  if (!itemPath) {
    return res.status(400).json({ error: "Path parameter is required" });
  }

  try {
    const safePath = getSafePath(itemPath);

    if (!fs.existsSync(safePath)) {
      return res.status(404).json({ error: "Item does not exist" });
    }

    const stats = fs.lstatSync(safePath);
    const metadata = {
      name: path.basename(safePath),
      path: itemPath,
      type: stats.isDirectory() ? "folder" : "file",
      size: stats.isDirectory() ? null : `${Math.round(stats.size / 1024)} KB`,
      lastModified: stats.mtime.toISOString(),
      createdAt: stats.birthtime.toISOString(),
      permissions: stats.mode,
    };

    res.status(200).json({ metadata });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
}
