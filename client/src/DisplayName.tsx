import React, { useEffect, useState } from "react";
import { getUserInfo } from "./StellarAPI";

export default function DisplayName({ accountId }: { accountId: string }) {
  const [name, setName] = useState(accountId.substr(0, 6));
  useEffect(() => {
    (async function () {
      const info = await getUserInfo(accountId);
      if (info.username) {
        setName(info.username);
      }
    })();
  }, [accountId]);
  return <>{name}</>;
}
