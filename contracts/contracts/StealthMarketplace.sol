// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {FHE, euint64, ebool, eaddress, InEuint64} from "@fhenixprotocol/cofhe-contracts/FHE.sol";
import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import {IERC2981} from "@openzeppelin/contracts/interfaces/IERC2981.sol";
import {ERC721Holder} from "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";
import {IERC165} from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @title StealthMarketplace
/// @notice Listings store encrypted reserve prices and encrypted winning offers. Settlement follows
///         Fhenix's allowPublic + decryptForTx + publishDecryptResult pattern.
contract StealthMarketplace is ERC721Holder, ReentrancyGuard {
    IERC721 public immutable nft;

    struct Listing {
        address seller;
        euint64 reservePrice;
        bool active;
        bool bidReceived;
        bool revealPrepared;
        uint32 bidCount;
        uint64 revealedPrice;
        address revealedBuyer;
    }

    mapping(uint256 tokenId => Listing) public listings;
    /// @notice Encrypted address selected when `offer >= currentWinningOffer`.
    mapping(uint256 tokenId => eaddress) public pendingBuyer;
    /// @notice Encrypted winning offer. Initialized to the encrypted reserve price.
    mapping(uint256 tokenId => euint64) public highestOffer;

    event Listed(uint256 indexed tokenId, address indexed seller, bytes32 reserveHandle);
    event SealedOfferSubmitted(uint256 indexed tokenId, address indexed buyer, uint32 bidCount);
    event SalePrepared(uint256 indexed tokenId, bytes32 buyerHandle, bytes32 offerHandle);
    event SaleFinalized(
        uint256 indexed tokenId,
        address indexed buyer,
        address indexed seller,
        uint64 price,
        address royaltyReceiver,
        uint256 royaltyAmount
    );
    event ListingCancelled(uint256 indexed tokenId, address indexed seller);
    event PriceRevealPrepared(uint256 indexed tokenId, bytes32 reserveHandle);

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

        listings[tokenId] = Listing({
            seller: msg.sender,
            reservePrice: p,
            active: true,
            bidReceived: false,
            revealPrepared: false,
            bidCount: 0,
            revealedPrice: 0,
            revealedBuyer: address(0)
        });

        highestOffer[tokenId] = p;
        FHE.allowThis(highestOffer[tokenId]);
        FHE.allowSender(highestOffer[tokenId]);

        pendingBuyer[tokenId] = FHE.asEaddress(address(0));
        FHE.allowThis(pendingBuyer[tokenId]);

        emit Listed(tokenId, msg.sender, euint64.unwrap(p));
    }

    /// @notice Submit an encrypted offer. The current winner is updated with encrypted comparison
    ///         only; losing bidders are not revealed during settlement.
    function submitSealedOffer(uint256 tokenId, InEuint64 calldata encOffer) public {
        Listing storage li = listings[tokenId];
        require(li.active, "Stealth: not listed");
        require(msg.sender != li.seller, "Stealth: seller cannot bid");

        euint64 offer = FHE.asEuint64(encOffer);
        FHE.allowThis(offer);
        FHE.allowSender(offer);

        ebool sufficient = FHE.gte(offer, highestOffer[tokenId]);
        highestOffer[tokenId] = FHE.select(sufficient, offer, highestOffer[tokenId]);
        pendingBuyer[tokenId] = FHE.select(
            sufficient,
            FHE.asEaddress(msg.sender),
            pendingBuyer[tokenId]
        );

        FHE.allowThis(highestOffer[tokenId]);
        FHE.allowThis(pendingBuyer[tokenId]);

        li.bidReceived = true;
        li.bidCount += 1;
        emit SealedOfferSubmitted(tokenId, msg.sender, li.bidCount);
    }

    /// @notice Backward-compatible alias for the original Wave 2 UI action.
    function buyNFT(uint256 tokenId, InEuint64 calldata encOffer) external {
        submitSealedOffer(tokenId, encOffer);
    }

    /// @notice Seller allows the threshold network to decrypt the encrypted winning buyer for settlement.
    function prepareSaleReveal(uint256 tokenId) public {
        Listing storage li = listings[tokenId];
        require(li.active, "Stealth: not listed");
        require(msg.sender == li.seller, "Stealth: only seller");
        require(li.bidReceived, "Stealth: no bids");

        FHE.allowPublic(pendingBuyer[tokenId]);
        FHE.allowPublic(highestOffer[tokenId]);

        li.revealPrepared = true;
        emit SalePrepared(tokenId, eaddress.unwrap(pendingBuyer[tokenId]), euint64.unwrap(highestOffer[tokenId]));
    }

    /// @notice Backward-compatible alias for the original Wave 2 reveal action.
    function allowPublicBuyer(uint256 tokenId) external {
        prepareSaleReveal(tokenId);
    }

    /// @notice Seller may optionally reveal the listing price publicly (selective disclosure).
    function allowPublicPrice(uint256 tokenId) external {
        Listing storage li = listings[tokenId];
        require(li.active, "Stealth: not listed");
        require(msg.sender == li.seller, "Stealth: only seller");
        FHE.allowPublic(li.reservePrice);
        emit PriceRevealPrepared(tokenId, euint64.unwrap(li.reservePrice));
    }

    /// @notice After decrypting `pendingBuyer` and `highestOffer` off-chain (`decryptForTx`),
    ///         the winning buyer publishes both threshold signatures and settles with ETH.
    function finalizeSale(
        uint256 tokenId,
        address buyerPlain,
        bytes calldata buyerSig,
        uint64 offerPlain,
        bytes calldata offerSig
    ) external payable nonReentrant {
        Listing storage li = listings[tokenId];
        require(li.active, "Stealth: inactive");
        require(li.revealPrepared, "Stealth: reveal not prepared");

        _verifyWinningBuyer(tokenId, buyerPlain, buyerSig);
        _verifyWinningOffer(tokenId, offerPlain, offerSig);

        address seller = li.seller;
        li.active = false;
        li.revealedBuyer = buyerPlain;
        li.revealedPrice = offerPlain;

        nft.safeTransferFrom(address(this), buyerPlain, tokenId);

        (address royaltyReceiver, uint256 royaltyAmount) = _settleFunds(tokenId, seller, uint256(offerPlain));
        emit SaleFinalized(tokenId, buyerPlain, seller, offerPlain, royaltyReceiver, royaltyAmount);
    }

    function _verifyWinningBuyer(uint256 tokenId, address buyerPlain, bytes calldata buyerSig) internal {
        eaddress pb = pendingBuyer[tokenId];
        FHE.publishDecryptResult(pb, buyerPlain, buyerSig);
        (address decrypted, bool ok) = FHE.getDecryptResultSafe(pb);

        require(ok && decrypted == buyerPlain, "Stealth: bad decrypt");
        require(buyerPlain != address(0), "Stealth: no buyer");
        require(msg.sender == buyerPlain, "Stealth: only buyer");
    }

    function _verifyWinningOffer(uint256 tokenId, uint64 offerPlain, bytes calldata offerSig) internal {
        euint64 winningOffer = highestOffer[tokenId];
        FHE.publishDecryptResult(winningOffer, offerPlain, offerSig);
        (uint64 decryptedOffer, bool offerOk) = FHE.getDecryptResultSafe(winningOffer);

        require(offerOk && decryptedOffer == offerPlain, "Stealth: bad offer decrypt");
        require(msg.value >= uint256(offerPlain), "Stealth: insufficient payment");
    }

    function _settleFunds(uint256 tokenId, address seller, uint256 salePrice)
        internal
        returns (address royaltyReceiver, uint256 royaltyAmount)
    {
        (royaltyReceiver, royaltyAmount) = _royaltyInfo(tokenId, salePrice);
        if (royaltyReceiver == seller) {
            royaltyAmount = 0;
        }

        if (royaltyAmount > 0) {
            _sendValue(royaltyReceiver, royaltyAmount);
        }

        _sendValue(seller, salePrice - royaltyAmount);

        uint256 refund = msg.value - salePrice;
        if (refund > 0) {
            _sendValue(msg.sender, refund);
        }
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

    function getListingCore(uint256 tokenId)
        external
        view
        returns (
            address seller,
            bytes32 reserveHandle,
            bool active,
            bool bidReceived,
            bool revealPrepared,
            uint32 bidCount,
            uint64 revealedPrice,
            address revealedBuyer
        )
    {
        Listing storage li = listings[tokenId];
        return (
            li.seller,
            euint64.unwrap(li.reservePrice),
            li.active,
            li.bidReceived,
            li.revealPrepared,
            li.bidCount,
            li.revealedPrice,
            li.revealedBuyer
        );
    }

    function getSettlementHandles(uint256 tokenId)
        external
        view
        returns (bytes32 highestOfferHandle, bytes32 pendingBuyerHandle)
    {
        return (euint64.unwrap(highestOffer[tokenId]), eaddress.unwrap(pendingBuyer[tokenId]));
    }

    function _royaltyInfo(uint256 tokenId, uint256 salePrice) internal view returns (address receiver, uint256 amount) {
        try IERC165(address(nft)).supportsInterface(type(IERC2981).interfaceId) returns (bool supported) {
            if (!supported) {
                return (address(0), 0);
            }

            try IERC2981(address(nft)).royaltyInfo(tokenId, salePrice) returns (address royaltyReceiver, uint256 royaltyAmount) {
                if (royaltyReceiver == address(0) || royaltyAmount >= salePrice) {
                    return (address(0), 0);
                }

                return (royaltyReceiver, royaltyAmount);
            } catch {
                return (address(0), 0);
            }
        } catch {
            return (address(0), 0);
        }
    }

    function _sendValue(address to, uint256 amount) internal {
        if (amount == 0) {
            return;
        }

        (bool sent, ) = payable(to).call{value: amount}("");
        require(sent, "Stealth: pay failed");
    }
}
