// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

// Admin/ownership like the OZ example
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
// Read/transfer via ERC721 facade exposed at the HTS token EVM address
import {IERC721} from "@openzeppelin/contracts/interfaces/IERC721.sol";

// Hedera HTS system contracts (as in your setup)
// Hedera HTS system contracts (v1, NOT v2)
import {HederaTokenService} from "@hashgraph/smart-contracts/contracts/system-contracts/hedera-token-service/HederaTokenService.sol";
import {IHederaTokenService} from "@hashgraph/smart-contracts/contracts/system-contracts/hedera-token-service/IHederaTokenService.sol";
import {HederaResponseCodes} from "@hashgraph/smart-contracts/contracts/system-contracts/HederaResponseCodes.sol";
import {KeyHelper} from "@hashgraph/smart-contracts/contracts/system-contracts/hedera-token-service/KeyHelper.sol";

/**
 * HTS-backed ERC721-like collection:
 * - Creates the HTS NFT collection in the constructor (like deploying an ERC721).
 * - SUPPLY key = this contract (mint/burn only via contract).
 * - ADMIN key  = this contract (admin updates only via contract).
 * - No PAUSE key (immediately usable after deployment).
 * - Holders use the token’s ERC721 facade directly (SDK or EVM).
 * - Royalty: 10% with 1 HBAR fallback to initialOwner.
 */
contract MyHTSTokenKYC is HederaTokenService, KeyHelper, Ownable {
    // Underlying HTS NFT token EVM address (set during initialize. This is the "ERC721-like" token)
    address public tokenAddress;

    // Cosmetic copies for convenience (optional)
    string public name;
    string public symbol;

    // Small non-empty default metadata for simple mints (<=100 bytes as per HTS limit)
    bytes private constant DEFAULT_METADATA = hex"01";
    uint256 private constant INT64_MAX = 0x7fffffffffffffff;

    event NFTCollectionCreated(address indexed token);
    event NFTMinted(
        address indexed to,
        uint256 indexed tokenId,
        int64 newTotalSupply
    );
    event NFTBurned(uint256 indexed tokenId, int64 newTotalSupply);
    event KYCGranted(address account);
    event KYCRevoked(address account);
    event KYCKeyUpdated(bytes newKey);
    event HBARReceived(address indexed from, uint256 amount);
    event HBARFallback(address sender, uint256 amount, bytes data);
    event HBARWithdrawn(address indexed to, uint256 amount);

    /**
     * Constructor sets ownership.
     * Actual HTS token creation happens in createNFTCollection().
     */
    constructor() Ownable(msg.sender) {}

    /**
     * Creates the HTS NFT collection with custom fees.
     * Can be called exactly once by the owner after deployment.
     *
     * @param _name         Token/collection name
     * @param _symbol       Token/collection symbol
     */
    function createNFTCollection(
        string memory _name,
        string memory _symbol
    ) external payable onlyOwner {
        require(tokenAddress == address(0), "Already initialized");

        name = _name;
        symbol = _symbol;

        // Build token definition
        IHederaTokenService.HederaToken memory token;
        token.name = name;
        token.symbol = symbol;
        token.treasury = address(this);
        token.memo = "";

        // Keys: SUPPLY + ADMIN + KYC -> contractId
        IHederaTokenService.TokenKey[]
            memory keys = new IHederaTokenService.TokenKey[](3);
        keys[0] = getSingleKey(
            KeyType.SUPPLY,
            KeyValueType.CONTRACT_ID,
            address(this)
        );
        keys[1] = getSingleKey(
            KeyType.ADMIN,
            KeyValueType.CONTRACT_ID,
            address(this)
        );
        keys[2] = getSingleKey(
            KeyType.KYC,
            KeyValueType.CONTRACT_ID,
            address(this)
        );
        token.tokenKeys = keys;

        (int rc, address created) = createNonFungibleToken(token);
        require(rc == HederaResponseCodes.SUCCESS, "HTS: create NFT failed");
        tokenAddress = created;

        // KYC the treasury so it may receive and operate on NFTs when KYC is enforced
        int rcTreasuryKyc = grantTokenKyc(tokenAddress, address(this));
        require(
            rcTreasuryKyc == HederaResponseCodes.SUCCESS,
            "HTS: self KYC failed"
        );

        emit NFTCollectionCreated(created);
    }

    // ---------------------------------------------------------------------------
    // ERC721-like minting (admin via Ownable + SUPPLY key on contract)
    // ---------------------------------------------------------------------------

    // Minimal API parity: mintNFT(to) onlyOwner -> returns new tokenId (serial)
    function mintNFT(address to) public onlyOwner returns (uint256) {
        return _mintAndSend(to, DEFAULT_METADATA);
    }

    // Optional overload with custom metadata (<= 100 bytes)
    function mintNFT(
        address to,
        bytes memory metadata
    ) public onlyOwner returns (uint256) {
        require(metadata.length <= 100, "HTS: metadata >100 bytes");
        return _mintAndSend(to, metadata);
    }

    function _mintAndSend(
        address to,
        bytes memory metadata
    ) internal returns (uint256 tokenId) {
        require(tokenAddress != address(0), "HTS: not created");

        // 1) Mint to treasury (this contract)
        bytes[] memory arr = new bytes[](1);
        arr[0] = metadata;
        (int rc, int64 newTotalSupply, int64[] memory serials) = mintToken(
            tokenAddress,
            0,
            arr
        );
        require(
            rc == HederaResponseCodes.SUCCESS && serials.length == 1,
            "HTS: mint failed"
        );

        // 2) Transfer from treasury -> recipient via ERC721 facade
        uint256 serial = uint256(uint64(serials[0]));
        // Recipient must be associated (or have auto-association available)
        IERC721(tokenAddress).transferFrom(address(this), to, serial);

        emit NFTMinted(to, serial, newTotalSupply);
        return serial;
    }

    // ---------------------------------------------------------------------------
    // ERC721Burnable-like flow for holders
    // ---------------------------------------------------------------------------

    // Holder-initiated burn:
    // - User approves this contract for tokenId (approve or setApprovalForAll)
    // - Calls burn(tokenId); contract pulls to treasury and burns via HTS
    // Allows onlyOwner to burn when the NFT is already in treasury,
    // avoiding the need for ERC721 approvals in that case.
    function burnNFT(uint256 tokenId) external {
        require(tokenAddress != address(0), "HTS: not created");

        address owner_ = IERC721(tokenAddress).ownerOf(tokenId);

        // Match ERC721Burnable semantics: only the token owner or an approved operator may trigger burn
        require(
            msg.sender == owner_ ||
                IERC721(tokenAddress).getApproved(tokenId) == msg.sender ||
                IERC721(tokenAddress).isApprovedForAll(owner_, msg.sender),
            "caller not owner nor approved"
        );

        // If not already in treasury, ensure this contract is approved to pull the token and then pull it
        if (owner_ != address(this)) {
            bool contractApproved = IERC721(tokenAddress).getApproved(
                tokenId
            ) ==
                address(this) ||
                IERC721(tokenAddress).isApprovedForAll(owner_, address(this));
            require(contractApproved, "contract not approved to transfer");
            IERC721(tokenAddress).transferFrom(owner_, address(this), tokenId);
        }

        // Burn via HTS (requires token to be in treasury)
        int64[] memory serials = new int64[](1);
        serials[0] = _toI64(tokenId);
        (int rc, int64 newTotalSupply) = burnToken(tokenAddress, 0, serials);
        require(rc == HederaResponseCodes.SUCCESS, "HTS: burn failed");

        emit NFTBurned(tokenId, newTotalSupply);
    }
    function grantKYC(address account) external {
        require(tokenAddress != address(0), "HTS: not created");
        int response = grantTokenKyc(tokenAddress, account);
        require(
            response == HederaResponseCodes.SUCCESS,
            "HTS: grant KYC failed"
        );
        emit KYCGranted(account);
    }

    function revokeKYC(address account) external {
        require(tokenAddress != address(0), "HTS: not created");
        int response = revokeTokenKyc(tokenAddress, account);
        require(
            response == HederaResponseCodes.SUCCESS ||
                response ==
                HederaResponseCodes.ACCOUNT_KYC_NOT_GRANTED_FOR_TOKEN,
            "HTS: revoke KYC failed"
        );
        emit KYCRevoked(account);
    }

    function updateKYCKey(bytes memory newKYCKey) external onlyOwner {
        require(tokenAddress != address(0), "HTS: not created");

        // Create a new TokenKey array with just the KYC key
        IHederaTokenService.TokenKey[]
            memory keys = new IHederaTokenService.TokenKey[](1);
        keys[0] = getSingleKey(KeyType.KYC, KeyValueType.SECP256K1, newKYCKey);

        int responseCode = updateTokenKeys(tokenAddress, keys);
        require(
            responseCode == HederaResponseCodes.SUCCESS,
            "HTS: update KYC key failed"
        );

        emit KYCKeyUpdated(newKYCKey);
    }

    // ---------------------------------------------------------------------------
    // HBAR handling
    // ---------------------------------------------------------------------------

    // Accept HBAR
    receive() external payable {
        emit HBARReceived(msg.sender, msg.value);
    }

    fallback() external payable {
        emit HBARFallback(msg.sender, msg.value, msg.data);
    }

    function withdrawHBAR() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No HBAR to withdraw");
        (bool success, ) = owner().call{value: balance}("");
        require(success, "Failed to withdraw HBAR");
        emit HBARWithdrawn(owner(), balance);
    }

    // --------------------- internal helpers ---------------------
    function _toI64(uint256 x) internal pure returns (int64) {
        require(x <= INT64_MAX, "cast: > int64.max");
        return int64(uint64(x));
    }
}
