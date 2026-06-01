import hre from "hardhat";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { Encryptable } from "@cofhe/sdk";
import { Ethers6Adapter } from "@cofhe/sdk/adapters";
import { chains } from "@cofhe/sdk/chains";
import { createCofheClient, createCofheConfig } from "@cofhe/sdk/node";
import { getAddress, parseEther, type AbstractSigner } from "ethers";

type DeploymentFile = {
  contracts: {
    StealthNFT: string;
    StealthMarketplace: string;
  };
};

function normalizeDecryptedAddress(value: unknown): string {
  if (typeof value === "string") {
    return getAddress(value);
  }

  const bigintValue = BigInt(value as bigint);
  return getAddress(`0x${bigintValue.toString(16).padStart(40, "0").slice(-40)}`);
}

async function createClientFor(signer: AbstractSigner) {
  const config = createCofheConfig({
    environment: "node",
    supportedChains: [chains.sepolia],
  });
  const client = createCofheClient(config);
  const { publicClient, walletClient } = await Ethers6Adapter(hre.ethers.provider, signer);
  await client.connect(publicClient as never, walletClient as never);
  return client;
}

async function mintAndList(
  nft: Awaited<ReturnType<typeof hre.ethers.getContractAt>>,
  marketplace: Awaited<ReturnType<typeof hre.ethers.getContractAt>>,
  seller: Awaited<ReturnType<typeof hre.ethers.getSigners>>[number],
  sellerClient: Awaited<ReturnType<typeof createClientFor>>,
  label: string,
  reserve: bigint
) {
  const tokenId = await nft.nextTokenId();
  const uri = `data:application/json,${encodeURIComponent(JSON.stringify({
    name: `Live Smoke ${label}`,
    description: "On-chain smoke test token for StealthNFT.",
    image: "https://picsum.photos/seed/stealth-live-smoke/720/720",
  }))}`;

  await (await nft.connect(seller).mintWithRoyalty(seller.address, uri, seller.address, 500)).wait();
  await (await nft.connect(seller).approve(await marketplace.getAddress(), tokenId)).wait();

  const [encryptedReserve] = await sellerClient.encryptInputs([Encryptable.uint64(reserve)]).execute();
  await (await marketplace.connect(seller).listNFT(tokenId, encryptedReserve)).wait();
  console.log(`listed token #${tokenId.toString()} with encrypted reserve`);
  return tokenId as bigint;
}

async function main() {
  const deployment = JSON.parse(
    await readFile(join(__dirname, "..", "deployments", `${hre.network.name}.json`), "utf8")
  ) as DeploymentFile;

  const [seller] = await hre.ethers.getSigners();
  const buyer = hre.ethers.Wallet.createRandom().connect(hre.ethers.provider);
  const fundAmount = parseEther(process.env.LIVE_SMOKE_BUYER_FUNDS || "0.05");

  console.log("seller:", seller.address);
  console.log("buyer:", buyer.address);
  await (await seller.sendTransaction({ to: buyer.address, value: fundAmount })).wait();
  console.log(`funded buyer with ${hre.ethers.formatEther(fundAmount)} ETH`);

  const nft = await hre.ethers.getContractAt("StealthNFT", deployment.contracts.StealthNFT);
  const marketplace = await hre.ethers.getContractAt("StealthMarketplace", deployment.contracts.StealthMarketplace);
  const sellerClient = await createClientFor(seller);
  const buyerClient = await createClientFor(buyer);
  const bidBond = await marketplace.MIN_BID_BOND();

  const noSaleTokenId = await mintAndList(nft, marketplace, seller, sellerClient, "No Sale", parseEther("0.002"));
  const [belowReserveOffer] = await buyerClient.encryptInputs([Encryptable.uint64(parseEther("0.001"))]).execute();
  await (await marketplace.connect(buyer).submitSealedOffer(noSaleTokenId, belowReserveOffer, { value: bidBond })).wait();
  await (await marketplace.connect(seller).prepareSaleReveal(noSaleTokenId)).wait();
  const noSaleHandles = await marketplace.getSettlementHandles(noSaleTokenId);
  const noSaleBuyerResult = await sellerClient.decryptForTx(noSaleHandles[1]).withoutPermit().execute();
  const noSaleBuyer = normalizeDecryptedAddress(noSaleBuyerResult.decryptedValue);
  await (await marketplace.connect(seller).closeNoSale(noSaleTokenId, noSaleBuyer, noSaleBuyerResult.signature)).wait();
  await (await marketplace.connect(buyer).withdrawBidBond(noSaleTokenId)).wait();
  console.log(`closed no-sale token #${noSaleTokenId.toString()} and withdrew bidder bond`);

  const saleTokenId = await mintAndList(nft, marketplace, seller, sellerClient, "Sale", parseEther("0.002"));
  const winningOffer = parseEther("0.003");
  const [encryptedWinningOffer] = await buyerClient.encryptInputs([Encryptable.uint64(winningOffer)]).execute();
  await (await marketplace.connect(buyer).submitSealedOffer(saleTokenId, encryptedWinningOffer, { value: bidBond })).wait();
  await (await marketplace.connect(seller).prepareSaleReveal(saleTokenId)).wait();
  const saleHandles = await marketplace.getSettlementHandles(saleTokenId);
  const [offerResult, buyerResult] = await Promise.all([
    buyerClient.decryptForTx(saleHandles[0]).withoutPermit().execute(),
    buyerClient.decryptForTx(saleHandles[1]).withoutPermit().execute(),
  ]);
  const buyerPlain = normalizeDecryptedAddress(buyerResult.decryptedValue);
  await (
    await marketplace
      .connect(buyer)
      .finalizeSale(saleTokenId, buyerPlain, buyerResult.signature, offerResult.decryptedValue, offerResult.signature, {
        value: offerResult.decryptedValue,
      })
  ).wait();

  const owner = await nft.ownerOf(saleTokenId);
  if (owner.toLowerCase() !== buyer.address.toLowerCase()) {
    throw new Error(`Unexpected owner after sale: ${owner}`);
  }

  console.log(`finalized sale token #${saleTokenId.toString()} to ${buyer.address}`);
  console.log("live smoke passed");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
