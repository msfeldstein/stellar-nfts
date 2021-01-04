import ipfsClient from "ipfs-http-client";
import * as StellarSdk from "stellar-sdk";
import bs58 from "bs58";
import { NFTData, SigningCallback } from "./types";

/**
 *
 * @param bytes The content to be uploaded to IPFS and minted with the token
 * @param receiverKey The inital recipient of the token's Stellar public key
 * @param signingCallback A callback that takes a transaction XDR, signs it with the receiver's key, and then returns the signed transaction's XDR
 * @param loggingCallback A callback that lets you get information about the state of the minting process
 */
export default async function mint(
  opts: {
    bytes: ArrayBuffer;
    receiverKey: string;
    ipfsClientURL?: string;
  },
  signingCallback: SigningCallback,
  loggingCallback: ((log: string) => void) | undefined = undefined
): Promise<NFTData> {
  const log = (v: string) => {
    console.log(v);
    if (loggingCallback) {
      loggingCallback(v);
    }
  };
  const networkPassphrase =
    process.env.NETWORK_PASSPHRASE || StellarSdk.Networks.TESTNET;
  log("Operating on network " + networkPassphrase);
  // Upload the content to IPFS. We may want to investigate textile or something
  // to get this up to a pinned service rather than hosting our own.
  const ipfs = ipfsClient({
    url: opts.ipfsClientURL || "http://localhost:5001",
  });

  const file = await ipfs.add({
    content: opts.bytes,
  });
  const contentID: string = file.cid.toString();
  log("Added media to ipfs with cid: " + contentID);

  const horizon =
    process.env.HORIZON_URL || "https://horizon-testnet.stellar.org";
  const server = new StellarSdk.Server(horizon);

  // Create a keypair for the account that will represent the NFT
  // This account will end up locked so we can throw away the private
  // key at the end, but we do need it to sign the minting tx.
  const tokenAccountKP = StellarSdk.Keypair.random();
  log(
    "Created random account to bear NFT provenance: " +
      tokenAccountKP.publicKey()
  );
  // This is the keypair for the account that manages the minting process
  // Since I want to do this all in the browser instead of setting up a backend service
  // we just treat the receiver as the service account.
  // If this were more mature product we'd want the service account to be managed by
  // the website so people don't need to worry about setting up a stellar.toml
  // to give the NFT credibility that its created by the actual artist.
  const serviceAccount = await server.loadAccount(opts.receiverKey);
  log(`Using ${opts.receiverKey.substr(0, 6)} as minting service account`);

  const cidHex = bs58.decode(contentID).toString("hex");
  // All ipfs cid's start with Qm, or `1220` in hex, so we can strip the first 4
  // hex chars out to make it fit in the 32 byte memo.
  const strippedHex = cidHex.substr(4);
  log(
    "Converted IPFS cid to hex string with prefix stripped to add into minting transaction memo: " +
      strippedHex
  );
  const memo = StellarSdk.Memo.hash(strippedHex);
  const asset = new StellarSdk.Asset("NFT", tokenAccountKP.publicKey());

  const fee = await server.fetchBaseFee();
  let mintTx = new StellarSdk.TransactionBuilder(serviceAccount, {
    fee: fee.toString(),
    networkPassphrase,
  })
    .addMemo(memo)
    // Create the account that represents the NFT
    .addOperation(
      StellarSdk.Operation.createAccount({
        destination: tokenAccountKP.publicKey(),
        startingBalance: "1",
      })
    )
    // Add a trustline to the receiving account so it can receive the NFT
    .addOperation(
      StellarSdk.Operation.changeTrust({
        asset,
      })
    )
    // Issue the single stroop token from the NFT account to the receiver account
    .addOperation(
      StellarSdk.Operation.payment({
        source: tokenAccountKP.publicKey(),
        destination: opts.receiverKey,
        amount: ".0000001", // One stroop, the smallest unit of account on Stellar
        asset,
      })
    )
    // Lock the NFT Token account to ensure it can't issue more tokens
    .addOperation(
      StellarSdk.Operation.setOptions({
        source: tokenAccountKP.publicKey(),
        masterWeight: 0,
      })
    )
    .setTimeout(30)
    .build();
  log(`Created transaction to mint NFT`);
  log(
    `>>> createAccount creates the NFT issuer account ${tokenAccountKP.publicKey()}`
  );
  log(`>>> changeTrust to add trustline for asset to receiving account`);
  log(
    `>>> payment to issue the single stroop token from the NFT account to the receiver`
  );
  log(
    `>>> setOptions to remove the master weight and lock the NFT issuing account`
  );
  log(
    `Signing the transaction with the token accounts keypair: ${tokenAccountKP}`
  );
  mintTx.sign(tokenAccountKP);
  log(`Requesting signature from receiver account`);
  const signedXDR = await signingCallback(mintTx.toXDR());
  log(
    `Received signed transaction, submitting to horizon (${server.serverURL.readable()})`
  );

  const singedMintTx = new StellarSdk.Transaction(signedXDR, networkPassphrase);
  try {
    await server.submitTransaction(singedMintTx);
    log("Successfully minted token!");
  } catch (e) {
    log(
      "Error submitting stellar tx" +
        JSON.stringify(e.response.data.extras.result_codes, null, 2)
    );
    throw e;
  }

  return {
    owner: opts.receiverKey,
    ipfsKey: contentID,
    creator: opts.receiverKey,
    minter: opts.receiverKey,
    assetIssuer: tokenAccountKP.publicKey(),
  };
}
