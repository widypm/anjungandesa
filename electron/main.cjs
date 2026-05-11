const path = require("path");
const fs = require("fs");
const { app, BrowserWindow, dialog } = require("electron");
const { startNextServer } = require("./next-server.cjs");
const {
  APP_EXPIRY_DATE,
  APP_EXPIRY_MESSAGE,
  isAppExpired,
} = require("./app-expiry.cjs");

const isDev = process.env.ELECTRON_DEV === "1";
const appRoot = path.resolve(__dirname, "..");
const host = "127.0.0.1";
const port = Number(process.env.PORT || 8080);
const appIcon = path.join(appRoot, "build", "icons", "icon.png");

let mainWindow = null;
let nextServer = null;

function toPrismaFileUrl(filePath) {
  return `file:${filePath.replace(/\\\\/g, "/")}`;
}

function ensureWritableDirs() {
  const requiredDirs = [
    path.join(appRoot, "public", "uploads"),
    path.join(appRoot, "uploads", "private"),
    path.join(appRoot, "public", "wording"),
  ];

  for (const dir of requiredDirs) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function ensureSqliteDatabase() {
  const userDbPath = path.join(app.getPath("userData"), "anjungan-desa.db");
  const bundledDbPath = path.join(appRoot, "prisma", "dev.db");

  if (!fs.existsSync(userDbPath) && fs.existsSync(bundledDbPath)) {
    fs.copyFileSync(bundledDbPath, userDbPath);
  }

  return userDbPath;
}

async function createMainWindow() {
  ensureWritableDirs();
  process.chdir(appRoot);

  const userDataDir = app.getPath("userData");
  fs.mkdirSync(userDataDir, { recursive: true });
  process.env.DATABASE_URL = toPrismaFileUrl(ensureSqliteDatabase());

  nextServer = await startNextServer({
    appDir: appRoot,
    dev: isDev,
    hostname: host,
    port,
  });

  mainWindow = new BrowserWindow({
    width: 1440,
    height: 920,
    minWidth: 1024,
    minHeight: 720,
    autoHideMenuBar: true,
    icon: fs.existsSync(appIcon) ? appIcon : undefined,
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  await mainWindow.loadURL(nextServer.url);

  if (isDev) {
    mainWindow.webContents.openDevTools({ mode: "detach" });
  }
}

app.whenReady().then(async () => {
  try {
    if (isAppExpired()) {
      await dialog.showMessageBox({
        type: "warning",
        title: "Application Expired",
        message: APP_EXPIRY_MESSAGE,
        detail: `Application expired on ${APP_EXPIRY_DATE}.`,
      });
      app.quit();
      return;
    }

    await createMainWindow();
  } catch (error) {
    console.error("Failed to start desktop app", error);
    await dialog.showMessageBox({
      type: "error",
      title: "Startup Error",
      message: "Aplikasi gagal dijalankan.",
      detail: error instanceof Error ? error.stack || error.message : String(error),
    });
    app.quit();
  }
});

app.on("window-all-closed", async () => {
  if (nextServer) {
    await nextServer.close().catch(() => {});
    nextServer = null;
  }

  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", async () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    await createMainWindow();
  }
});
