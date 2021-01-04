import React from "react";
import NFT, { NFTData } from "stellar-nfts";
import IPFSImage from "./IPFSImage";
import { Link } from "react-router-dom";
import DisplayName from "./DisplayName";

export default function GalleryTile({ nft }: { nft: NFTData }) {
  return (
    <div className="tile">
      <div>
        <Link to={`/piece/${nft.assetIssuer}`}>
          <IPFSImage cid={nft.ipfsKey} />
        </Link>
      </div>
      <div>
        <span className="creator">Creator</span>
        <span>
          <Link to={`/gallery/${nft.creator}`}>
            {" "}
            <DisplayName accountId={nft.creator} />
          </Link>
        </span>
      </div>
      <div>
        <span className="owner">Owner</span>
        <span>
          <Link to={`/gallery/${nft.owner}`}>
            {" "}
            <DisplayName accountId={nft.owner} />
          </Link>
        </span>
      </div>
    </div>
  );
}
