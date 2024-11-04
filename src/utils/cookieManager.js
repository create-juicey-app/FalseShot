// utils/cookieManager.js
import fs from "fs";
import path from "path";

export function getCookies() {
  try {
    // Using Next.js's app directory structure
    const cookieFile = fs.readFileSync(
      path.join(process.cwd(), "src", "config", "cleancookies.json"),
      "utf8"
    );
    const cookies = JSON.parse(cookieFile);

    return cookies
      .map((cookie) => {
        return `${cookie.name}=${cookie.value}`;
      })
      .join("; ");
  } catch (error) {
    console.error("Error reading cookie file:", error);
    return "";
  }
}
