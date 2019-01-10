const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)
const { expect, assert } = chai

var MyERC721 = artifacts.require("MyERC721");

contract('Testing ERC721 contract', function (accounts) {
    let token;
    const name = "BlueCat";
    const symbol = "BCat"

    const account1 = accounts[1]
    const tokenId1 = 1111;
    const tokenUri1 = "This is data for the token 1"; // Does not have to be unique

    const account2 = accounts[2]
    const tokenId2 = 2222;
    const tokenUri2 = "This is data for the token 2"; // Does not have to be unique

    const account3 = accounts[3]
    beforeEach(async () => {
        token = await MyERC721.new(name, symbol)
    })
    it('simple test', async () => {        
        expect(await token.symbol()).to.equal(symbol)
        expect(await token.name()).to.equal(name)
        expect(await token.paused()).to.equal(false)
        await token.pause()
        expect(await token.paused()).to.equal(true)
        await token.unpause()
        expect(await token.paused()).to.equal(false)
        expect((await token.cardTypeToCount(124)).toNumber()).to.equal(0)
        await token.mintUniqueTokenTo(account2,'412',124)
        expect((await token.totalSupply()).toNumber()).to.equal(1)
        expect((await token.cardTypeToCount(124)).toNumber()).to.equal(1)
        console.log((await token.mintUniqueTokenTo(account2,'412',124)).tx)
        expect((await token.totalSupply()).toNumber()).to.equal(2)        
        expect((await token.cardTypeToCount(124)).toNumber()).to.equal(2)
        await token.pause()
        expect(token.mintUniqueTokenTo(account2,'412',124)).to.be.rejectedWith(/VM Exception while processing transaction: revert/)
        await token.unpause()
        expect((await token.cardTypeToCount(124)).toNumber()).to.equal(2)
        expect((await token.tokenIdToCardId(1)).toNumber()).to.equal(12400001)
        expect((await token.tokenIdToCardId(2)).toNumber()).to.equal(12400002)                
    })
    it.skip(' should be able to deploy and mint ERC721 token', async () => {
        token = await MyERC721.new(name, symbol)
        await token.mintUniqueTokenTo(account1, tokenId1, tokenUri1, {from: accounts[0]})

        expect(await token.symbol()).to.equal(symbol)
        expect(await token.name()).to.equal(name)
        const duplicateTokenID = token.mintUniqueTokenTo(account2, tokenId1, tokenUri2) //tokenId
       
        expect(duplicateTokenID).to.be.rejectedWith(/VM Exception while processing transaction: revert/)
        console.log(await token.balanceOf(account2))
        const additionalToken = await token.mintUniqueTokenTo(account2, tokenId2, tokenUri2, {from: accounts[0]})
        expect(Number(await token.totalSupply())).to.equal(2)

        expect(await token.exists(tokenId1)).to.be.true
        expect(await token.exists(tokenId2)).to.be.true
        expect(await token.exists(9999)).to.be.false // Dummy tokenId

        expect(await token.ownerOf(tokenId1)).to.equal(account1)
        expect(await token.ownerOf(tokenId2)).to.equal(account2)
        const unownedTokenId =token.safeTransferFrom(account2, account3, tokenId1, {from: accounts[2]}) // tokenId
        expect(unownedTokenId).to.be.rejectedWith(/VM Exception while processing transaction: revert/)

        const wrongOwner = token.safeTransferFrom(account1, account3, tokenId2, {from: accounts[1]}) // wrong owner
        expect(wrongOwner).to.be.rejectedWith(/VM Exception while processing transaction: revert/)

        // Noticed that the from gas param needs to be the token owners or it fails
        const wrongFromGas =  token.safeTransferFrom(account2, account3, tokenId2, {from: accounts[1]}) // wrong owner
        expect(wrongFromGas).to.be.rejectedWith(/VM Exception while processing transaction: revert/)

        await token.safeTransferFrom(account2, account3, tokenId2, {from: accounts[2]})
        expect(await token.ownerOf(tokenId2)).to.equal(account3)
    })
})