import { spawn } from "node:child_process";
import { rm } from "node:fs/promises";
import { setTimeout as delay } from "node:timers/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const env = {
  ...process.env,
  THRONEERA_ALLOW_MOCK_CHECKOUT: "true",
  THRONEERA_LOCAL_STORE_PATH: ".throneera/e2e-store.json",
  META_PIXEL_ID: "test_pixel",
};

await rm(join(root, ".throneera", "e2e-store.json"), { force: true });

const server = spawn(
  process.execPath,
  [join(root, "node_modules", "next", "dist", "bin", "next"), "start", "--hostname", "127.0.0.1", "--port", "3000"],
  {
    cwd: root,
    env,
    stdio: "inherit",
  },
);

let shuttingDown = false;

async function stopServer() {
  if (shuttingDown) {
    return;
  }

  shuttingDown = true;
  if (!server.killed) {
    server.kill();
  }
}

process.on("SIGINT", () => {
  void stopServer().then(() => process.exit(130));
});
process.on("SIGTERM", () => {
  void stopServer().then(() => process.exit(143));
});

try {
  await waitForReady();
  const status = await runPlaywright();
  await stopServer();
  process.exit(status);
} catch (error) {
  await stopServer();
  console.error(error);
  process.exit(1);
}

async function waitForReady() {
  for (let attempt = 0; attempt < 90; attempt += 1) {
    if (server.exitCode !== null) {
      throw new Error(`next start exited early with code ${server.exitCode}`);
    }

    try {
      const response = await fetch("http://127.0.0.1:3000/queen");
      if (response.ok) {
        return;
      }
    } catch {
      // Server is still starting.
    }

    await delay(1_000);
  }

  throw new Error("Timed out waiting for next start");
}

function runPlaywright() {
  return new Promise((resolve) => {
    const child = spawn(
      process.execPath,
      [join(root, "node_modules", "@playwright", "test", "cli.js"), "test"],
      {
        cwd: root,
        env: {
          ...env,
          PLAYWRIGHT_SKIP_WEB_SERVER: "1",
        },
        stdio: "inherit",
      },
    );

    child.on("exit", (code) => resolve(code ?? 1));
  });
}
