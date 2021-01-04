import React from "react";
import "./Mint.css";
import { useAuger } from "auger-state";
import store from "./Store";
import Connect from "./Connect";
import MintForm from "./MintForm";

export default function Mint() {
  const auger = useAuger(store);
  const { publicKey } = auger.account.$read();

  return (
    <div>
      <header>Mint</header>
      <div className="content">{publicKey ? <MintForm /> : <Connect />}</div>
    </div>
  );
}
