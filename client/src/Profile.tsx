import React, { useState } from "react";
import { disconnectFromStellar } from "./Store";
import "./Profile.css";

export default function Profile() {
  const [editing, setEditing] = useState<Boolean>(false);
  const [username, setUsername] = useState<string>("");

  const editUsername = () => setEditing(true);
  const saveUsername = () => {
    setEditing(false);
  };

  const usernameField = editing ? (
    <>
      <input
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      ></input>
      <a href="#" onClick={saveUsername}>
        Save
      </a>
    </>
  ) : (
    <>
      macromeez
      <a href="#" onClick={editUsername}>
        Edit
      </a>
    </>
  );
  return (
    <div className="content profile-form">
      <div>
        <label>Username</label>
        <div>{usernameField}</div>
      </div>
      <div>
        <label>Avatar</label>
        <div>
          <a href="#">Upload</a>
        </div>
      </div>
      <div>
        <a href="#" onClick={disconnectFromStellar}>
          Disconnect
        </a>
      </div>
    </div>
  );
}
