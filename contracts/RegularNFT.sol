// SPDX-License-Identifier: MIT

pragma solidity  0.8.19;

import 'hardhat/console.sol';
import '@openzeppelin/contracts/token/ERC721/ERC721.sol';
import '@openzeppelin/contracts/utils/Strings.sol';

string constant name = "Hot3lNFT";
string constant symbol = "HNFT";

contract RegularNFT is ERC721(name, symbol){
    //The library of String operations and used here for uint256
    using Strings for uint256;
    
    //Total Supply of the NFTs, updated only after function mintAll is called
    uint256 public totalSupply;

    //Smart Contract Deployer
    address owner;

    // Struct holding NFT's tokenId and uri
    struct AllMints {
        uint256 _tokenId;
        string _uri;
    }

    // Variable for storing user-defined data type struct
    AllMints saveMint;
    mapping(string => AllMints) public saveMints;

    // This function runs only once at the beginning and running of the contract
    constructor() {
        owner = msg.sender;
    }

    // This enforces that the msg.sender must be same address as the contract owner
    modifier onlyOwner() {
        require(msg.sender == owner, 'Must be RegularNFT deployer');
        _;
    }

    event Mint(address indexed _to, uint256 _tokenId, string _tokenURI);

    // An Internal function overriding the parent function _baseURI() from ERC721 for
    // returning the base URI unto which tokenId is added to give URL of each NFT
    function _baseURI() internal view virtual override returns (string memory) {
        return "https://www.hot3l.io/";
    }
    
    // The publicly viewable function returning the baseURI
    function baseURI() public view returns (string memory) {
        return _baseURI();
    }

    // Mint function for any user aside the owner and address(0) to mint a token.
    // User must send 0.005 ether to mint, and, this is guarded against ReEntrancy
    function mint(bytes memory _data, string memory hotel) public 
    onlyOwner returns (uint256) {
        string memory uri_ = string(
                abi.encodePacked(_baseURI(), hotel, ".jpg")
            );

        uint256 _tokenId = totalSupply;
        saveMint = AllMints(_tokenId, uri_);
        saveMints[uri_] = saveMint;
        _safeMint(msg.sender, _tokenId, _data);
        totalSupply++;
        emit Mint(msg.sender, _tokenId, uri_);
        return _tokenId;
    }

    function getTokenId(string memory hotel) public onlyOwner view returns (AllMints memory) {
         string memory uri_ = string(
                abi.encodePacked(_baseURI(), hotel, ".jpg")
            );
        return saveMints[uri_];
    }

    // Transfers ERC721 token from the caller's address to another address
    function transferTo(address _to, uint256 _tokenId) public payable {
        approve(_to, _tokenId);
        console.log(getApproved(_tokenId));
        safeTransferFrom(msg.sender, _to, _tokenId, "0x");
        console.log('Balance of stakeAddress: %s', this.balanceOf(_to));
    }
}