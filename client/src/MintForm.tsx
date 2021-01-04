import React, { useRef, useState } from "react";
import { FileDrop } from "react-file-drop";
import NFT from "stellar-nfts";
import { signTransaction } from "@stellar/freighter-api";
import "./Mint.css";
import { useAuger } from "auger-state";
import store from "./Store";

export default function Mint() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [bytes, setBytes] = useState<ArrayBuffer | undefined>(undefined);
  const [imageURL, setImageURL] = useState<string | undefined>(undefined);
  const [logs, setLogs] = useState<string[]>([]);
  const auger = useAuger(store);
  const { publicKey } = auger.account.$read();

  const onFileInputChange = (event: any) => {
    const { files } = event.target;
    onDrop(files, undefined);
  };
  const onTargetClick = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };
  const onDrop = async (
    files: FileList | null,
    event: React.DragEvent | undefined
  ) => {
    if (!files || !files[0]) return;
    const reader = new FileReader();
    reader.onload = () => {
      let bytes = reader.result as ArrayBuffer;
      let imageURL = window.URL.createObjectURL(new Blob([bytes]));
      setBytes(bytes);
      setImageURL(imageURL);
    };
    reader.readAsArrayBuffer(files[0]);
  };

  const mint = () => {
    if (!bytes) {
      alert("No image to mint");
      return;
    }
    NFT.mint(
      {
        bytes,
        receiverKey: publicKey!,
        ipfsClientURL: "http://10.0.0.190:5001",
      },
      async (txXdr) => {
        const signedXDR = await signTransaction(txXdr);
        return signedXDR;
      },
      (log: string) => {
        setLogs((logs) => [...logs, log]);
      }
    );
  };

  let dropContent = imageURL ? (
    <img alt="to be uploaded" src={imageURL} />
  ) : (
    <div className="file-drop-message">Drop image</div>
  );

  const logView = logs.length > 0 && (
    <div className="logs">
      <h3>Logs</h3>
      {logs.map((log) => (
        <div>{log}</div>
      ))}
    </div>
  );

  return (
    <div>
      <div className="mint-form">
        <h2>Tokenize a piece of artwork on the Stellar blockchain</h2>
        <FileDrop onDrop={onDrop} onTargetClick={onTargetClick}>
          {dropContent}
        </FileDrop>
        <button onClick={mint}>Mint</button>
      </div>
      <input
        onChange={onFileInputChange}
        ref={fileInputRef}
        type="file"
        className="hidden"
      />

      {logView}
    </div>
  );
}
