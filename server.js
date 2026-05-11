const path = require("path");
const { startNextServer } = require("./electron/next-server.cjs");

const dev = process.env.NODE_ENV !== "production";
const hostname = "127.0.0.1";
const port = Number(process.env.PORT || process.env.port || 8080);

startNextServer({
  appDir: path.resolve(__dirname),
  dev,
  hostname,
  port,
})
  .then(({ url }) => {
    console.log(`> Ready on ${url}`);
  })
  .catch((error) => {
    console.error("Failed to start server", error);
    process.exit(1);
  });
