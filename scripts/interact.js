const express = require('express')
const app = express()
const { ethers } = require("hardhat");
require("dotenv").config()
const db = require("./database.js")
const process = require('node:process');
const fs = require('node:fs');

app.use(express.json());

app.get('/', async (req, res) => {
  res.send('Hello World!')
})

const contractAddress = process.env.CONTRACT_ADDRESS
const explorer_url = process.env.EXPLORER_URL

process.on('uncaughtException', (err, origin) => {
  fs.writeSync(
    process.stderr.fd,
    `Caught exception: ${err}\n` +
    `Exception origin: ${origin}\n`,
  );
});

app.get('/baseUri', async function (req, res) {
  console.log("baseURI")
  const MyContract = await ethers.getContractFactory("RegularNFT");
  const contract = MyContract.attach(
    contractAddress
  );
  const result = await contract.baseURI()
  res.send(result)
})

app.post('/createWallet', async function (req, res) {
  const data = req.body;
  console.log(data)
  const email = data["email"]
  console.log("createWallet for ", email)
  const wallet = ethers.Wallet.createRandom()
  const text = 'INSERT INTO wallet(email, private_key, pub_key, address, mnemonic) VALUES($1, $2, $3, $4, $5) RETURNING *'
  const values = [email, wallet.privateKey, wallet.publicKey, wallet.address, wallet.mnemonic["phrase"]]  
  await db.client.query(text, values)
  res.send({privateKey: wallet.privateKey, publicKey: wallet.publicKey, address: wallet.address})
})

app.post('/mint', async function (req, res) {
  console.log("mint")
  const data = req.body;
  console.log(data)
  const MyContract = await ethers.getContractFactory("RegularNFT");
  const contract = MyContract.attach(
    contractAddress
  );
  const tokenId = await contract.totalSupply()
  const tx = await contract.mint("0x", data["hotelId"])

  const text = 'INSERT INTO NFT(id, hash, hotel_id) VALUES($1, $2, $3) RETURNING *'
  const values = [tokenId, tx.hash, data["hotelId"]]
  await db.client.query(text, values)

  res.send({tokenId: tokenId.toString(), hash: tx.hash})
})

app.post('/transferTo', async function (req, res) {
  console.log("transferTo")
  const data = req.body;
  console.log(data)
  const MyContract = await ethers.getContractFactory("RegularNFT");
  const contract = MyContract.attach(
    contractAddress
  );
  const tx = await contract.transferTo(data["to"], data["id"])

  const text = 'INSERT INTO Transfer(nft_id, pub_key, hash) VALUES($1, $2, $3) RETURNING *'
  const values = [data["id"], data["to"], tx.hash]
  await db.client.query(text, values)

  res.send({hash: tx.hash, url: explorer_url + tx.hash})
})

app.post('/verifyOwnership', async function (req, res) {
  console.log("verifyOwnership")
  const data = req.body;
  console.log(data)
  let privateKey = data["privateKey"]
  if (privateKey.includes("0x")) {
    privateKey = privateKey.substring(2)
  }
  const wallet = new ethers.Wallet(privateKey)
  const MyContract = await ethers.getContractFactory("RegularNFT");
  const contract = MyContract.attach(
    contractAddress
  );
  const address = await contract.ownerOf(data["id"])
  console.log("address : ", address)
  console.log("wallet.address : ", wallet.address)
  if (wallet.address == address){
    res.send(true)
  }
  else {
    res.send(false)
  }
})

app.listen(8000)