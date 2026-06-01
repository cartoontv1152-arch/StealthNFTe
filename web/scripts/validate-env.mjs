#!/usr/bin/env node
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const strict = process.argv.includes("--strict") || process.env.STRICT_ENV === "1";
const env = {
  ...readEnvFile(resolve(process.cwd(), ".env")),
  ...readEnvFile(resolve(process.cwd(), ".env.local")),
  ...process.env,
};

const required = [
  "NEXT_PUBLIC_SEPOLIA_RPC_URL",
  "NEXT_PUBLIC_NFT_ADDRESS",
  "NEXT_PUBLIC_MARKETPLACE_ADDRESS",
];

const warnings = [];
const errors = [];

for (const key of required) {
  if (!env[key]) {
    (strict ? errors : warnings).push(`${key} is missing.`);
  }
}

for (const key of ["NEXT_PUBLIC_NFT_ADDRESS", "NEXT_PUBLIC_MARKETPLACE_ADDRESS"]) {
  if (env[key] && !/^0x[a-fA-F0-9]{40}$/.test(env[key])) {
    errors.push(`${key} is not a valid EVM address.`);
  }
}

if (!env.NEXT_PUBLIC_MARKETPLACE_DEPLOYMENT_BLOCK && !env.NEXT_PUBLIC_DEPLOYMENT_BLOCK) {
  (strict ? errors : warnings).push("NEXT_PUBLIC_MARKETPLACE_DEPLOYMENT_BLOCK is missing; marketplace activity will use supply fallback.");
}

const hasPinataJwt = Boolean(env.PINATA_JWT && !env.PINATA_JWT.startsWith("your_"));
const hasPinataKeypair = Boolean(env.PINATA_API_KEY && env.PINATA_API_SECRET);

if (!hasPinataJwt && !hasPinataKeypair) {
  warnings.push("Pinata credentials are missing; file upload will require users to paste an existing off-chain image URL.");
}

if (env.PINATA_JWT && env.PINATA_JWT.startsWith("your_")) {
  errors.push("PINATA_JWT appears to be a placeholder.");
}

if ((env.PINATA_API_KEY && !env.PINATA_API_SECRET) || (!env.PINATA_API_KEY && env.PINATA_API_SECRET)) {
  errors.push("PINATA_API_KEY and PINATA_API_SECRET must be configured together.");
}

if (errors.length > 0) {
  console.error("Environment validation failed:");
  for (const message of errors) {
    console.error(`- ${message}`);
  }
  process.exit(1);
}

if (warnings.length > 0) {
  console.warn("Environment validation warnings:");
  for (const message of warnings) {
    console.warn(`- ${message}`);
  }
} else {
  console.log("Environment validation passed.");
}

function readEnvFile(path) {
  if (!existsSync(path)) {
    return {};
  }

  return Object.fromEntries(
    readFileSync(path, "utf8")
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#") && line.includes("="))
      .map((line) => {
        const index = line.indexOf("=");
        const key = line.slice(0, index).trim();
        const value = line.slice(index + 1).trim().replace(/^["']|["']$/g, "");
        return [key, value];
      })
  );
}
