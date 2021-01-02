export type NFTData = {
  ipfsKey: string,
  // Stellar account of current owner of the token
  owner: string,
  // Stellar account of artist who created the media backing the token
  creator: string,
  // Stellar account of the service that minted the token
  minter: string,
  // Stellar account of the asset issuer
  assetIssuer: string
}
