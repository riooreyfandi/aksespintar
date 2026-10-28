const serverless = require("serverless-http");

// app.bundle.js dibuat oleh scripts/build-netlify-function.mjs
const { app } = require("./lib/app.bundle.js");

const PREFIX = "/.netlify/functions/api";

const handler = serverless(app);

// Netlify bisa mengirim path asli (/api/v1/...) atau path function
// (/.netlify/functions/api/api/v1/...). Keduanya dinormalkan menjadi /api/v1/...
// agar cocok dengan router Express.
exports.handler = async (event, context) => {
  if (typeof event.path === "string" && event.path.startsWith(PREFIX)) {
    const stripped = event.path.slice(PREFIX.length);
    event.path = stripped.startsWith("/") ? stripped : `/${stripped}`;
  }

  // Sebagian event tidak membawa requestContext; lengkapi agar tidak error.
  if (!event.requestContext) {
    event.requestContext = { identity: { sourceIp: "127.0.0.1" }, requestId: "" };
  }

  return handler(event, context);
};

