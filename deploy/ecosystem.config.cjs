// PM2 processes for the Digital Dome website and API on the VPS.
// Dome uses ports 3100 and 4100 so it can share a server with other apps on the common 3000/8080.
// Both listen on 127.0.0.1 only; nginx is the public entry point.
//   pm2 startOrReload deploy/ecosystem.config.cjs && pm2 save
const path = require("node:path");

const root = path.resolve(__dirname, "..");

module.exports = {
  apps: [
    {
      name: "dome-api",
      cwd: path.join(root, "apps/api"),
      script: "src/index.ts",
      // Plain node with the tsx loader (PM2 would otherwise pick ts-node for a .ts file).
      interpreter: "node",
      // Secrets (MONGODB_URI, UPLOAD_DIR) live in apps/api/.env on the server, never in git.
      node_args: "--env-file-if-exists=.env --import tsx",
      env: { NODE_ENV: "production", HOST: "127.0.0.1", PORT: "4100" },
      max_memory_restart: "300M",
      time: true,
    },
    {
      name: "dome-web",
      cwd: path.join(root, "apps/web"),
      script: "node_modules/@react-router/serve/bin.cjs",
      args: "./build/server/index.js",
      env: {
        NODE_ENV: "production",
        HOST: "127.0.0.1",
        PORT: "3100",
        API_URL: "http://127.0.0.1:4100",
        SITE_URL: "https://somdigitaldome.com",
      },
      max_memory_restart: "300M",
      time: true,
    },
  ],
};
