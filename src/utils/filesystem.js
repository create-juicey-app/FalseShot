// utils/filesystem.js
const path = require("path");
const fs = require("fs");

const BASE_DIR = path.resolve("filesystem"); // Change this to your desired base directory

// Ensure the user cannot access files outside the BASE_DIR
function getSafePath(relativePath) {
  const safePath = path.normalize(path.join(BASE_DIR, relativePath));
  if (!safePath.startsWith(BASE_DIR)) {
    throw new Error("Invalid path");
  }
  return safePath;
}

// Validate file and folder names
function isValidName(name) {
  // Simple regex to check for invalid characters, adjust as needed
  return /^[^<>:"/\\|?*\x00-\x1F]+$/.test(name);
}

module.exports = {
  getSafePath,
  isValidName,
};
