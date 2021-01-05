import {
  Asset,
  Networks,
  Operation,
  Server,
  Transaction,
  TransactionBuilder,
} from "stellar-sdk";
import { SigningCallback } from "./types";

type MakeOfferParams = {
  tokenIssuer: string;
  offeringAccount: string;
  xlmAmount: string;
  mainNet?: boolean;
};
export default async function makeOffer(
  params: MakeOfferParams,
  signingCallback: SigningCallback
) {
  const horizon = params.mainNet
    ? "https://horizon.stellar.org"
    : "https://horizon-testnet.stellar.org";
  const passphrase = params.mainNet ? Networks.PUBLIC : Networks.TESTNET;
  const server = new Server(horizon);
  const account = await server.loadAccount(params.offeringAccount);
  const fee = await server.fetchBaseFee();
  const asset = new Asset("NFT", params.tokenIssuer);

  const tx = new TransactionBuilder(account, {
    fee: fee.toString(),
    networkPassphrase: passphrase,
  })
    .addOperation(
      Operation.changeTrust({
        asset,
      })
    )
    .addOperation(
      Operation.manageBuyOffer({
        buyAmount: "0.0000001",
        buying: asset,
        selling: Asset.native(),
        price: { n: Math.floor(parseFloat(params.xlmAmount) * 10000000), d: 1 },
      })
    )
    .setTimeout(30)
    .build();

  const signedXDR = await signingCallback(tx.toXDR());
  const signedTx = new Transaction(signedXDR, passphrase);
  try {
    const response = await server.submitTransaction(signedTx);
    console.log("Successfully created buy offer");
    console.log(response);
  } catch (e) {
    console.error(
      "Error submitting stellar tx" +
        JSON.stringify(e.response.data.extras.result_codes, null, 2)
    );
    throw e;
  }
  return true;
}
