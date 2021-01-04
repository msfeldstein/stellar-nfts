import StellarSdk, { Server } from "stellar-sdk";

const SERVER_URL = "https://horizon-testnet.stellar.org";

type UserInfo = {
  username?: string;
};

export function setUsername(username: string) {}

export async function getUserInfo(publicKey: string): Promise<UserInfo> {
  const server = new Server(SERVER_URL);
  const account = await server.loadAccount(publicKey);
  const base64Username = account.data_attr["username"];
  if (!base64Username) {
    return {};
  }
  const username = base64Username
    ? atob(base64Username)
    : publicKey.substr(0, 6);
  return {
    username: username,
  };
}
