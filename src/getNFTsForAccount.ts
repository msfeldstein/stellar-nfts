import * as StellarSdk from 'stellar-sdk'
import bs58 from 'bs58'
import { NFTData } from "./types"

export default async function getNFTsForAccount(accountId: string) {
  const server = new StellarSdk.Server("https://horizon-testnet.stellar.org");

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
    // We assume the 1220 (Qm) prefix for all ipfs addresses
    const base64Memo = '1220' + transaction.hash
    const bytes = Uint8Array.from(Buffer.from(base64Memo, 'hex'))
    const ipfsKey = bs58.encode(bytes)

    return {
      ipfsKey,
      owner: accountId,
      creator: "Unknown"
    }
  }))

  return NFTDatas
}
