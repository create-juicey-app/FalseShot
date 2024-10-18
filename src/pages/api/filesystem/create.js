// pages/api/filesystem/create.js
import { getSafePath, isValidName } from "../../../utils/filesystem";
import fs from "fs";
import path from "path";


export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { dir = "/", name, type } = req.body;

  if (!name || !type || !["file", "folder"].includes(type)) {
    return res.status(400).json({ error: "Invalid parameters" });
  }

  if (!isValidName(name)) {
    return res.status(400).json({ error: "Invalid name" });
  }

  try {
    const safeDir = getSafePath(dir);
    const newPath = path.join(safeDir, name);

    if (type === "file") {
      fs.writeFileSync(newPath, ""); // Creates an empty file
    } else if (type === "folder") {
      fs.mkdirSync(newPath);
    }

    res.status(201).json({ message: `${type} created` });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}
