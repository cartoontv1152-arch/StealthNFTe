// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC721URIStorage} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/// @title StealthNFT — demo ERC-721 for the confidential marketplace (Sepolia).
contract StealthNFT is ERC721URIStorage, Ownable {
    uint256 private _nextId = 1;

    constructor() ERC721("StealthNFT", "SNFT") Ownable(msg.sender) {}

    function mint(address to, string memory uri) external returns (uint256 id) {
        id = _nextId++;
        _safeMint(to, id);
        _setTokenURI(id, uri);
    }

    function nextTokenId() external view returns (uint256) {
        return _nextId;
    }

    /// @notice Number of minted tokens (ids 1..totalSupply).
    function totalSupply() external view returns (uint256) {
        return _nextId - 1;
    }
}
