import hre from "hardhat";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

type DeploymentFile = {
  contracts: {
    StealthNFT: string;
    StealthMarketplace: string;
  };
};

async function main() {
  const deployment = JSON.parse(
    await readFile(join(__dirname, "..", "deployments", `${hre.network.name}.json`), "utf8")
  ) as DeploymentFile;

  const nft = deployment.contracts.StealthNFT;
  const marketplace = deployment.contracts.StealthMarketplace;

  await verify("StealthNFT", nft, []);
  await verify("StealthMarketplace", marketplace, [nft]);
}

async function verify(name: string, address: string, constructorArguments: unknown[]) {
  try {
    console.log(`Verifying ${name}: ${address}`);
    await hre.run("verify:verify", {
      address,
      constructorArguments,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message.toLowerCase().includes("already verified")) {
      console.log(`${name} already verified.`);
      return;
    }

    throw error;
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
