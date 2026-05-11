const path = require("path");
const { loadEnvConfig } = require("@next/env");

loadEnvConfig(path.resolve(__dirname, ".."));

const APP_EXPIRY_DATE = process.env.APP_EXPIRY_DATE || "2026-03-23";
const APP_EXPIRY_MESSAGE =
  process.env.APP_EXPIRY_MESSAGE || "Please contact administrator";

function getExpiryStart() {
  return new Date(`${APP_EXPIRY_DATE}T00:00:00+07:00`);
}

function isAppExpired(now = new Date()) {
  return now.getTime() >= getExpiryStart().getTime();
}

module.exports = {
  APP_EXPIRY_DATE,
  APP_EXPIRY_MESSAGE,
  isAppExpired,
};
