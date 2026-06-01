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
    uint64 public constant SETTLEMENT_GRACE_PERIOD = 2 days;
    uint256 public constant MIN_BID_BOND = 0.001 ether;

    struct Listing {
        address seller;
        euint64 reservePrice;
        bool active;
        bool bidReceived;
        bool revealPrepared;
        uint64 revealPreparedAt;
        uint32 bidCount;
        uint64 revealedPrice;
        address revealedBuyer;
    }

    mapping(uint256 tokenId => Listing) public listings;
    /// @notice Encrypted address selected when `offer >= currentWinningOffer`.
    mapping(uint256 tokenId => eaddress) public pendingBuyer;
    /// @notice Encrypted winning offer. Initialized to encrypted zero so no-sale reveals do not expose the reserve.
    mapping(uint256 tokenId => euint64) public highestOffer;
    /// @notice Refundable/forfeitable fixed bid bonds. Bid values stay encrypted; bonds make spam costly.
    mapping(uint256 tokenId => mapping(address bidder => uint256 amount)) public bidBonds;

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
    event NoSaleClosed(uint256 indexed tokenId, address indexed seller);
    event ExpiredRevealReclaimed(uint256 indexed tokenId, address indexed seller, address indexed buyer, uint256 forfeitedBond);
    event BidBondWithdrawn(uint256 indexed tokenId, address indexed bidder, uint256 amount);
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
            revealPreparedAt: 0,
            bidCount: 0,
            revealedPrice: 0,
            revealedBuyer: address(0)
        });

        highestOffer[tokenId] = FHE.asEuint64(0);
        FHE.allowThis(highestOffer[tokenId]);

        pendingBuyer[tokenId] = FHE.asEaddress(address(0));
        FHE.allowThis(pendingBuyer[tokenId]);

        emit Listed(tokenId, msg.sender, euint64.unwrap(p));
    }

    /// @notice Submit an encrypted offer. The current winner is updated with encrypted comparison
    ///         only; losing bidders are not revealed during settlement.
    function submitSealedOffer(uint256 tokenId, InEuint64 calldata encOffer) public payable {
        Listing storage li = listings[tokenId];
        require(li.active, "Stealth: not listed");
        require(msg.sender != li.seller, "Stealth: seller cannot bid");
        require(!li.revealPrepared, "Stealth: reveal prepared");

        uint256 updatedBond = bidBonds[tokenId][msg.sender] + msg.value;
        require(updatedBond >= MIN_BID_BOND, "Stealth: bid bond required");
        bidBonds[tokenId][msg.sender] = updatedBond;

        euint64 offer = FHE.asEuint64(encOffer);
        FHE.allowThis(offer);
        FHE.allowSender(offer);

        ebool meetsReserve = FHE.gte(offer, li.reservePrice);
        ebool beatsCurrentWinner = FHE.gte(offer, highestOffer[tokenId]);
        ebool sufficient = FHE.and(meetsReserve, beatsCurrentWinner);
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
    function buyNFT(uint256 tokenId, InEuint64 calldata encOffer) external payable {
        submitSealedOffer(tokenId, encOffer);
    }

    /// @notice Seller allows the threshold network to decrypt the encrypted winning buyer for settlement.
    function prepareSaleReveal(uint256 tokenId) public {
        Listing storage li = listings[tokenId];
        require(li.active, "Stealth: not listed");
        require(msg.sender == li.seller, "Stealth: only seller");
        require(li.bidReceived, "Stealth: no bids");
        require(!li.revealPrepared, "Stealth: already prepared");

        FHE.allowPublic(pendingBuyer[tokenId]);
        FHE.allowPublic(highestOffer[tokenId]);

        li.revealPrepared = true;
        li.revealPreparedAt = uint64(block.timestamp);
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

        _verifyWinningBuyerForSettlement(tokenId, buyerPlain, buyerSig);
        _verifyWinningOffer(tokenId, offerPlain, offerSig);

        address seller = li.seller;
        uint256 buyerBond = bidBonds[tokenId][buyerPlain];
        bidBonds[tokenId][buyerPlain] = 0;

        li.active = false;
        li.revealedBuyer = buyerPlain;
        li.revealedPrice = offerPlain;

        nft.safeTransferFrom(address(this), buyerPlain, tokenId);

        (address royaltyReceiver, uint256 royaltyAmount) = _settleFunds(tokenId, seller, uint256(offerPlain));
        if (buyerBond > 0) {
            _sendValue(buyerPlain, buyerBond);
        }
        emit SaleFinalized(tokenId, buyerPlain, seller, offerPlain, royaltyReceiver, royaltyAmount);
    }

    function _verifyWinningBuyerForSettlement(uint256 tokenId, address buyerPlain, bytes calldata buyerSig) internal {
        _verifyBuyerHandle(tokenId, buyerPlain, buyerSig);
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

    /// @notice Close a reveal where no encrypted offer met the reserve. The seller proves the
    ///         revealed buyer handle is the zero address and receives the NFT back.
    function closeNoSale(
        uint256 tokenId,
        address buyerPlain,
        bytes calldata buyerSig
    ) external nonReentrant {
        Listing storage li = listings[tokenId];
        require(li.active, "Stealth: inactive");
        require(li.revealPrepared, "Stealth: reveal not prepared");
        require(msg.sender == li.seller, "Stealth: only seller");

        _verifyNoWinningBuyer(tokenId, buyerPlain, buyerSig);

        address seller = li.seller;
        li.active = false;
        li.revealedBuyer = address(0);
        nft.safeTransferFrom(address(this), seller, tokenId);
        emit NoSaleClosed(tokenId, seller);
    }

    /// @notice If a revealed winning buyer does not settle, the seller can recover the NFT after
    ///         the grace period and claim the winner's bid bond.
    function reclaimExpiredReveal(
        uint256 tokenId,
        address buyerPlain,
        bytes calldata buyerSig
    ) external nonReentrant {
        Listing storage li = listings[tokenId];
        require(li.active, "Stealth: inactive");
        require(li.revealPrepared, "Stealth: reveal not prepared");
        require(msg.sender == li.seller, "Stealth: only seller");
        require(
            block.timestamp > uint256(li.revealPreparedAt) + SETTLEMENT_GRACE_PERIOD,
            "Stealth: grace active"
        );

        _verifyBuyerHandle(tokenId, buyerPlain, buyerSig);
        require(buyerPlain != address(0), "Stealth: no buyer");

        address seller = li.seller;
        uint256 forfeitedBond = bidBonds[tokenId][buyerPlain];
        bidBonds[tokenId][buyerPlain] = 0;
        li.active = false;
        nft.safeTransferFrom(address(this), seller, tokenId);
        if (forfeitedBond > 0) {
            _sendValue(seller, forfeitedBond);
        }
        emit ExpiredRevealReclaimed(tokenId, seller, buyerPlain, forfeitedBond);
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
            uint64 revealPreparedAt,
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
            li.revealPreparedAt,
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

    function getBidBond(uint256 tokenId, address bidder) external view returns (uint256) {
        return bidBonds[tokenId][bidder];
    }

    function withdrawBidBond(uint256 tokenId) external nonReentrant {
        require(!listings[tokenId].active, "Stealth: listing active");

        uint256 amount = bidBonds[tokenId][msg.sender];
        require(amount > 0, "Stealth: no bond");
        bidBonds[tokenId][msg.sender] = 0;

        _sendValue(msg.sender, amount);
        emit BidBondWithdrawn(tokenId, msg.sender, amount);
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

    function _verifyNoWinningBuyer(uint256 tokenId, address buyerPlain, bytes calldata buyerSig) internal {
        _verifyBuyerHandle(tokenId, buyerPlain, buyerSig);
        require(buyerPlain == address(0), "Stealth: winner exists");
    }

    function _verifyBuyerHandle(uint256 tokenId, address buyerPlain, bytes calldata buyerSig) internal {
        eaddress pb = pendingBuyer[tokenId];
        FHE.publishDecryptResult(pb, buyerPlain, buyerSig);
        (address decrypted, bool ok) = FHE.getDecryptResultSafe(pb);

        require(ok && decrypted == buyerPlain, "Stealth: bad decrypt");
    }

    function _sendValue(address to, uint256 amount) internal {
        if (amount == 0) {
            return;
        }

        (bool sent, ) = payable(to).call{value: amount}("");
        require(sent, "Stealth: pay failed");
    }
}
