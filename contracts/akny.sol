pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/token/ERC721/ERC721Full.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";

/**
 * @title Pausable
 * @dev Base contract which allows children to implement an emergency stop mechanism.
 */
contract Pausable is Ownable {
    event Pause();
    event Unpause();

    bool public paused = false;

    /**
     * @dev modifier to allow actions only when the contract IS paused
     */
    modifier whenNotPaused() {
        require(!paused);
        _;
    }

    /**
     * @dev modifier to allow actions only when the contract IS NOT paused
     */
    modifier whenPaused {
        require(paused);
        _;
    }

    /**
     * @dev called by the owner to pause, triggers stopped state
     */
    function pause() external onlyOwner whenNotPaused returns (bool) {
        paused = true;
        emit Pause();
        return true;
    }

    /**
     * @dev called by the owner to unpause, returns to normal state
     */
    function unpause() external onlyOwner whenPaused returns (bool) {
        paused = false;
        emit Unpause();
        return true;
    }
}

contract ERC721Pausable is Pausable, ERC721Full{
    function approve(address to, uint256 tokenId) public whenNotPaused {
        super.approve(to, tokenId);
    }
    function setApprovalForAll(address to, bool approved) public whenNotPaused {
        super.setApprovalForAll(to, approved);
    }
    function transferFrom(address from, address to, uint256 tokenId) public whenNotPaused {
        super.transferFrom(from, to, tokenId);
    }   
    function safeTransferFrom(address from, address to, uint256 tokenId) public whenNotPaused {
        super.safeTransferFrom(from, to, tokenId);
    }
    function safeTransferFrom(address from, address to, uint256 tokenId, bytes memory data) public whenNotPaused{
        super.safeTransferFrom(from, to, tokenId, data);
    }
}

contract MyERC721 is ERC721Pausable {
    uint private nextTokenId = 0;
    mapping(uint => uint) public cardTypeToCount;
    mapping(uint => uint) public tokenIdToCardId;
    
    constructor (string memory _name, string memory _symbol) public ERC721Full(_name, _symbol){
    }    
    function _setCardId(uint _tokenId, uint _cardType, uint _cardTypeCount) private onlyOwner whenNotPaused{
        require(_exists(_tokenId));
        require(_cardType < 10000);
        uint _cardId = _cardType.mul(100000) + _cardTypeCount;        
        tokenIdToCardId[_tokenId] = _cardId;
    }
    function mintUniqueTokenTo  (
        address _to,
        string calldata  _tokenURI,
        uint  _cardType
    ) external onlyOwner whenNotPaused
    {
        nextTokenId = nextTokenId.add(1);            
        uint _tokenId = nextTokenId;        
        cardTypeToCount[_cardType] = cardTypeToCount[_cardType].add(1);
        uint _cardTypeCount = cardTypeToCount[_cardType];
        _mint(_to, _tokenId);
        _setTokenURI(_tokenId, _tokenURI);
        _setCardId(_tokenId, _cardType, _cardTypeCount);        
    }
}