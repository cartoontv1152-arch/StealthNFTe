import hre from "hardhat";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with:", deployer.address);

  const StealthNFT = await hre.ethers.getContractFactory("StealthNFT");
  const nft = await StealthNFT.deploy();
  await nft.waitForDeployment();
  const nftReceipt = await nft.deploymentTransaction()?.wait();
  const nftAddr = await nft.getAddress();
  console.log("StealthNFT:", nftAddr);

  const StealthMarketplace = await hre.ethers.getContractFactory("StealthMarketplace");
  const market = await StealthMarketplace.deploy(nftAddr);
  await market.waitForDeployment();
  const marketReceipt = await market.deploymentTransaction()?.wait();
  const marketAddr = await market.getAddress();
  console.log("StealthMarketplace:", marketAddr);
  const deploymentBlock = Math.min(
    nftReceipt?.blockNumber || Number.MAX_SAFE_INTEGER,
    marketReceipt?.blockNumber || Number.MAX_SAFE_INTEGER
  );

  const deployment = {
    network: hre.network.name,
    chainId: Number((await hre.ethers.provider.getNetwork()).chainId),
    deployer: deployer.address,
    deploymentBlock: deploymentBlock === Number.MAX_SAFE_INTEGER ? undefined : deploymentBlock,
    contracts: {
      StealthNFT: nftAddr,
      StealthMarketplace: marketAddr,
    },
    transactions: {
      StealthNFT: nft.deploymentTransaction()?.hash,
      StealthMarketplace: market.deploymentTransaction()?.hash,
    },
  };

  const deploymentDir = join(__dirname, "..", "deployments");
  await mkdir(deploymentDir, { recursive: true });
  await writeFile(join(deploymentDir, `${hre.network.name}.json`), `${JSON.stringify(deployment, null, 2)}\n`);

  console.log("\nAdd to web/.env.local:");
  console.log(`NEXT_PUBLIC_NFT_ADDRESS=${nftAddr}`);
  console.log(`NEXT_PUBLIC_MARKETPLACE_ADDRESS=${marketAddr}`);
  if (deployment.deploymentBlock) {
    console.log(`NEXT_PUBLIC_MARKETPLACE_DEPLOYMENT_BLOCK=${deployment.deploymentBlock}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
