import type { EIP1193Provider } from "viem";
import { createConfig, http, injected } from "wagmi";

import { monadTestnet } from "./chains";

type InjectedProvider = EIP1193Provider & {
  isBraveWallet?: true;
  isMetaMask?: true;
  providers?: InjectedProvider[];
};

declare global {
  interface Window {
    ethereum?: InjectedProvider;
  }
}

function getInjectedProviders(): InjectedProvider[] {
  if (typeof window === "undefined" || !window.ethereum) {
    return [];
  }

  return window.ethereum.providers?.length
    ? window.ethereum.providers
    : [window.ethereum];
}

export const wagmiConfig = createConfig({
  chains: [monadTestnet],
  connectors: [
    injected({
      target: {
        id: "braveWallet",
        name: "Brave Wallet",
        provider() {
          return getInjectedProviders().find(
            (provider) => provider.isBraveWallet === true,
          );
        },
      },
    }),
    injected({
      target: {
        id: "metaMask",
        name: "MetaMask",
        provider() {
          return getInjectedProviders().find(
            (provider) =>
              provider.isMetaMask === true && provider.isBraveWallet !== true,
          );
        },
      },
    }),
  ],
  multiInjectedProviderDiscovery: false,
  transports: {
    [monadTestnet.id]: http(monadTestnet.rpcUrls.default.http[0]),
  },
});
