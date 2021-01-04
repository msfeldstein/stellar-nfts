import { Asset, Server } from "stellar-sdk";

export default async function getOffers(
  tokenIssuer: string,
  mainNet: boolean = false
) {
  const horizon = mainNet
    ? "https://horizon.stellar.org"
    : "https://horizon-testnet.stellar.org";
  const server = new Server(horizon);
  const offers = await server
    .offers()
    .buying(new Asset("NFT", tokenIssuer))
    .order("desc")
    .call();
  return offers.records.map((record) => {
    console.log("Offer", record);
    const price = parseFloat(record.amount);
    return {
      price,
      buyer: record.seller,
    };
  });
}
