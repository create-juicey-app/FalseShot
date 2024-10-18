// pages/api/filesystem/list.js
import { getSafePath } from "../../../utils/filesystem";
import fs from "fs";
import path from "path";

export default function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { dir = "/" } = req.query;

  try {
    const safeDir = getSafePath(dir);
    const items = fs
      .readdirSync(safeDir, { withFileTypes: true })
      .map((dirent) => ({
        name: dirent.name,
        isDirectory: dirent.isDirectory(),
      }));
    res.status(200).json({ path: dir, items });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}
