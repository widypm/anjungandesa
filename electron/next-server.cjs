const { createServer } = require("http");
const { parse } = require("url");
const path = require("path");
const next = require("next");
const {
  APP_EXPIRY_DATE,
  APP_EXPIRY_MESSAGE,
  isAppExpired,
} = require("./app-expiry.cjs");

function renderExpiredResponse(req, res) {
  const isApiRequest = (req.url || "").startsWith("/api");

  if (isApiRequest) {
    res.statusCode = 403;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.end(
      JSON.stringify({
        message: APP_EXPIRY_MESSAGE,
        expiredAt: APP_EXPIRY_DATE,
      }),
    );
    return;
  }

  res.statusCode = 403;
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.end(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Application Expired</title>
    <style>
      body { margin: 0; font-family: Arial, sans-serif; background: #f5f1e8; color: #1f2937; }
      .wrap { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 24px; }
      .card { max-width: 480px; text-align: center; background: #fff; border: 1px solid #d1d5db; border-radius: 20px; padding: 32px; box-shadow: 0 20px 50px rgba(0,0,0,.08); }
      h1 { margin: 0 0 12px; font-size: 28px; }
      p { margin: 0; font-size: 16px; line-height: 1.6; }
      .date { margin-top: 12px; color: #6b7280; font-size: 14px; }
    </style>
  </head>
  <body>
    <div class="wrap">
      <div class="card">
        <h1>${APP_EXPIRY_MESSAGE}</h1>
        <p>This application is no longer available.</p>
        <p class="date">Expired on ${APP_EXPIRY_DATE}</p>
      </div>
    </div>
  </body>
</html>`);
}

async function startNextServer(options = {}) {
  const dev = Boolean(options.dev);
  const hostname = options.hostname || "127.0.0.1";
  const port = Number(options.port || process.env.PORT || 8080);
  const appDir = options.appDir || path.resolve(__dirname, "..");

  const app = next({
    dev,
    dir: appDir,
    hostname,
    port,
  });

  const handle = app.getRequestHandler();

  await app.prepare();

  const server = createServer(async (req, res) => {
    try {
      if (isAppExpired()) {
        renderExpiredResponse(req, res);
        return;
      }

      const parsedUrl = parse(req.url, true);
      const { pathname, query } = parsedUrl;

      if (pathname === "/a") {
        await app.render(req, res, "/a", query);
        return;
      }

      if (pathname === "/b") {
        await app.render(req, res, "/b", query);
        return;
      }

      await handle(req, res, parsedUrl);
    } catch (error) {
      console.error("Error occurred handling", req.url, error);
      res.statusCode = 500;
      res.end("internal server error");
    }
  });

  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(port, hostname, () => {
      server.off("error", reject);
      resolve();
    });
  });

  return {
    app,
    server,
    port,
    hostname,
    url: `http://${hostname}:${port}`,
    close: () =>
      new Promise((resolve, reject) => {
        server.close((error) => {
          if (error) {
            reject(error);
            return;
          }

          resolve();
        });
      }),
  };
}

module.exports = {
  startNextServer,
};
