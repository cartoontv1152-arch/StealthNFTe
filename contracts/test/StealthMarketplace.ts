import { expect } from "chai";
import { getAddress, parseEther } from "ethers";
import hre, { ethers } from "hardhat";
import { Encryptable } from "@cofhe/sdk";

function normalizeDecryptedAddress(value: unknown): string {
  if (typeof value === "string") {
    return getAddress(value);
  }

  const bigintValue = BigInt(value as bigint);
  return getAddress(`0x${bigintValue.toString(16).padStart(40, "0").slice(-40)}`);
}

describe("StealthMarketplace", function () {
  async function deployListedToken() {
    const [, seller, buyer, secondBuyer] = await ethers.getSigners();

    const StealthNFT = await ethers.getContractFactory("StealthNFT");
    const nft = await StealthNFT.deploy();
    await nft.waitForDeployment();

    const StealthMarketplace = await ethers.getContractFactory("StealthMarketplace");
    const marketplace = await StealthMarketplace.deploy(await nft.getAddress());
    await marketplace.waitForDeployment();

    const tokenId = 1n;
    const reservePrice = parseEther("0.10");

    await nft
      .connect(seller)
      .mintWithRoyalty(seller.address, "data:application/json,%7B%22name%22%3A%22Test%22%7D", seller.address, 500);
    await nft.connect(seller).approve(await marketplace.getAddress(), tokenId);

    const sellerClient = await hre.cofhe.createClientWithBatteries(seller);
    const [encryptedReserve] = await sellerClient.encryptInputs([Encryptable.uint64(reservePrice)]).execute();

    await marketplace.connect(seller).listNFT(tokenId, encryptedReserve);

    return { seller, buyer, secondBuyer, nft, marketplace, tokenId, reservePrice };
  }

  it("settles the winning sealed offer with CoFHE decrypt proofs and ERC-2981 royalties", async function () {
    const { seller, buyer, nft, marketplace, tokenId } = await deployListedToken();
    const winningOffer = parseEther("0.14");

    const buyerClient = await hre.cofhe.createClientWithBatteries(buyer);
    const [encryptedOffer] = await buyerClient.encryptInputs([Encryptable.uint64(winningOffer)]).execute();

    await expect(marketplace.connect(buyer).submitSealedOffer(tokenId, encryptedOffer))
      .to.emit(marketplace, "SealedOfferSubmitted")
      .withArgs(tokenId, buyer.address, 1);

    await marketplace.connect(seller).prepareSaleReveal(tokenId);

    const handles = await marketplace.getSettlementHandles(tokenId);
    const offerResult = await buyerClient.decryptForTx(handles[0]).withoutPermit().execute();
    const buyerResult = await buyerClient.decryptForTx(handles[1]).withoutPermit().execute();
    const buyerPlain = normalizeDecryptedAddress(buyerResult.decryptedValue);

    expect(buyerPlain).to.equal(getAddress(buyer.address));
    expect(offerResult.decryptedValue).to.equal(winningOffer);

    await expect(
      marketplace
        .connect(buyer)
        .finalizeSale(tokenId, buyerPlain, buyerResult.signature, winningOffer, offerResult.signature, {
          value: winningOffer,
        })
    )
      .to.emit(marketplace, "SaleFinalized")
      .withArgs(tokenId, buyer.address, seller.address, winningOffer, seller.address, 0);

    expect(await nft.ownerOf(tokenId)).to.equal(buyer.address);

    const finalState = await marketplace.getListingCore(tokenId);
    expect(finalState[2]).to.equal(false);
    expect(finalState[7]).to.equal(winningOffer);
    expect(finalState[8]).to.equal(buyer.address);
  });

  it("rejects new sealed offers once seller prepares the reveal", async function () {
    const { seller, buyer, secondBuyer, marketplace, tokenId } = await deployListedToken();
    const buyerClient = await hre.cofhe.createClientWithBatteries(buyer);
    const [encryptedOffer] = await buyerClient.encryptInputs([Encryptable.uint64(parseEther("0.14"))]).execute();
    await marketplace.connect(buyer).submitSealedOffer(tokenId, encryptedOffer);
    await marketplace.connect(seller).prepareSaleReveal(tokenId);

    const secondBuyerClient = await hre.cofhe.createClientWithBatteries(secondBuyer);
    const [lateOffer] = await secondBuyerClient.encryptInputs([Encryptable.uint64(parseEther("0.20"))]).execute();

    await expect(marketplace.connect(secondBuyer).submitSealedOffer(tokenId, lateOffer)).to.be.revertedWith(
      "Stealth: reveal prepared"
    );
  });

  it("lets the seller close a reveal when no offer meets the reserve", async function () {
    const { seller, buyer, nft, marketplace, tokenId } = await deployListedToken();
    const buyerClient = await hre.cofhe.createClientWithBatteries(buyer);
    const [belowReserveOffer] = await buyerClient.encryptInputs([Encryptable.uint64(parseEther("0.01"))]).execute();

    await marketplace.connect(buyer).submitSealedOffer(tokenId, belowReserveOffer);
    await marketplace.connect(seller).prepareSaleReveal(tokenId);

    const handles = await marketplace.getSettlementHandles(tokenId);
    const sellerClient = await hre.cofhe.createClientWithBatteries(seller);
    const buyerResult = await sellerClient.decryptForTx(handles[1]).withoutPermit().execute();
    const buyerPlain = normalizeDecryptedAddress(buyerResult.decryptedValue);

    expect(buyerPlain).to.equal("0x0000000000000000000000000000000000000000");
    await expect(marketplace.connect(seller).closeNoSale(tokenId, buyerPlain, buyerResult.signature))
      .to.emit(marketplace, "NoSaleClosed")
      .withArgs(tokenId, seller.address);

    expect(await nft.ownerOf(tokenId)).to.equal(seller.address);
    const finalState = await marketplace.getListingCore(tokenId);
    expect(finalState[2]).to.equal(false);
  });

  it("lets the seller reclaim an expired reveal if the winner does not settle", async function () {
    const { seller, buyer, nft, marketplace, tokenId } = await deployListedToken();
    const buyerClient = await hre.cofhe.createClientWithBatteries(buyer);
    const [encryptedOffer] = await buyerClient.encryptInputs([Encryptable.uint64(parseEther("0.14"))]).execute();

    await marketplace.connect(buyer).submitSealedOffer(tokenId, encryptedOffer);
    await marketplace.connect(seller).prepareSaleReveal(tokenId);

    const gracePeriod = await marketplace.SETTLEMENT_GRACE_PERIOD();
    await ethers.provider.send("evm_increaseTime", [Number(gracePeriod) + 1]);
    await ethers.provider.send("evm_mine", []);

    await expect(marketplace.connect(seller).reclaimExpiredReveal(tokenId))
      .to.emit(marketplace, "ExpiredRevealReclaimed")
      .withArgs(tokenId, seller.address);

    expect(await nft.ownerOf(tokenId)).to.equal(seller.address);
  });
});
