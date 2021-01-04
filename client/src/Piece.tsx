import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { NFTData, Offer } from "stellar-nfts/dist";
import getOffers from "stellar-nfts/dist/getOffers";
import makeOffer from "stellar-nfts/dist/makeOffer";
import acceptOffer from "stellar-nfts/dist/acceptOffer";
import getNFTInfo from "stellar-nfts/dist/getNFTInfo";

import Loader from "react-loader-spinner";
import GalleryTile from "./GalleryTile";
import "./Piece.css";
import { signTransaction } from "@stellar/freighter-api";
import { useAuger } from "auger-state";
import store from "./Store";
import OfferRow from "./OfferRow";

export default function Piece() {
  let { token } = useParams<{ token: string }>();
  const [nft, setNFT] = useState<NFTData | null>(null);
  const [offers, setOffers] = useState<Offer[]>([]);
  const auger = useAuger(store);
  const { publicKey } = auger.account.$read();
  const userOwnsPiece = nft && publicKey === nft.owner;
  useEffect(() => {
    (async function load() {
      getNFTInfo(token).then((data) => setNFT(data));
      getOffers(token).then((newOffers) => setOffers(newOffers));
    })();
  }, [token]);
  const loading = (
    <div className="loading-container">
      <Loader type="Rings" color="rgb(61, 61, 61)" />
    </div>
  );

  const startMakeOffer = async () => {
    const amount = prompt("Offer how many XLM for this piece");
    console.log("Start make offer", amount);
    if (!amount || parseFloat(amount) == 0)
      throw "Enter a non-zero amount of lumens to offer";
    await makeOffer(
      {
        xlmAmount: amount,
        tokenIssuer: token,
        offeringAccount: publicKey!,
      },
      async (txXdr) => {
        const signed = await signTransaction(txXdr);
        return signed;
      }
    );
    // window.location.reload();
  };

  const startAcceptOffer = async () => {
    await acceptOffer(
      {
        sellingAccount: publicKey!,
        tokenIssuer: token,
      },
      async (txXdr) => {
        const signed = await signTransaction(txXdr);
        return signed;
      }
    );
    // window.location.reload();
  };

  const makeOfferButton = (
    <button className="large" onClick={startMakeOffer}>
      Make Offer
    </button>
  );

  const acceptOfferButton = (
    <button className="large" onClick={startAcceptOffer}>
      Accept Highest Offer
    </button>
  );

  const offerButton = publicKey && (
    <div className="offer-button-container">
      {userOwnsPiece ? acceptOfferButton : makeOfferButton}
    </div>
  );

  const content = nft && (
    <div className={`piece-content ${userOwnsPiece ? "owned" : ""}`}>
      <div className="piece-tile">
        <GalleryTile nft={nft}></GalleryTile>
      </div>
      <div className="offer-container">
        {offerButton}
        {offers.map((offer) => (
          <OfferRow key={offer.price + offer.buyer} offer={offer} />
        ))}
      </div>
    </div>
  );
  return <div className="content">{content || loading}</div>;
}
