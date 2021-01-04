import React from "react";
import { Offer } from "stellar-nfts";
import DisplayName from "./DisplayName";

export default function OfferRow({ offer }: { offer: Offer }) {
  return (
    <div className="offer-row">
      <DisplayName accountId={offer.buyer} /> offers {offer.price * 10000000}{" "}
      xlm <button className="small">Accept</button>
    </div>
  );
}
