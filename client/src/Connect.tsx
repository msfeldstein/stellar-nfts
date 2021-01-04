import React from "react";
import { connectToStellar } from "./Store";
export default function Connect() {
  return (
    <div className="content">
      <a href="#" onClick={connectToStellar}>
        Connect to Stellar
      </a>{" "}
      to mint a new NFT
    </div>
  );
}
