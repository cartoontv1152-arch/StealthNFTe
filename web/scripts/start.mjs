#!/usr/bin/env node
import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import nextEnv from "@next/env";

const require = createRequire(import.meta.url);
const projectDir = process.cwd();
const { loadEnvConfig } = nextEnv;

loadEnvConfig(projectDir, false);

const nextBin = require.resolve("next/dist/bin/next");
const child = spawn(process.execPath, [nextBin, "start", ...process.argv.slice(2)], {
  cwd: projectDir,
  env: process.env,
  stdio: "inherit",
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 0);
});
