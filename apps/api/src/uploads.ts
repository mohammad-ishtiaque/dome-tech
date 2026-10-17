import { fileURLToPath } from "node:url";

/** Where uploaded images are stored. On the VPS, set UPLOAD_DIR to a folder that is backed up. */
export const UPLOAD_DIR = process.env.UPLOAD_DIR || fileURLToPath(new URL("../uploads", import.meta.url));
