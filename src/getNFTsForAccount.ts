import * as StellarSdk from 'stellar-sdk'
import bs58 from 'bs58'
import { NFTData } from "./types"

// Base64 to Hex
function base64ToHex(str: string) : string {
    for (var i = 0, bin = atob(str.replace(/[ \r\n]+$/, "")), hex = []; i < bin.length; ++i) {
        let tmp = bin.charCodeAt(i).toString(16);
        if (tmp.length === 1) tmp = "0" + tmp;
        hex[hex.length] = tmp;
    }
    return hex.join("");
}

export default async function getNFTsForAccount(accountId: string, horizon: string = "https://horizon-testnet.stellar.org") {
  const server = new StellarSdk.Server(horizon);

  // Load the account and find all the balances that are NFTs.
  const account = await server.loadAccount(accountId)
  const NFTBalances = account.balances.filter(balance => balance.asset_type !== "native" && balance.asset_code === "NFT")

  // In order to find the metadata about the owned NFTs we need to find the transaction the
  // token was minted in.  This is the first (and should be the only) transaction in the
  // asset issuers history.
  const NFTDatas : NFTData[] = await Promise.all(NFTBalances.map(async (balance) => {
    const issuer = (balance as StellarSdk.Horizon.BalanceLineAsset).asset_issuer
    // We should do some verification that this is a valid NFT: Single TX, memo type 'hash', locked account
    const transactions = await server.transactions().forAccount(issuer).call()
    const transaction = transactions.records[0]
    if (!transaction.memo) throw "No memo on NFT Transaction"
    const base64Memo = transaction.memo
    // We assume the 1220 (Qm) prefix for all ipfs addresses
    const hexMemoWithPrefix = '1220' + base64ToHex(base64Memo)

    // Encode the hex cid back into base58 to use with IPFS
    const bytes = Uint8Array.from(Buffer.from(hexMemoWithPrefix, 'hex'))

    const ipfsKey = bs58.encode(bytes)
    console.log("IPFS")
    return {
      ipfsKey,
      owner: accountId,
      creator: "Unknown"
    }
  }))

  return NFTDatas
}
