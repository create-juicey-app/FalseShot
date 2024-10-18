// utils/filesystem.js
const path = require("path");
const fs = require("fs");

const BASE_DIR = path.resolve("filesystem"); // Define your base directory here

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
  // Adjust the regex as needed for your requirements
  return /^[^<>:"/\\|?*\x00-\x1F]+$/.test(name);
}

module.exports = {
  getSafePath,
  isValidName,
};