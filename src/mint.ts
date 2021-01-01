import IPFS from 'ipfs-core'
import ipfsClient from 'ipfs-http-client'
import * as StellarSdk from 'stellar-sdk'
import bs58 from 'bs58'
import { NFTData } from './types'

export default async function mint(bytes: ArrayBuffer, serviceAccountSecret: string) : Promise<NFTData> {
  // Upload the content to IPFS. We may want to investigate textile or something
  // to get this up to a pinned service rather than hosting our own.
  const ipfs = ipfsClient({
    url: "http://localhost:5001"
  })

  const file = await ipfs.add({
    content: bytes
  })
  console.log("Added ipfs file", file.cid.toString())

  const contentID : string = file.cid.toString()

  if (!process.env.HORIZON_URL) throw "Add a HORIZON_URL to .env file"
  const server = new StellarSdk.Server(process.env.HORIZON_URL)

  // Create a keypair for the account that will represent the NFT
  // This account will end up locked so we can throw away the private
  // key at the end, but we do need it to sign the minting tx.
  const tokenAccountKP = StellarSdk.Keypair.random()
  console.log("Created random account to bear NFT provenance", tokenAccountKP.publicKey())
  // This is the keypair for the account that manages the minting process
  const serviceAccountKP = StellarSdk.Keypair.fromSecret(serviceAccountSecret)
  const serviceAccount = await server.loadAccount(serviceAccountKP.publicKey())

  const cidHex = bs58.decode(contentID).toString('hex')
  // All ipfs cid's start with Qm, or `1220` in hex, so we can strip the first 4
  // hex chars out to make it fit in the 32 byte memo.
  const strippedHex = cidHex.substr(4)
  const memo = StellarSdk.Memo.hash(strippedHex)
  const asset = new StellarSdk.Asset("NFT", tokenAccountKP.publicKey())

  const fee = await server.fetchBaseFee();
  const mintTx = new StellarSdk.TransactionBuilder(serviceAccount, {
    fee: fee.toString(),
    networkPassphrase: process.env.NETWORK_PASSPHRASE || StellarSdk.Networks.TESTNET
  })
    .addMemo(memo)
    // Create the account that represents the NFT
    .addOperation(StellarSdk.Operation.createAccount({
      destination: tokenAccountKP.publicKey(),
      startingBalance: "1",
    }))
    // Add a trustline to the receiving account so it can receive the NFT
    .addOperation(StellarSdk.Operation.changeTrust({
      asset
    }))
    // Issue the single stroop token from the NFT account to the receiver account
    .addOperation(StellarSdk.Operation.payment({
      source: tokenAccountKP.publicKey(),
      destination: serviceAccountKP.publicKey(),
      amount: ".0000001", // One stroop, the smallest unit of account on Stellar
      asset
    }))
    // Lock the NFT Token account to ensure it can't issue more tokens
    .addOperation(StellarSdk.Operation.setOptions({
      source: tokenAccountKP.publicKey(),
      masterWeight: 0
    }))
    .setTimeout(30)
    .build()

  mintTx.sign(serviceAccountKP)
  mintTx.sign(tokenAccountKP)

  try {
    await server.submitTransaction(mintTx)
  } catch (e) {
    console.log("Error submitting stellar tx", e.response.data.extras.result_codes)
    throw e
  }

  return {
    owner: serviceAccountKP.publicKey(),
    ipfsKey: contentID,
    creator: serviceAccountKP.publicKey()
  }
}
