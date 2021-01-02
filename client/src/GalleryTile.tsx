import React from 'react'
import NFT, { NFTData } from 'stellar-nft';
import IPFSImage from './IPFSImage';

export default function GalleryTile(props: { nft: NFTData }) {
  return <IPFSImage cid={props.nft.ipfsKey} />
}
