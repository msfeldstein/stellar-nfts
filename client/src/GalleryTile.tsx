import React from "react";
import NFT, { NFTData } from "stellar-nft";
import IPFSImage from "./IPFSImage";

export default function GalleryTile(props: { nft: NFTData }) {
  return (
    <div className="tile">
      <div>
        <IPFSImage cid={props.nft.ipfsKey} />
      </div>
      <div>
        <span className="creator">Creator</span> <span>xxx</span>
      </div>
      <div>
        <span className="owner">Owner</span> <span>xxx</span>
      </div>
    </div>
  );
}
