const MyERC721 = artifacts.require("./MyERC721.sol");

module.exports = async function(deployer) {
  await deployer.deploy(MyERC721, "Akny", "AKNY")
  const erc721 = await MyERC721.deployed()
};