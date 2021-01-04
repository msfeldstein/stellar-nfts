export type SigningCallback = (txXdr: string) => Promise<string>;

export type NFTData = {
  ipfsKey: string;
  // Stellar account of current owner of the token
  owner: string;
  // Stellar account of artist who created the media backing the token
  creator: string;
  // Stellar account of the service that minted the token.
  // Currently this is just the creator/receiver but a markeplace
  // could make it easier and mint it for people, and use their own stellar.toml
  // and domain info to make the NFT legit, otherwise its only backed by a random
  // stellar account, and it takes a lot of work to link that to a real world identity
  minter: string;
  // Stellar account of the asset issuer
  assetIssuer: string;
};

// An offer made on a piece of artwork.  The price is in lumens. Most things use stroops, but this api
// wants to use readable numbers instead.
export type Offer = {
  price: number;
  // Stellar account of the person with the offer up
  buyer: string;
};
