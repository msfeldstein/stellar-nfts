import {
  Asset,
  Networks,
  Operation,
  Server,
  Transaction,
  TransactionBuilder,
} from "stellar-sdk";
import getOffers from "./getOffers";
import { SigningCallback } from "./types";

type MakeOfferParams = {
  tokenIssuer: string;
  sellingAccount: string;
  mainNet?: boolean;
};
export default async function acceptOffer(
  params: MakeOfferParams,
  signingCallback: SigningCallback
) {
  const horizon = params.mainNet
    ? "https://horizon.stellar.org"
    : "https://horizon-testnet.stellar.org";
  const passphrase = params.mainNet ? Networks.PUBLIC : Networks.TESTNET;
  const server = new Server(horizon);

  const offers = await getOffers(params.tokenIssuer);
  console.log("PRICE", offers[0]);
  return;
  const account = await server.loadAccount(params.sellingAccount);
  const fee = await server.fetchBaseFee();
  const asset = new Asset("NFT", params.tokenIssuer);
  const tx = new TransactionBuilder(account, {
    fee: fee.toString(),
    networkPassphrase: passphrase,
  })
    .addOperation(
      Operation.manageSellOffer({
        buying: Asset.native(),
        selling: asset,
        amount: "0.0000001",
        // TODO we should pull the highest offer and use that limit, but
        // in the sake of time im just setting the price to 0 and it will match the highest offer.
        // Hopefully it doesn't get cancelled in the meantime.
        price: offers[0].price,
      })
    )
    .setTimeout(30)
    .build();

  const signedXDR = await signingCallback(tx.toXDR());
  const signedTx = new Transaction(signedXDR, passphrase);
  try {
    await server.submitTransaction(signedTx);
    console.log("Successfully filled offer", ``);
    console.log("");
  } catch (e) {
    console.error(
      "Error submitting stellar tx" +
        JSON.stringify(e.response.data.extras.result_codes, null, 2)
    );
    throw e;
  }
  return true;
}
