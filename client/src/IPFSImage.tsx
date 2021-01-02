import React, { useEffect, useState } from 'react'
import IPFS from "ipfs-core"
export default function IPFSImage({ cid }: {
  cid
  : string
}) {
  return <img src={`https://ipfs.io/ipfs/${cid}`} />
}
