// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC721URIStorage} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import {ERC2981} from "@openzeppelin/contracts/token/common/ERC2981.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/// @title StealthNFT
/// @notice ERC-721 collection used by the confidential marketplace. Token metadata can carry
///         public preview data plus privacy commitments, while pricing is handled by CoFHE.
contract StealthNFT is ERC721URIStorage, ERC2981, Ownable {
    uint256 private _nextId = 1;
    uint96 public constant MAX_ROYALTY_BPS = 1_000; // 10%

    mapping(uint256 tokenId => address creator) private _creators;

    event StealthMinted(
        uint256 indexed tokenId,
        address indexed creator,
        address indexed receiver,
        string uri,
        uint96 royaltyBps
    );

    constructor() ERC721("StealthNFT", "SNFT") Ownable(msg.sender) {}

    function mint(address to, string memory uri) external returns (uint256 id) {
        return mintWithRoyalty(to, uri, msg.sender, 500);
    }

    function mintWithRoyalty(
        address to,
        string memory uri,
        address royaltyReceiver,
        uint96 royaltyBps
    ) public returns (uint256 id) {
        require(royaltyBps <= MAX_ROYALTY_BPS, "StealthNFT: royalty too high");

        id = _nextId++;
        _creators[id] = msg.sender;

        _safeMint(to, id);
        _setTokenURI(id, uri);

        if (royaltyReceiver != address(0) && royaltyBps > 0) {
            _setTokenRoyalty(id, royaltyReceiver, royaltyBps);
        }

        emit StealthMinted(id, msg.sender, to, uri, royaltyBps);
    }

    function nextTokenId() external view returns (uint256) {
        return _nextId;
    }

    /// @notice Number of minted tokens (ids 1..totalSupply).
    function totalSupply() external view returns (uint256) {
        return _nextId - 1;
    }

    function creatorOf(uint256 tokenId) external view returns (address) {
        _requireOwned(tokenId);
        return _creators[tokenId];
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721URIStorage, ERC2981)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
