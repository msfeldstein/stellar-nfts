import React, { useEffect, useState } from 'react';
import NFT, { NFTData } from 'stellar-nft';
import GalleryTile from './GalleryTile';


function GalleryPage() {
  const [data, setData] = useState<NFTData[]>([])
  useEffect(() => {
    async function doFetch() {
      const nfts = await NFT.getNFTsForAccount("GAHFAYFXMAOE223KVUUA42L57HEP3BQ6VJIJ4HUVPWGDFPH2DPM7RTL7")
      setData(nfts)
    }
    doFetch()
  }, [])

  return (
    <div className="GalleryPage">
      <header>
        The Gallery
      </header>
      {data.map(nft => <GalleryTile key={nft.ipfsKey} nft={nft} />)}
    </div>
  );
}

export default GalleryPage;
