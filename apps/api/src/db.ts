import mongoose from "mongoose";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const DATA_DIR = fileURLToPath(new URL("../.data", import.meta.url));
const DB_PATH = `${DATA_DIR}/db`;
const URI_FILE = `${DATA_DIR}/mongo-uri.txt`; // address of the running local MongoDB
const PREFERRED_PORT = 27027;

async function tryConnect(uri: string) {
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 1500 });
    return true;
  } catch {
    await mongoose.disconnect().catch(() => {});
    return false;
  }
}

/**
 * Connects to MongoDB. With MONGODB_URI set (production / VPS) it uses that database.
 * Without it (local development) it starts a local MongoDB from the mongodb-memory-server
 * package and keeps the data in apps/api/.data, so nothing needs to be installed.
 * If that local MongoDB is already running (another terminal, `pnpm seed`, `pnpm create-admin`),
 * it connects to it instead of starting a second one.
 */
export async function connectDb() {
  if (process.env.MONGODB_URI) {
    await mongoose.connect(process.env.MONGODB_URI);
    return;
  }

  const known = existsSync(URI_FILE) ? readFileSync(URI_FILE, "utf8").trim() : "";
  for (const uri of [known, `mongodb://127.0.0.1:${PREFERRED_PORT}/dome`].filter(Boolean)) {
    if (await tryConnect(uri)) {
      console.log("Connected to the local development MongoDB that was already running.");
      return;
    }
  }

  const { MongoMemoryServer } = await import("mongodb-memory-server");
  mkdirSync(DB_PATH, { recursive: true });
  let server;
  try {
    server = await MongoMemoryServer.create({ instance: { dbPath: DB_PATH, storageEngine: "wiredTiger", port: PREFERRED_PORT } });
  } catch (err) {
    if (/DBPathInUse|lock file/i.test(String(err))) {
      console.error(`\nThe local database is locked by another MongoDB process that is not responding.\n` +
        `Close other terminals running the API, or end the "mongod" process in Task Manager, then try again.\n`);
      process.exit(1);
    }
    throw err;
  }
  const uri = server.getUri("dome");
  writeFileSync(URI_FILE, uri);
  await mongoose.connect(uri);
  const stop = async () => {
    rmSync(URI_FILE, { force: true });
    await mongoose.disconnect();
    await server.stop({ doCleanup: false });
    process.exit(0);
  };
  process.once("SIGINT", stop);
  process.once("SIGTERM", stop);
  console.log(`Local development MongoDB running (data: apps/api/.data)`);
}
