import * as StellarSdk from "stellar-sdk";
import bs58 from "bs58";
import { NFTData } from "./types";

// Base64 to Hex
function base64ToHex(str: string): string {
  for (
    var i = 0, bin = atob(str.replace(/[ \r\n]+$/, "")), hex = [];
    i < bin.length;
    ++i
  ) {
    let tmp = bin.charCodeAt(i).toString(16);
    if (tmp.length === 1) tmp = "0" + tmp;
    hex[hex.length] = tmp;
  }
  return hex.join("");
}

export default async function getNFTInfo(
  tokenIssuerId: string,
  horizon: string = "https://horizon-testnet.stellar.org"
): Promise<NFTData> {
  const server = new StellarSdk.Server(horizon);
  const log = (l: string) => {
    console.log(l);
  };

  log(
    "Fetch accounts with trustlines open to the token, in descending order so we make sure we can see who received it most recently"
  );
  const accounts = await server
    .accounts()
    .forAsset(new StellarSdk.Asset("NFT", tokenIssuerId))
    .order("desc") // descending order to make sure we get the latest accounts
    .limit(100) // Eventually we'll need to worry about what happens when over 100 people buy/sell a single token
    .call();

  // The first item should always be the current holder since its in descending order, but to be sure we'll filter through
  const holdingAccount = accounts.records.find((record) => {
    const tokenHoldingBalance = record.balances.find((balance) => {
      if (balance.asset_type === "native") return false;
      return (
        balance.asset_issuer === tokenIssuerId &&
        parseFloat(balance.balance) > 0
      );
    });
    return !!tokenHoldingBalance;
  });

  if (!holdingAccount) throw "No account holds this token";

  log(
    "Fetch payments for the asset in ascending order to make sure we get the issuing transaction as the first tx so we can pull the info we need out of it"
  );
  const payments = await server
    .payments()
    .forAccount(tokenIssuerId)
    .order("asc")
    .call();
  const issuingPayment = payments.records[0];
  log(
    "Fetch the transaction that the issuing payment was part of so we can grab the memo to get the IPFS key"
  );
  const issuingTx = await issuingPayment.transaction();
  const base64Memo = issuingTx.memo!;
  // We assume the 1220 (Qm) prefix for all ipfs addresses
  const hexMemoWithPrefix = "1220" + base64ToHex(base64Memo);

  // Encode the hex cid back into base58 to use with IPFS
  const bytes = Uint8Array.from(Buffer.from(hexMemoWithPrefix, "hex"));
  const ipfsKey = bs58.encode(bytes);

  return {
    owner: holdingAccount.account_id,
    creator: issuingPayment.source_account,
    minter: issuingPayment.source_account,
    ipfsKey: ipfsKey,
    assetIssuer: tokenIssuerId,
  };
}
