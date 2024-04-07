const { ethers } = require("hardhat");
require("dotenv").config()

async function callMyContract() {
  const contractAddress = process.env.CONTRACT_ADDRESS
  console.log("contract ", contractAddress)
  const MyContract = await ethers.getContractFactory("RegularNFT");
  const contract = MyContract.attach(
    contractAddress
  );

  //console.log(await contract.mintAll("0x", 10))
  console.log(await contract.mint("0x", "Hyatt/bedroom-6"))
  console.log(await contract.mint("0x", "Hyatt/bedroom-7"))
  console.log(await contract.mint("0x", "Hyatt/bedroom-8"))

  //console.log("token id ", await contract.getTokenId("Hyatt/bedroom-1"))
  //console.log("token id ", await contract.getTokenId("Hyatt/bedroom-2"))
}

callMyContract().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});