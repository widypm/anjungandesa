const { spawn } = require("child_process");

const electronBinary = require("electron");
const mode = process.argv[2] || "dev";
const env = {
  ...process.env,
  ELECTRON_DEV: mode === "dev" ? "1" : "0",
};

delete env.ELECTRON_RUN_AS_NODE;

const child = spawn(electronBinary, ["."], {
  stdio: "inherit",
  env,
});

child.on("exit", (code) => {
  process.exit(code ?? 0);
});
