import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import NFT, { NFTData } from "stellar-nfts";
import GalleryTile from "./GalleryTile";
import { useAuger } from "auger-state";
import Store from "./Store";
import "./GalleryPage.css";

function GalleryPage() {
  let { account } = useParams<{ account: string }>();
  const auger = useAuger(Store);
  const { publicKey: yourAccount } = auger.account.$read();
  if (!account && yourAccount) account = yourAccount;
  const [data, setData] = useState<NFTData[]>([]);
  useEffect(() => {
    async function doFetch() {
      const nfts = await NFT.getNFTsForAccount(account);
      setData(nfts);
    }
    doFetch();
  }, [account]);
  const title = account === yourAccount ? "Your Gallery" : "Gallery";
  return (
    <div className="GalleryPage">
      <header>{title}</header>
      <div className="tile-set">
        {data.map((nft) => (
          <GalleryTile key={nft.assetIssuer} nft={nft} />
        ))}
      </div>
    </div>
  );
}

export default GalleryPage;
