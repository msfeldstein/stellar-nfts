import { createStore } from "auger-state";
import { getPublicKey } from "@stellar/freighter-api";

const PUBLIC_KEY = "PUBLIC_KEY";

type State = {
  account: {
    publicKey: string | null;
  };
};

const INITIAL_STATE: State = {
  account: {
    publicKey: localStorage.getItem(PUBLIC_KEY),
  },
};

const store = createStore(INITIAL_STATE);

store.subscribe(["account"], () => {
  const newKey = store.getState().account.publicKey;
  if (newKey) {
    localStorage.setItem(PUBLIC_KEY, newKey);
  } else {
    localStorage.removeItem(PUBLIC_KEY);
  }
});

export const connectToStellar = async () => {
  const key = await getPublicKey();
  store.update((state) => {
    state.account.publicKey = key;
  });
};
export const disconnectFromStellar = () => {
  store.update((state) => {
    state.account.publicKey = null;
  });
};

export default store;
