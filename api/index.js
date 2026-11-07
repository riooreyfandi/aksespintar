// Vercel Serverless Function entry point
// Meneruskan semua request /api/* langsung ke aplikasi Express AksesPintar
const { app } = require("../aksespintar-backend/dist/app.js");

module.exports = app;
