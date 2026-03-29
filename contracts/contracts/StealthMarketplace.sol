// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {FHE, euint64, ebool, eaddress, InEuint64} from "@fhenixprotocol/cofhe-contracts/FHE.sol";
import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import {ERC721Holder} from "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";

/// @title StealthMarketplace
/// @notice Listings store an encrypted ask (`euint64`). Offers are encrypted; `FHE.gte(offer, price)`
///         drives an encrypted `pendingBuyer` via `FHE.select`. Settlement decrypts the winning buyer
///         off-chain and finalizes on-chain (see Fhenix decrypt-with-proof pattern).
contract StealthMarketplace is ERC721Holder {
    IERC721 public immutable nft;

    struct Listing {
        address seller;
        euint64 price;
        bool active;
        bool bidReceived;
    }

    mapping(uint256 tokenId => Listing) public listings;
    /// @notice Encrypted address selected when `offer >= price` (latest qualifying attempt wins).
    mapping(uint256 tokenId => eaddress) public pendingBuyer;

    event Listed(uint256 indexed tokenId, address indexed seller);
    event PurchaseAttempted(uint256 indexed tokenId, address indexed buyer);
    event SalePrepared(uint256 indexed tokenId);
    event SaleFinalized(uint256 indexed tokenId, address indexed buyer, address indexed seller);
    event ListingCancelled(uint256 indexed tokenId, address indexed seller);

    constructor(address _nft) {
        nft = IERC721(_nft);
    }

    /// @param encPrice Encrypted listing price (uint64 wei; fits ~18 ETH max).
    function listNFT(uint256 tokenId, InEuint64 calldata encPrice) external {
        require(nft.ownerOf(tokenId) == msg.sender, "Stealth: not owner");
        require(!listings[tokenId].active, "Stealth: already listed");

        nft.safeTransferFrom(msg.sender, address(this), tokenId);

        euint64 p = FHE.asEuint64(encPrice);
        FHE.allowThis(p);
        FHE.allowSender(p);

        listings[tokenId] = Listing({seller: msg.sender, price: p, active: true, bidReceived: false});

        pendingBuyer[tokenId] = FHE.asEaddress(address(0));
        FHE.allowThis(pendingBuyer[tokenId]);

        emit Listed(tokenId, msg.sender);
    }

    /// @notice Submit an encrypted offer. Internally uses `FHE.gte(offer, price)` and `FHE.select`
    ///         to update encrypted `pendingBuyer` without revealing either value on-chain.
    function buyNFT(uint256 tokenId, InEuint64 calldata encOffer) external {
        Listing storage li = listings[tokenId];
        require(li.active, "Stealth: not listed");

        euint64 offer = FHE.asEuint64(encOffer);
        FHE.allowThis(offer);

        ebool sufficient = FHE.gte(offer, li.price);
        pendingBuyer[tokenId] = FHE.select(
            sufficient,
            FHE.asEaddress(msg.sender),
            pendingBuyer[tokenId]
        );
        FHE.allowThis(pendingBuyer[tokenId]);

        li.bidReceived = true;
        emit PurchaseAttempted(tokenId, msg.sender);
    }

    /// @notice Seller allows the threshold network to decrypt the encrypted winning buyer for settlement.
    function allowPublicBuyer(uint256 tokenId) external {
        Listing storage li = listings[tokenId];
        require(li.active, "Stealth: not listed");
        require(msg.sender == li.seller, "Stealth: only seller");
        FHE.allowPublic(pendingBuyer[tokenId]);
        emit SalePrepared(tokenId);
    }

    /// @notice Seller may optionally reveal the listing price publicly (selective disclosure).
    function allowPublicPrice(uint256 tokenId) external {
        Listing storage li = listings[tokenId];
        require(li.active, "Stealth: not listed");
        require(msg.sender == li.seller, "Stealth: only seller");
        FHE.allowPublic(li.price);
    }

    /// @notice After decrypting `pendingBuyer` off-chain (`decryptForTx`), the buyer publishes the result.
    /// @dev Sends `msg.value` to the seller as settlement (testnet ETH).
    function finalizeSale(
        uint256 tokenId,
        address buyerPlain,
        bytes calldata buyerSig
    ) external payable {
        Listing storage li = listings[tokenId];
        require(li.active, "Stealth: inactive");

        eaddress pb = pendingBuyer[tokenId];
        FHE.publishDecryptResult(pb, buyerPlain, buyerSig);

        (address decrypted, bool ok) = FHE.getDecryptResultSafe(pb);
        require(ok && decrypted == buyerPlain, "Stealth: bad decrypt");
        require(buyerPlain != address(0), "Stealth: no buyer");
        require(msg.sender == buyerPlain, "Stealth: only buyer");

        li.active = false;

        nft.safeTransferFrom(address(this), buyerPlain, tokenId);

        if (msg.value > 0) {
            (bool sent, ) = payable(li.seller).call{value: msg.value}("");
            require(sent, "Stealth: pay failed");
        }

        emit SaleFinalized(tokenId, buyerPlain, li.seller);
    }

    /// @notice Cancel before any purchase attempt (plaintext guard).
    function cancelListing(uint256 tokenId) external {
        Listing storage li = listings[tokenId];
        require(li.active, "Stealth: not listed");
        require(msg.sender == li.seller, "Stealth: only seller");
        require(!li.bidReceived, "Stealth: has bids");

        li.active = false;
        nft.safeTransferFrom(address(this), li.seller, tokenId);
        emit ListingCancelled(tokenId, li.seller);
    }
}
